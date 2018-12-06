import React from 'react'
import {Card, Divider, Spin, Button, Row, Col, Drawer, Form, Input, message, Modal, Icon, Select } from 'antd';
import DescriptionList from 'acom/DescriptionList/index';
import { connect } from 'dva'
import { Log } from 'utils/log'
import TypeCell from './typeCell'
import {ACGrid, DateCell, Title, SearchBar} from 'acom'
import { AgHeader, Fm, injectIntl} from 'acom/Intl'
import {queryEndPointSpecCommands, createEndPointSpecCommand } from 'services/endpointSpecApi'
import {deleteCommand, updateCommand} from 'services/commandApi'
import LinkCell from './linkCellCmd'
import CellMenu from './rowMenuCmd'
import {parsePage} from "utils/grid";
import assign from "lodash/assign";
import SearchMenu from './searchMenuCmd';
import MetaInput from "components/MetaInput";

const { Description } = DescriptionList;
const confirm = Modal.confirm;

@injectIntl()
@connect(({endpointSpec, command}) => ({
  endpointSpec,
  command
}))
@Form.create()
export default class EndpointSpecDetail extends React.Component{
  constructor(props){
    super(props);
    const { intl: {messages} } = this.props;
    this.token = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
    this.state = {
      formDrawerShow: false,
      detailDrawerShow: false,
      formDrawerTitle: messages['specification.command.addcommand'],
      formType: 'add',
      editCmdToken: null,
      context: {
        componentParent: this
      }
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
      token: this.token,
      tenantId: this.tenantId
    }
    this.selectedRows = [];
  }

  columnDefs = [
    {
      cellRenderer: 'cellMenu',
      width: 60,
      cellClass: 'text-center',
      suppressSizeToFit: true,
      headerClass: 'text-center',
      pinned: 'left',
      headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
    }, {
      field: 'name',
      cellRenderer: 'linkCell',
      headerComponentParams: { fm: {id: "specification.command.commandname", defaultMessage: "指令名"} },
    },{
      field: 'namespace',
      headerComponentParams: { fm: {id: "specification.command.namespace", defaultMessage: "命名空间"} }
    }, {
      field: "description",
      headerComponentParams: { fm: {id: "common.description", defaultMessage: "描述"} },
    }, {
      field: "createdTime", 
      cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },
  ];

  defaultColDef = {
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  agComponents = {
    linkCell: LinkCell,
    dateCell: DateCell,
    cellMenu: CellMenu,
    agColumnHeader: AgHeader,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.sizeColumnsToFit();

    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))

