import React from 'react'
import {Modal, Drawer, Form, Button, Col, Row, Input, Select, message, } from 'antd';
import {
  deleteEndPoints,
  queryEndPoints,
  createEndPoints, downEnpointTemp,
} from 'services/endpointApi'
import {ACGrid, DateCell, Title, SearchBar} from 'acom'
import { AgHeader, Fm, injectIntl} from 'acom/Intl'
import {connect} from "dva";
import LinkCell from './linkCell'
import {LinkStatus, ActiveStatusCell, AlertStatus} from './Components'
import CellMenu from './rowMenu'
import assign from "lodash/assign";
import {parsePage, log} from "utils";
import SearchMenu from './SearchMenu'
import moment from 'moment'
import {ACInput, ACSelect} from "acom/Form";
import {MetaInput, IconFont} from "components";
import {checkPermisson} from 'utils/Authorized'
import {CheckboxHeader} from "acom/AC-grid/HeaderComponents";
const confirm = Modal.confirm
const Option = Select.Option;
const TextArea = Input.TextArea

@injectIntl()
@connect(({ global, user, specifications, projects, tenants, accts}) => ({
  onXHR: global.onXHR,
  user,
  specifications,
  projects,
  tenants,
  accts,
}))
@Form.create()
export default class Endpoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createDrawerShow: false,
      searchMenu: null,
      searchId: '',
      specifications: [],
      projects: [],
      accts: [],
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
    this.selectedRows = []
  }

  msg = this.props.intl.messages

  columnDefs = [{
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    checkboxSelection: true,
    headerComponent: 'CheckboxHeader'
  },{
    cellRenderer: 'cellMenu',
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
  },{
    field: 'id',
    filter: 'agTextColumnFilter',
    cellRenderer: 'linkCell',
    headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
  }, {
    field: 'specification.name',
    headerComponentParams: { fm: {id: "specification.common.specification", defaultMessage: "规格"} },
  }, {
    field: "project.name",
    headerComponentParams: { fm: {id: "trigger.triggerRule.siteName", defaultMessage: "项目名称"} },
  }, {
    field: "assignment.assetDto.name",
    headerComponentParams: { fm: {id: "endpoint.common.assignAsset", defaultMessage: "关联资产"} },
  }, {
    field: "assignment.status",
    cellRenderer: 'activeStatusCell',
    headerComponentParams: { fm: {id: "endpoint.common.associateStatus", defaultMessage: "关联状态"} },
  }, {
    headerName: '连接状态', field: "status", cellRenderer: 'linkStatus',
    headerComponentParams: { fm: {id: "common.connectStatus", defaultMessage: "连接状态"} },
  }, {
    headerName: '警告状态', field: "alertStatus", cellRenderer: 'alertStatus',
    headerComponentParams: { fm: {id: "common.alertStatus", defaultMessage: "告警状态"} },
  }, {
    headerName: '创建时间', field: "createdTime", cellRenderer: 'dateCell',
    headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
  },
  ];

  defaultColDef = {
    // suppressSizeToFit: true,
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  agComponents = {
    activeStatusCell: ActiveStatusCell,
    linkCell: LinkCell,
    dateCell: DateCell,
    linkStatus: LinkStatus,
    alertStatus: AlertStatus,
    cellMenu: CellMenu,
    agColumnHeader: AgHeader,
    CheckboxHeader: CheckboxHeader
  }

  showCreateDrawer = () => {
    this.setState({
      createDrawerShow: true,
    });
  };

  closeCreateDrawer = () => {
    this.setState({
      createDrawerShow: false,
    });
  };

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndPoints(pageParams)
          .then((res) => {
            console.log("终端", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  componentDidMount () {
    const { dispatch } = this.props;
    if(this.props.user.level > 1){
      dispatch({type: 'specifications/fetch'});
      dispatch({type: 'projects/fetch'});
      dispatch({type: 'accts/fetch'});
    }else{
      dispatch({type: 'tenants/fetch'});
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){

  }

  hdlSubmit = (e) => {
    e.preventDefault();
    let error;let formValues;let meta;
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
    })
    if(error){
      console.log('error', error)
      return
    }
    let metaData = {}
    if(meta){
      for (let v of meta) {
        metaData[`${v[0]}`] = v[1]
      }
    }
    createEndPoints({
      ...formValues,
      metaData,
    })
      .then(res => {
        log.info("创建终端：", res)
        if(res.status === 201){
          this.closeCreateDrawer()
          this.gridApi.refreshInfiniteCache();
          message.success(this.msg['alert.createSuccess'])
        }
      })
  }

  hdlSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
      }
    });
  }

  hdlAdvanceSearch = (values) => {
    delete this.pageParams.id
    delete this.pageParams.projectToken
    delete this.pageParams.specToken
    delete this.pageParams.assignToken
    delete this.pageParams.startDate
    delete this.pageParams.endDate
    if(values.timeRange){
      values.startDate = moment(values.timeRange[0]).format("YYYY-MM-DD HH:mm:ss")
      values.endDate = moment(values.timeRange[1]).format("YYYY-MM-DD HH:mm:ss")
    }
    assign(this.pageParams, values)
    delete this.pageParams.timeRange
    if(this.pageParams.tenantId === undefined){
      delete this.pageParams.tenantId
    }
    this.gridApi.refreshInfiniteCache();
  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'specifications/fetch', payload:{tenantId:e}});
    dispatch({type: 'projects/fetch', payload:{tenantId:e}});
    dispatch({type: 'accts/fetch', payload:{tenantId:e}});
  }

  hdlIdChange = (v) => {
    this.setState({searchId: v})
  }

  hdlSearchId = (searchId) => {
    this.pageParams.id = searchId
    let thiz = this
    thiz.gridApi.refreshInfiniteCache();
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  hdlDeleteRow = () => {
    if(this.selectedRows.length < 1){
      message.error(this.msg['common.atLeastOne'], 3,)
    }else{
      let selectedRows = this.selectedRows.map(row => {
        return {id:row.id,tenantId:row.tenantId}
      })
      let thiz = this
      confirm({
        title: this.msg['alert.delete'],
        okText: this.msg['common.confirm'],
        okType: 'danger',
        cancelText: this.msg['common.cancel'],
        onOk() {
          deleteEndPoints(selectedRows)
            .then(res => {
              console.log("删除终端：", res)
              thiz.gridApi.deselectAll()
              thiz.gridApi.refreshInfiniteCache();
            })
        },
      });
    }
  }

  hdlDownTmp = () => {
    downEnpointTemp()
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(this.msg['alert.passwordnotmatch']);
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  render () {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              {checkPermisson("WEB_ENDPOINT:CREATE",(
                <Button type="primary" icon="plus" size="small" className={"mr10"} onClick={this.showCreateDrawer}>
                  <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
                </Button>
              ))}
              {checkPermisson("WEB_ENDPOINT:DELETE",(
                <Button type="danger" icon="minus" size="small" className={"mr10"} onClick={this.hdlDeleteRow}>
                  <Fm id="common.delete" tagName="span" defaultMessage="删除" />
                </Button>
              ))}


              <Button type="primary" size="small" className={"mr10"} onClick={this.hdlDownTmp}>
                <Fm id="provision.templateDownload" tagName="span" defaultMessage="模板下载" />
              </Button>
            </Col>
            <Col span={12}>
              <Button size="small" className="fr"><IconFont type="icon-shezhi" /></Button>
              <Button size="small" className="fr mr10"><IconFont type="icon-daochu" /></Button>
              <Button size="small" className="fr mr10 ml10"><IconFont type="icon-shuaxin" /></Button>
              <SearchBar
                className="mr10"
                size="small"
                style={{width: '350px', float: 'right'}}
                placeholder={`${this.msg['endpoint.common.searchEndpoint']} ID`}
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
        <div className="content-content ">

          <ACGrid
            columnDefs={this.columnDefs}
            defaultColDef={this.defaultColDef}
            location={this.props.location}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowMultiSelectWithClick={true}
            rowSelection={"multiple"}
          />

        </div>

        <Drawer
          title={<Title className="title">{this.msg['endpoint.common.createendpoint']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDrawer}
          visible={this.state.createDrawerShow}
          width={720}
        >
          <Form layout="vertical" onSubmit={this.hdlSubmit}>
            {this.props.user.level === 1 &&
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={this.msg['common.tenantid']}>
                  {getFieldDecorator('tenantId', {
                    rules: [{ required: true, message: this.msg['alert.common.pleaseChooseTenantIdFirst'] }],
                  })(
                    <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']}
                            onSelect={this.hdlTenantSelect}>
                      {this.props.tenants.map(tenant => {
                        return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            }
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={this.msg['endpoint.common.specificationselect']}>
                  {getFieldDecorator('specToken', {
                    rules: [{ required: true, message: this.msg['endpoint.common.chooseSpecification'] }],
                  })(
                    <Select placeholder={this.msg['endpoint.common.chooseSpecification']}>
                      {this.props.specifications.map(spec => {
                        return (<Option value={spec.token} key={spec.token}>{spec.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={this.msg['endpoint.common.projectSelect']}>
                  {getFieldDecorator('projectToken', {
                    rules: [{ required: true, message: this.msg['endpoint.common.chooseProject'] }],
                  })(
                    <Select placeholder={this.msg['endpoint.common.chooseProject']}>
                      {this.props.projects.map(project => {
                        return (<Option value={project.token} key={project.token}>{project.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={this.msg['user.common.username']}>
                  {getFieldDecorator('username', {
                    rules: [{ required: true, message: this.msg['user.common.inputUserName'] }],
                  })(<Input placeholder={this.msg['user.common.inputUserName']} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={this.msg['batch.endpointId']}>
                  {getFieldDecorator('id', {
                    rules: [
                      { required: true, message: this.msg['common.inputEndpointId'] },
                      {pattern: /^[0-9a-zA-Z_]{1,128}$/g, message: this.msg['alert.inputCharacterNumberUnderline']}
                    ],
                  })(<Input placeholder={this.msg['common.inputEndpointId']} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={this.msg['common.password']}
                >
                  {getFieldDecorator('password', {
                    rules: [{
                      required: true, message: this.msg['user.common.inputPwd'],
                    }, {
                      validator: this.validateToNextPassword,
                    }, {max: 16, message: this.msg['alert.pwdOverLength']
                    }, {pattern: /(?=.*[a-z])(?=.*[#@!~$%^&*])(?=.*[A-Z])[A-Za-z\d#@!~$%^&*]{8,16}/g, message: this.msg['alert.pwdNotAllowed']
                    }],
                  })(
                    <Input type="password" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={this.msg['common.confirmpassword']}
                >
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: this.msg['user.common.inputPwd'],
                    }, {
                      validator: this.compareToFirstPassword,
                    }],
                  })(
                    <Input type="password" onBlur={this.handleConfirmBlur} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
              </Col>
              <Col span={12}>
                <Form.Item label={this.msg['common.description']}>
                  {getFieldDecorator('description', {})(
                    <TextArea placeholder={this.msg['common.pleaseInput']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Title className="title mb24"><Fm id="endpoint.common.simCardInfo" defaultMessage="SIM卡信息" /></Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={this.msg['operator.operatorAccount']}>
                  {getFieldDecorator('acctId')(
                    <ACSelect placeholder={this.msg['common.pleaseChoose']}>
                      {this.props.accts.map(acct => {
                        return (<Option value={acct.id} key={acct.id}>{acct.operatorAcctName}</Option>)
                      })}
                    </ACSelect>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ICCID">
                  {getFieldDecorator('iccid')(
                    <ACInput placeholder={this.msg['common.pleaseInput']} type="number" />
                  )}
                </Form.Item>
              </Col>

            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{this.msg['common.submit']}</Button>
            </Form.Item>
          </Form>

        </Drawer>
      </div>
    )
  }
}

