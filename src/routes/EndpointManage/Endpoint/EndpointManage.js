import React from 'react'
import {Drawer, Form, Button, Col, Row, message, Modal} from 'antd';
import {
  queryEndPoints,
  createEndPoints, batchInvocations, batchUpdate, batchSoftUpdate, deleteEndPoint,
} from 'services/endpointApi'
import {ACGrid, DateCell, Title, SearchBar} from 'acom'
import Tabs from "components/Tabs/Tabs"
import { AgHeader, Fm, injectIntl} from 'acom/Intl'
import {connect} from "dva";
import {RowMenu, LinkCell} from './Cells'
import {LinkStatus, ActiveStatusCell, AlertStatus} from 'routes/Endpoint/Endpoint/Components'
import SearchMenu from 'routes/Endpoint/Endpoint/SearchMenu'
import assign from "lodash/assign";
import {parsePage, log} from "utils";
import moment from 'moment'
import { IconFont } from "components";
import {checkPermisson} from 'utils/Authorized'
import {
  EndAssetBatchRelease,
  EndAssignBatch,
  EndSpecBatch,
  EPGroupBatch
} from "routes/EndpointManage/Endpoint/BatchEditor";
import { CommandBatch } from "./ControlEditor"
import {SendMsgBatch, SoftUpdate, UpdateBatch} from "routes/EndpointManage/Endpoint/ControlEditor";
import {sendMsg} from "services/commandApi";

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm

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
export default class EndpointManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modifyDrawShow: false,
      controlDrawShow: false,
      searchMenu: null,
      searchId: '',
      specifications: [],
      projects: [],
      accts: [],
      selectedRows: [],
      batchEnable: false,
      optModal:{
        visible: false,
        title: "",
        type: "",
        data: {}
      }
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
  }

  msg = this.props.intl.messages

  columnDefs = [{
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    checkboxSelection: true,
    headerComponentParams: { fm: {id: "common.choose", defaultMessage: "选择"} }
  },{
    cellRenderer: 'cellMenu',
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    field: 'id',
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
    cellMenu: RowMenu,
    agColumnHeader: AgHeader,
  }

  hdlDelete = (id, tenantId) => {
    console.log("id",id, tenantId)
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteEndPoint(id, tenantId)
          .then(res => {
            console.log("删除终端：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  showModifyDraw = () => {
    this.setState({
      modifyDrawShow: true,
    });
  };

  closeModifyDraw = () => {
    this.setState({
      modifyDrawShow: false,
    });
  };

  closeAll = () => {
    this.closeModal()
    this.closeControlDraw()
    this.closeModifyDraw()
  }

  showControlDraw = () => {
    this.setState({
      controlDrawShow: true,
    });
  };

  closeControlDraw = () => {
    this.setState({
      controlDrawShow: false,
    });
  }

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
    this.mounted = true;
    const { dispatch } = this.props;
    if(this.props.user.level > 1){
      // dispatch({type: 'specifications/fetch'});
      // dispatch({type: 'projects/fetch'});
      // dispatch({type: 'accts/fetch'});
    }else{
      dispatch({type: 'tenants/fetch'});
    }
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps){

  }

  hdlSubmit = (e) => {
    e.preventDefault();
    const { intl: {messages}} =this.props
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
    for (let v of meta) {
      metaData[`${v[0]}`] = v[1]
    }
    createEndPoints({
      ...formValues,
      metaData,
    })
      .then(res => {
        log.info("创建终端：", res)
        if(res.status === 201){
          this.closeModifyDraw()
          this.gridApi.refreshInfiniteCache();
          message.success(messages['alert.createSuccess'])
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
    let selectedRows = this.gridApi.getSelectedRows()
    let batchEnable = false
    if(selectedRows.length > 0){
      batchEnable = true
      for (let endpoint of selectedRows) {
        if(endpoint.tenantId !== selectedRows[0].tenantId){
          batchEnable = false
        }
      }
    }
    this.mounted && this.setState({
      selectedRows,
      batchEnable,
    })
  }

  hdlBatchEdited = () => {
    this.closeAll()
    this.gridApi.refreshInfiniteCache()
  }

  hdlCommandBatch = (data) => {
    let postData = {
      ...data,
      endpointIds: this.state.selectedRows.map(row => row.id),
      initiator: "REST",
      initiatorId: "supsys",
      target: "Endpoint",
      tenantId: this.state.selectedRows[0].tenantId,
      all: null,
      assignmentToken: null,
      id: null,
      specToken: null,
    }
    batchInvocations(postData)
      .then(res => {
        if(res.status === 201){
          this.closeAll()
          this.gridApi.refreshInfiniteCache();
          message.success(this.msg['common.success'])
        }
      })
  }

  hdlSendMsg = (data) => {
    let smsCreateRequests = this.state.selectedRows.map(endpoint => {
      return {
        acctId: endpoint.acctId,
        iccid: endpoint.iccid,
      }
    })
    let postData = {
      ...data,
      smsCreateRequests,
    }
    sendMsg(postData)
      .then(res => {
        if(res.status === 200){
          this.closeAll()
          this.gridApi.refreshInfiniteCache();
          message.success(this.msg['common.success'])
        }
      })
  }

  hdlUpdate = (data) => {
    let endpointIds = this.state.selectedRows.map(endpoint => {
      return endpoint.id
    })
    let postData = {
      ...data,
      endpointIds
    }
    batchUpdate(postData)
      .then(res => {
        if(res.status === 200){
          this.closeAll()
          this.gridApi.refreshInfiniteCache();
          message.success(this.msg['common.success'])
        }
      })
  }

  hdlSoftUpdate = (data) => {
    let endpointIds = this.state.selectedRows.map(endpoint => {
      return endpoint.id
    })
    let postData = {
      ...data,
      endpointIds
    }
    batchSoftUpdate(postData)
      .then(res => {
        if(res.status === 200){
          this.closeAll()
          this.gridApi.refreshInfiniteCache();
          message.success(this.msg['common.success'])
        }
      })

  }

  showModal = () => {
    this.setState({
      optModal: {...this.state.optModal, visible: true},
    });
  }

  closeModal = (e) => {
    this.setState({
      optModal: {...this.state.optModal, visible: false},
    });
  }

  hdlOpenModal = (type, data) => {
    let optModal = this.state.optModal
    if(type === "command"){
      optModal.title = this.msg['assignment.common.invokecommand']
    }else if(type === "sendMsg"){
      optModal.title = this.msg['endpoint.common.sendSMS']
    }else if(type === "firmwareUpdate"){
      optModal.title = this.msg['endpoint.common.firmwareUpdate']
    }else if(type === "softwareUpdate"){
      optModal.title = this.msg['endpoint.common.softwareUpdate']
    }else if(type === "modifyAssociate"){
      optModal.title = this.msg['endpoint.common.modifyAssociate']
    }
    optModal = {
      ...optModal,
      type,
      data,
      visible: true
    }
    this.setState({optModal})
  }

  gridContext = {
    onDelete: this.hdlDelete,
    onResetPwd: this.hdlResetPwd,
    onOpenModal: this.hdlOpenModal
  }

  render () {
    const { intl: {messages}} = this.props
    let modalContent
    let type = this.state.optModal.type
    if(type === "command"){
      modalContent = <CommandBatch endList={[this.state.optModal.data]} onCommands={this.hdlCommandBatch} />
    }else if(type === "sendMsg"){
      modalContent = <SendMsgBatch endList={[this.state.optModal.data]} onSendMsg={this.hdlSendMsg} />
    }else if(type ===  "firmwareUpdate"){
      modalContent = <UpdateBatch endList={[this.state.optModal.data]} onUpdate={this.hdlUpdate} />
    }else if(type ===  "softwareUpdate"){
      modalContent = <SoftUpdate endList={[this.state.optModal.data]} onUpdate={this.hdlSoftUpdate} />
    }else if(type ===  "modifyAssociate"){
      modalContent = <EndAssignBatch endList={[this.state.optModal.data]} onBatch={this.hdlBatchEdited} />
    }


    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              {checkPermisson("",(
                <Button type="primary" size="small" className={"mr10"} onClick={this.showModifyDraw}
                        disabled={!this.state.batchEnable}>
                  <Fm id="endpoint.common.modify" tagName="span" defaultMessage="修改" />
                </Button>
              ))}
              {checkPermisson("",(
                <Button type="primary" size="small" className={"mr10"} onClick={this.showControlDraw}
                        disabled={this.state.selectedRows.length === 0}>
                  <Fm id="endpoint.common.control" tagName="span" defaultMessage="控制" />
                </Button>
              ))}

            </Col>
            <Col span={12}>
              <Button size="small" className="fr"><IconFont type="icon-shezhi" /></Button>
              <Button size="small" className="fr mr10"><IconFont type="icon-daochu" /></Button>
              <Button size="small" className="fr mr10 ml10"><IconFont type="icon-shuaxin" /></Button>
              <SearchBar
                className="mr10"
                style={{width: '350px', float: 'right'}}
                placeholder={`${messages['endpoint.common.searchEndpoint']} ID`}
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
        <div className="content-content ">

          <ACGrid
            columnDefs={this.columnDefs}
            defaultColDef={this.defaultColDef}
            location={this.props.location}
            context={this.gridContext}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowMultiSelectWithClick={true}
            rowSelection={"multiple"}
          />

        </div>

        <Drawer
          title={<Title>{messages['endpoint.common.modify']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeModifyDraw}
          visible={this.state.modifyDrawShow}
          style={{height: "calc(100% - 55px)"}}
          destroyOnClose={true}
          width={590}
        >
          <Tabs
            defaultActiveKey="1"
            tabPosition="left"
            style={{ marginTop: -24,height: "100%" }}
          >
            <TabPane title={this.msg['common.basicMessage']} tab={this.msg['endpoint.common.endpointSpec']} id="1">
              <EndSpecBatch endList={this.state.selectedRows} onBatch={this.hdlBatchEdited} />
            </TabPane>
            <TabPane title={this.msg['endpoint.common.assetAssociate']} tab={this.msg['assignment.common.release']} id="2">
              <EndAssetBatchRelease endList={this.state.selectedRows} onBatch={this.hdlBatchEdited} />
            </TabPane>
            <TabPane tab={this.msg['endpoint.common.modifyAssociate']} id="3">
              <EndAssignBatch endList={this.state.selectedRows} onBatch={this.hdlBatchEdited} />
            </TabPane>
            <TabPane title={this.msg['endpoint.common.endpointGroup']} tab={this.msg['endpoint.common.joinEndpointGroup']} id="4">
              <EPGroupBatch endList={this.state.selectedRows} onBatch={this.hdlBatchEdited} />
            </TabPane>
          </Tabs>

        </Drawer>
        <Drawer
          title={<Title>{messages['endpoint.common.control']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeControlDraw}
          visible={this.state.controlDrawShow}
          style={{height: "calc(100% - 55px)"}}
          destroyOnClose={true}
          width={590}
        >
          <Tabs
            defaultActiveKey="1"
            tabPosition="left"
          >
            <TabPane tab={this.msg['common.excuteCommand']} id="1">
              <CommandBatch endList={this.state.selectedRows} onCommands={this.hdlCommandBatch} />
            </TabPane>
            <TabPane tab={this.msg['endpoint.common.sendSMS']} id="2">
              <SendMsgBatch endList={this.state.selectedRows} onSendMsg={this.hdlSendMsg} />
            </TabPane>
            <TabPane tab={this.msg['endpoint.common.firmwareUpdate']} id="3">
              <UpdateBatch endList={this.state.selectedRows} onUpdate={this.hdlUpdate} />
            </TabPane>
            <TabPane tab={this.msg['endpoint.common.softwareUpdate']} id="4">
              <SoftUpdate endList={this.state.selectedRows} onUpdate={this.hdlSoftUpdate} />
            </TabPane>
          </Tabs>

        </Drawer>
        <Modal
          title={this.state.optModal.title}
          visible={this.state.optModal.visible}
          onCancel={this.closeModal}
          destroyOnClose
          footer={null}
        >
          {modalContent}
        </Modal>
      </div>
    )
  }
}