        queryEndPointSpecCommands(pageParams)
          .then((res) => {
            Log.debug("规格指令分页", res);
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  showCreateDrawer = () => {
    const { intl: {messages} } = this.props;
    this.setState({
      formDrawerShow: true,
      formDrawerTitle: messages['specification.command.addcommand'],
      formType: 'add'
    });

    const { form } = this.props;
    const { resetFields } = form;

    resetFields();
    // 重置元数据组件数据
    if (this.metaInput) {
      this.metaInput.setDefaultValue([]);
    }
  };

  closeCreateDrawer = () => {
    this.setState({
      formDrawerShow: false,
    });
  };

  showEditDrawer = (token) => {
    const { intl: {messages} } = this.props;
    this.setState({
      formDrawerShow: true,
      formDrawerTitle: messages['specification.command.editcommand'],
      formType: 'edit',
      editCmdToken: token
    });

    const { dispatch, form } = this.props;
    const { setFieldsValue } = form;

    dispatch({
      type: 'command/fetch', 
      payload: {
        token: token,
        tenantId: this.tenantId
      }
    })
    .then(res => {
      const command = res.data;
      setFieldsValue({
        name: command.name,
        namespace: command.namespace,
        description: command.description
      })
      let meta = []
      for (let v of Object.values(JSON.parse(command.metaData))) {
        let key = Object.keys(v)[0]
        meta.push([key, v[key]])
      }
      this.metaInput.setDefaultValue(meta)

      let paras = [];
      let param = JSON.parse(command.param);
      param.forEach((value) => {
        let para = [];
        para.push(value['name']);
        para.push(value['type']);
        para.push(value['required'].toString());
        paras.push(para);
      });
      Log.debug(paras);
      setFieldsValue({
        para: paras
      })
    })
  };

  closeEditDrawer = () => {
    this.setState({
      formDrawerShow: false,
    });
  };

  showViewCommandDrawer = (value) => {
    Log.debug('hdlViewCommand callback: ', value);
    this.setState({
      detailDrawerShow: true
    });

    const { dispatch } = this.props
    dispatch({
      type: 'command/fetch',
      payload: {
        token: value,
        tenantId: this.tenantId
      }
    })
  }

  closeViewCommandDrawer = () => {
    this.setState({
      detailDrawerShow: false
    })
  };

  hdlAdvanceSearch = (values) => {
    delete this.pageParams.name
    assign(this.pageParams, values)
    Log.debug(values);
    this.gridApi.refreshInfiniteCache();
  }

  hdlSubmit = (e) => {
    const { intl: {messages} } = this.props;
    e.preventDefault();
    let error;let formValues;let meta = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    });
    this.metaInput.validator((err, data) => {
      if(err){
        error = {
          ...error,
          meta: err,
        }
      }else{
        meta = data
      }
    });

    let paraTransform = [];
    if (this.props.form.getFieldsValue().para) {
      let paraData = this.props.form.getFieldValue('para');
      Log.debug(paraData);
      paraTransform = paraData.map((value) => {
        return {name: value[0], type: value[1], required: value[2]};
      });
      Log.debug(paraTransform);
    }
    if(error){
      Log.error('error', error)
      return
    }

    let metaData = {}
    for (let [i, v] of Object.entries(meta)) {
      metaData[`元数据-${i}`] = {[v[0]]: v[1]}
    }

    delete formValues.para;
    let postData = {
      ...formValues,
      metaData,
      token: this.token,
      param: paraTransform
    }

    if (this.state.formType === 'add') {
      createEndPointSpecCommand(postData)
      .then(res => {
        Log.debug("创建终端规格指令：", res)
        if(res.status === 201){
          this.closeCreateDrawer()
          this.gridApi.refreshInfiniteCache();
        }
      })
    }else {
      postData.token = this.state.editCmdToken;
      postData.tenantId = this.tenantId;
      updateCommand(postData)
      .then(res => {
        if(res.status === 200){
          message.success(messages['common.edit'] + ' ' + messages['common.success']);
        }
      })
    }

  }

  hdlIdChange = (v) => {
    this.setState({searchId: v})
  }

