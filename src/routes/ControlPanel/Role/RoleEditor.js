import { Component } from 'react'
import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Tabs, Tree} from "antd";
import {injectIntl, Fm} from "acom/Intl";
import React from "react";
import {connect} from "dva";
import { CSSTransition } from 'react-transition-group';
import {createRole, queryRoleById, updateRole} from "services/roleApi";
import {queryNavTree, queryResourceAndOperation} from "services/userApi";
import MetaInput from "components/MetaInput";
import {fillNodeParentKeys, filterTreeUnchecked, iterMenuCode} from "utils/utils";
import {log} from 'utils'
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import styles from "./RoleEditor.less";
import {CellCheck} from "./CellRender";
import {Title} from "acom";
import DateCell from "acom/Cell/DateCell";
import DescriptionList from "acom/DescriptionList";
import {LevelFilter} from "routes/ControlPanel/Role/roleUtils";

const TabPane = Tabs.TabPane;
const TreeNode = Tree.TreeNode;
const { Description } = DescriptionList;

@injectIntl()
@connect(({global, navTree}) => ({
  onXHR: global.onXHR,
  navTree,
}))
@Form.create()
export default class RoleEditor extends Component {

  constructor (props) {
    super(props)

    const params = this.props.match.params
    this.editor = false
    if(params.code){
      this.code = params.code
      this.editor = true
    }
    this.detail = false
    if(this.props.match.path.indexOf("detail") > -1){
      this.detail = true
    }
  }