  hdlSearchId = (searchId) => {
    this.pageParams.name = searchId
    this.gridApi.refreshInfiniteCache();
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  hdlDeleteRow = () => {
    const { intl: {messages} } = this.props;
    if(this.selectedRows.length < 1){
      message.error(messages['common.atLeastOne'], 3,)
    }else{
      let [{token}] = this.selectedRows;
      let thiz = this
      confirm({
        title: messages['alert.delete'],
        okText: messages['common.confirm'],
        okType: 'danger',
        cancelText: messages['common.cancel'],
        onOk() {
          deleteCommand(token, thiz.tenantId)
            .then(res => {
              Log.debug("删除指令：", res)
              thiz.gridApi.refreshInfiniteCache();
            })
        },
      });
    }
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch({
      type: 'endpointSpec/fetch',
      payload: {
        token: this.token,
        tenantId: this.tenantId
      }
    })
  }

  componentDidCatch(error, info) {
    Log.error("ui error", error);
  }

  // 处理指令参数表单
  uuid = 100

  addPara = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('param');
    const nextKeys = keys.concat(this.uuid);
    this.uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      param: nextKeys,
    });
  }

  removePara = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('param');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }
    // can use data-binding to set
    form.setFieldsValue({
      param: keys.filter(key => key !== k),
    });
  }

  render(){
    const { intl: {messages} } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let endpointSpec = this.props.endpointSpec;
    let metas = [];
    for (let v of Object.values(JSON.parse(endpointSpec.metaData))) {
      let key = Object.keys(v)[0]
      metas.push(
        <Description key={key} term={`${messages['common.metadata']}-${metas.length+1}`}>{key}:{v[key]}</Description>
      )
    }
    let command = this.props.command;
    let paras = [];
    let param = command.param ? JSON.parse(command.param) : [];
    param.forEach((value, index) => {
      paras.push(
        <Description key={index} term={`${messages['specification.command.param']}-${index+1}`}>{`${messages['specification.command.paramname']}: ${value.name}`},{`${messages['specification.command.paramtype']}: ${value.type}`}</Description>
      )
    });
    let cmdMetas = [];
    let cmdMeta = command.metaData ? JSON.parse(command.metaData) : [];
    for (let v of Object.values(cmdMeta)) {
      let key = Object.keys(v)[0]
      cmdMetas.push(
        <Description key={key} term={`${messages['common.metadata']}-${cmdMetas.length+1}`}>{key}:{v[key]}</Description>
      )
    }

    const Option = Select.Option;
    let paraTypeOptions = [
      {value: 'String'},
      {value: 'Double'},
      {value: 'Float'},
      {value: 'Bool'},
      {value: 'Int32'},
      {value: 'Int64'},
      {value: 'UInt32'}
    ];
    let requiredOptions = [
      {value: 'true'},
      {value: 'false'}
    ];
    getFieldDecorator('param', {initialValue: [1]})
    const paraData = getFieldValue('param');
    const formPara = paraData.map((k, i) => {
      return (
        <Row gutter={8} key={i} type="flex">
          <Col span={7}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`para[${i}][0]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['specification.command.inputParamName'],
                }],
              })(
                <Input placeholder={messages['specification.command.paramname']} />
              )}
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`para[${i}][1]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['specification.command.paramtype'],
                }],
              })(
                <Select placeholder={messages['specification.command.paramtype']}>
                  {paraTypeOptions.map(data => {
                    return (<Option value={data.value} key={data.value}>{data.value}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`para[${i}][2]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['specification.command.chooseRequired'],
                }],
              })(
                <Select placeholder={messages['specification.command.required']}>
                  {requiredOptions.map(data => {
                    return (<Option value={data.value} key={data.value}>{data.value}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          {paraData.length > 1 ? (
            <Col span={3}>
              <Icon
                style={{"fontSize":"20px", "paddingTop":"9px"}}
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={paraData.length === 1}
                onClick={() => this.removePara(k)}
              />
            </Col>
          ) : null}
        </Row>
      )
    })

    return(
      <div>
        { endpointSpec.token ?
          <div>
            <Card bordered={false}>
              <DescriptionList size="large" title={<Title>{messages['specification.common.specificationDetail']}</Title>} style={{ marginBottom: 32 }}>
                <Description term={messages['specification.common.specificationname']}>{endpointSpec.name}</Description>
                <Description term={messages['endpointCategory.endpointCategory']}>{endpointSpec.hardwareName}</Description>
                <Description term={messages['common.token']}>{endpointSpec.token}</Description>
                <Description term={messages['common.type']}><TypeCell value={endpointSpec.containerPolicy} /></Description>
                <Description term={messages['common.createby']}>{endpointSpec.createdBy}</Description>
                {metas}
                <Description term={messages['common.createdtime']}><DateCell value={endpointSpec.createdTime} /></Description>
                <Description term={messages['common.updatedtime']}><DateCell value={endpointSpec.updateTime} /></Description>
              </DescriptionList>
              { false &&
              <Divider style={{ marginBottom: 32 }} />
              }
              { false && <Row>
                <Col span={3} offset={10}>
                  <Button type="primary" className="mauto" onClick={this.props.history.goBack} block>{messages['common.return']}</Button>
                </Col>
              </Row>
              }
            </Card> 
            <Card bordered={false} style={{ marginTop: 12}}>
              <Title>{messages['specification.command.devicecommand']}</Title>

              <div className="flex-content">
                <div className="content-header">
                  <Row>
                    <Col span={12}>
                      <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={this.showCreateDrawer}>
                        <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
                      </Button>
                      <Button type="danger" size="small" icon="minus" onClick={this.hdlDeleteRow}>
                        <Fm id="common.delete" tagName="span" defaultMessage="删除" />
                      </Button>
                    </Col>
                    <Col span={12}>
                      <SearchBar
                        style={{width: '350px', float: 'right'}}
                        placeholder={messages['specification.command.commandname']}
                        size="small"
                        onChange={this.hdlIdChange}
                        value={this.state.searchId}
                        onPressEnter={this.hdlSearchId}
                      >
                        <SearchMenu
                          onIdChange={this.hdlIdChange}
                          searchId={this.state.searchId}
                          onSearch={this.hdlAdvanceSearch} />
                      </SearchBar>
                    </Col>
                  </Row>
                </div>

                <div className="content-content">
                  <ACGrid
                    columnDefs={this.columnDefs}
                    defaultColDef={this.defaultColDef}
                    location={this.props.location}
                    frameworkComponents={this.agComponents}
                    onACGridReady={this.onACGridReady}
                    onSelectionChanged={this.hdlSelectionChanged}
                    rowSelection={"multiple"}
                    context={this.state.context}
                  />
                </div>

                {/* 添加和编辑指令 */}
                <Drawer
                  title={<Title>{this.state.formDrawerTitle}</Title>}
                  placement="right"
                  closable={false}
                  onClose={this.closeCreateDrawer}
                  visible={this.state.formDrawerShow}
                  width={370}
                >
                  <Form layout="vertical" onSubmit={this.hdlSubmit}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label={ messages['specification.command.commandname'] }>
                          {getFieldDecorator('name', {
                            rules: [{ required: true, message: messages['alert.inputrequired'] }],
                          })(
                            <Input type="text" placeholder={messages['alert.inputCorrentCommandName']} />
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label={messages['specification.command.namespace']}>
                          {getFieldDecorator('namespace', {
                          })(
                            <Input type="text" />
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item label={messages['common.description']}>
                          {getFieldDecorator('description', {
                          })(
                            <Input type="text" />
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24}>
                        <div className="ant-form-item-label">
                          <label className="" title={messages['specification.command.param']}>{messages['specification.command.param']}</label>
                        </div>
                        {formPara}
                        <Row>
                          <Col span={24}>
                            <Button type="dashed" onClick={this.addPara} style={{width:"100%", margin: "10px 0 24px"}}>
                              <Icon type="plus" /> {messages['common.addAItem']}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Divider style={{ marginBottom: 32 }} />
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{messages['common.submit']}</Button>
                    </Form.Item>
                  </Form>
                </Drawer>

                {/* 查看指令 */}
                <Drawer
                  title={<Title>{messages['specification.command.commanddetail']}</Title>}
                  placement="right"
                  closable={false}
                  onClose={this.closeViewCommandDrawer}
                  visible={this.state.detailDrawerShow}
                  width={370}
                >
                  <DescriptionList size="large" col="1">
                    <Description term={messages['specification.command.commandname']}>{command.name}</Description>
                    <Description term={messages['specification.command.namespace']}>{command.namespace}</Description>
                    <Description term={messages['common.token']}>{command.token}</Description>
                    {cmdMetas}
                    {paras}
                    <Description term={messages['common.createby']}>{command.createdBy}</Description>
                    <Description term={messages['common.createdtime']}><DateCell value={command.createdTime} /></Description>
                    <Description term={messages['common.updatedtime']}><DateCell value={command.updateTime} /></Description>
                    <Description term={messages['common.description']}>{command.description}</Description>
                  </DescriptionList>
                </Drawer>
              </div>
            </Card> 
          </div>:
          <div className="global-spin">
            <Spin size="large" />
          </div>
        }
      </div>
    )
  }

}