  state = {
    tree: [],
    treeCheckKeys: [],
    operators: [],
    permissionTokens: [],
    rests: [],
    role:{}
  }

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch, form } = this.props
    const { setFieldsValue } = form

    dispatch({type: 'navTree/fetch'})

    let params = this.props.match.params
    if(params.code){
      queryRoleById(params.code)
        .then(res => {
          console.log("获取 role by id", res.data)
          const role = res.data
          setFieldsValue({
            name: role.name,
            level: role.level.toString(),
            tenantId: role.tenantId,
            description: role.description,
          })
          this.setState({role: res.data})
          let meta = []
          for (let v of Object.values(JSON.parse(role.metaData))) {
            let key = Object.keys(v)[0]
            meta.push([key, v[key]])
          }
          this.metaInput.setDefaultValue(meta)
          // console.log(iterMenuCode(role.menuDtos))
          this.setNavTree(null, iterMenuCode(role.menuDtos))
          this.setResAndOpt()
          let permissionTokens = role.permissionDtos.map(v => {
            return v.token
          })
          this.setState({permissionTokens})
          // this.refreshOptTable()
        })
    }

    // this.hdlLvChange("1")
  }



  hdlLvChange = (e) => {
    this.setNavTree(e)
    this.setResAndOpt(e)
  }

  setResAndOpt = (e) => {
    let operators = []; let rests = []
    const { getFieldValue } = this.props.form
    queryResourceAndOperation(e || getFieldValue('level'))
      .then(res => {
        // log.info("resource and operation api:", res.data)
        for (let v of res.data) {
          if(v.resourceCode.indexOf("WEB")){
            rests.push(v)
          }else{
            operators.push(v)
          }
        }
        this.setState({
          operators,
          rests,
        })
        // console.log(operators)
        // console.log(rests)
      })
  }

  hdlPermissionCheck = (key) => {

    let permissionTokens = this.state.permissionTokens
    let index = permissionTokens.indexOf(key)
    if(index > -1){
      permissionTokens.splice(index, 1)
    }else{
      permissionTokens.push(key)
    }
    this.setState({
      permissionTokens: permissionTokens
    })
    if(key.indexOf("WEB") > -1){
      this.refreshOptTable()
    }else{
      this.refreshRestTable()
    }
  }

  hdlSelOptAll = () => {
    let permissionTokens = this.state.permissionTokens.filter(v => v.indexOf("WEB") === -1)
    for (let v of this.state.operators) {
      for (let opt of v.operationCode) {
        if(opt !== ""){
          permissionTokens.push(`${v.resourceCode}_${opt}`)
        }
      }
    }
    this.setState({permissionTokens})
    this.refreshOptTable()
  }

  hdlSelRestsAll = () => {
    let permissionTokens = this.state.permissionTokens.filter(v => v.indexOf("REST") === -1)
    for (let v of this.state.rests) {
      for (let opt of v.operationCode) {
        if(opt !== ""){
          permissionTokens.push(`${v.resourceCode}_${opt}`)
        }
      }
    }
    this.setState({permissionTokens})
    this.refreshRestTable()
  }

  hdlClearSelOpt = () => {
    let permissionTokens = this.state.permissionTokens.filter(v => v.indexOf("WEB") === -1)
    this.setState({permissionTokens})
    this.refreshOptTable()
  }

  hdlClearRestOpt = () => {
    let permissionTokens = this.state.permissionTokens.filter(v => v.indexOf("REST") === -1)
    this.setState({permissionTokens})
    this.refreshRestTable()
  }



  refreshOptTable  = () => {
    var thiz = this
    setTimeout(function () {
      thiz.optGridApi.refreshCells({force: true})
    }, 2)
  }

  refreshRestTable  = () => {
    var thiz = this
    setTimeout(function () {
      thiz.restGridApi.refreshCells({force: true})
    }, 2)
  }

  iterTree = (treeNodes) => {
    return treeNodes.map(node => {
      return (
        <TreeNode title={node.text || node.code} key={node.code} disabled={this.detail}>
          {node.nodes.length > 0 ? this.iterTree(node.nodes) : null}
        </TreeNode>
      )
    })
  }

  setNavTree = (e, defaultKeys) => {
    const { getFieldValue } = this.props.form
    queryNavTree(e || getFieldValue('level'))
      .then( res => {
        // console.log("nav menu", res)
        this.treeData = res.data
        this.setState({
          tree: this.iterTree(res.data)
        })
        if (defaultKeys) {
          let keys = filterTreeUnchecked(defaultKeys, this.treeData)
          // console.log(keys)
          this.setState({
            treeCheckKeys: keys
          })
        }
      })
  }

  hdlTreeCheck = (checkKeys) => {
    this.setState({
      treeCheckKeys: checkKeys
    })
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    // this.metaInput.refTest()
    let error;let formValues;let meta = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    })
    this.metaInput.validator((err, data) => {
      if(err){
        error = {
          ...error,
          meta: err,
        }
      }else{
        meta = data
      }
    })

    if(error){
      console.log('error', error)
      return
    }
    // console.log("校验通过", formValues)
    let metaData = {}
    for (let [i, v] of Object.entries(meta)) {
      metaData[`元数据-${i}`] = {[v[0]]: v[1]}
    }

    let menuCodes = fillNodeParentKeys(this.state.treeCheckKeys, this.treeData)
    let postData = {
      ...formValues,
      menuCodes: menuCodes,
      metaData,
      permissionTokens: this.state.permissionTokens,
    }
    log.info('postData', postData)
    if(this.editor){
      postData.code = this.code
      updateRole(postData)
        .then(res => {
          console.log("编辑角色：", res)
          if (res.status === 200) {
            message.success(this.msg['alert.editSuccess']);
          }
        })
    }else{
      createRole(postData)
        .then(res => {
          console.log("创建角色：", res)
          if (res.status === 201) {
            message.success(this.msg['alert.createSuccess']);
            // this.getMeta()
            this.props.history.goBack()
          }
        })
    }

  }

  tenantIdVerif = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    if(getFieldValue('level') === '2' && !value){
      callback(this.msg['common.pleaseChoose'])
    }
    callback()
  }

  columnDefs = [

  ]

  onGridSizeChanged = (params) => {
    params.api.sizeColumnsToFit();
  }

  onOptGridReady = (params) => {
    this.optGridApi = params.api;
  }

  onRestGridReady = (params) => {
    this.restGridApi = params.api;
  }

  render () {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const Option = Select.Option
    const { TextArea } = Input;
    const role = this.state.role
    return (
      <Card>
        <Form onSubmit={this.hdlSubmit}>
          <DescriptionList size="large"
                           className={!this.detail && "hide"}
                           title={<Title><Fm id="role.viewrole.roledetail" defaultMessage="角色详情" /></Title>}
                           style={{ marginBottom: 12 }}>
            <Description term={this.msg['role.common.rolelevel']}><LevelFilter level={role.level} /></Description>
            <Description term={this.msg['common.tenantid']} className={role.level === 1 && "hide"}>{role.tenantId}</Description>
            <Description term={this.msg['role.common.rolename']}>{role.name}</Description>
            <Description term={this.msg['common.createdtime']}><DateCell value={role.createdTime} /></Description>
            <Description term={this.msg['common.updatedtime']}><DateCell value={role.updateTime} /></Description>
            <Description term={this.msg['common.metadata']} className={role.metaData === "{}" && "hide"}>{role.metaData}</Description>
            <Description term={this.msg['common.description']}>{role.description}</Description>
          </DescriptionList>
          <Row gutter={16} className={this.detail ? "hide" : null}>
            <Col span={8}>
              <Form.Item label={this.msg['role.common.rolelevel']}>
                {getFieldDecorator('level', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <Select placeholder={this.msg['common.pleaseChoose']} onChange={this.hdlLvChange} disabled={this.editor}>
                    <Option value={"1"}><Fm id="common.systemlevel" defaultMessage="系统级" /></Option>
                    <Option value={"2"}><Fm id="common.tenantlevle" defaultMessage="租户级" /></Option>
                    <Option value={"3"}><Fm id="common.projectlevel" defaultMessage="项目级" /></Option>
                  </Select>
                )}
              </Form.Item>
            </Col>

            <CSSTransition in={getFieldValue('level') === "2"} timeout={200}
                           classNames='w1-100' unmountOnExit mountOnEnter>
              <Col span={8} key={1} className="animate">
                <Form.Item label={this.msg['common.tenantid']}>
                  {getFieldDecorator('tenantId', {
                    rules: [{ validator: this.tenantIdVerif,}],
                  })(<Input placeholder={this.msg['common.pleaseInput']} disabled={this.editor} />)}
                </Form.Item>
              </Col>
            </CSSTransition>
            <Col span={8} key={2} className="transAll">
              <Form.Item label={this.msg['role.common.rolename']}>
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: this.msg['common.pleaseInput'] },
                    {pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{1,128}$/g, message: this.msg['alert.inputCorrentName']}
                  ],
                })(<Input placeholder={this.msg['common.pleaseInput']} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} className={this.detail ? "hide" : null}>
            <Col span={12}>
              <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
            </Col>
            <Col span={12}>
              <Form.Item label={this.msg['common.description']}>
                {getFieldDecorator('description', {})(
                  <TextArea placeholder={this.msg['common.description']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Tabs defaultActiveKey="1">
            <TabPane tab={this.msg['role.common.functionMenu']} key="1">
              <Tree
                checkable
                onCheck={this.hdlTreeCheck}
                checkedKeys={this.state.treeCheckKeys}
              >
                {this.state.tree}
              </Tree>
            </TabPane>
            <TabPane tab={this.msg['role.common.webPermission']} key="2">
              <div
                className={`ag-theme-fresh ${styles.agTable}`}
                style={{}}
              >
                {!this.detail &&
                  <Row className="mb10">
                    <Button type="primary" size="small" className="mr10" onClick={this.hdlSelOptAll}>
                      <Fm id="common.allChoose" defaultMessage="全选" /></Button>
                    <Button size="small" onClick={this.hdlClearSelOpt}><Fm id="role.common.clearAll" defaultMessage="清除全部" /></Button>
                  </Row>
                }
                <AgGridReact
                  onGridReady={this.onOptGridReady}
                  rowData={this.state.operators}
                  detail={this.detail}
                  checkList={this.state.permissionTokens}
                  onGridSizeChanged={this.onGridSizeChanged}
                  enableColResize={true}
                  suppressPaginationPanel={true}
                  suppressPropertyNamesCheck={true}
                  domLayout='autoHeight'
                >
                  <AgGridColumn field="resourceName" headerName={this.msg['common.type']}
                                suppressSizeToFit
                                width={264} />
                  <AgGridColumn field="operationCode" index={0}
                                headerName={this.msg['common.create']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={1}
                                headerName={this.msg['common.modify']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={2}
                                headerName={this.msg['common.delete']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={3}
                                headerName={this.msg['common.query']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={4}
                                headerName={this.msg['common.excuteCommand']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={5}
                                headerName={this.msg['endpoint.common.sendSMS']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={6}
                                headerName={this.msg['firmware.pushUpdate']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                </AgGridReact>
              </div>
            </TabPane>
            <TabPane tab={this.msg['role.common.restPermission']} key="3">
              <div
                className={`ag-theme-fresh ${styles.agTable}`}
              >
                {!this.detail &&
                  <Row className="mb10">
                    <Button type="primary" size="small" className="mr10" onClick={this.hdlSelRestsAll}>
                      <Fm id="common.allChoose" defaultMessage="全选"/></Button>
                    <Button size="small" onClick={this.hdlClearRestOpt}>
                      <Fm id="role.common.clearAll" defaultMessage="清除全部"/></Button>
                  </Row>
                }
                <AgGridReact
                  onGridReady={this.onRestGridReady}
                  rowData={this.state.rests}
                  checkList={this.state.permissionTokens}
                  detail={this.detail}
                  onGridSizeChanged={this.onGridSizeChanged}
                  enableColResize={true}
                  suppressPaginationPanel={true}
                  suppressPropertyNamesCheck={true}
                  domLayout='autoHeight'
                >
                  <AgGridColumn field="resourceName" headerName={this.msg['common.type']}
                                suppressSizeToFit
                                width={264} />
                  <AgGridColumn field="operationCode" index={0}
                                headerName={this.msg['common.create']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={1}
                                headerName={this.msg['common.modify']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={2}
                                headerName={this.msg['common.delete']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={3}
                                headerName={this.msg['common.query']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={4}
                                headerName={this.msg['common.excuteCommand']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={5}
                                headerName={this.msg['common.sendSMS']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                  <AgGridColumn field="operationCode" index={6}
                                headerName={this.msg['firmware.pushUpdate']}
                                onCheck={this.hdlPermissionCheck}
                                cellRendererFramework={CellCheck} />
                </AgGridReact>
              </div>
            </TabPane>
          </Tabs>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={this.detail ? 10 : 8} className="text-center">
              <Button type="default" onClick={this.props.history.goBack} block>
                <Fm id="common.goBack" defaultMessage="返回" />
              </Button>
            </Col>
            {!this.detail &&
              <Col span={3} offset={1} className="text-center">
                <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>
                  <Fm id="common.submit" defaultMessage="提交"/>
                </Button>
              </Col>
            }
          </Row>

        </Form>
      </Card>
    )
  }
}
