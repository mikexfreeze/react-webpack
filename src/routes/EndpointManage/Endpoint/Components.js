import React, {Component} from 'react';
import {ACGrid, Title} from "acom";
import {AgHeader, Fm, injectIntl} from "acom/Intl";
import DateCell from "acom/Cell/DateCell";
import assign from "lodash/assign";
import {log, parsePage} from "utils";
import {invocations, queryEndpointEvents, queryEndpointHistory} from "services/endpointApi";
import {ObjToStr} from './Cells'
import {Button, Col, Drawer, Row, Form, message} from "antd";
import {MetaInput} from "components";
import {ACInput, ACSelect} from "acom/Form";
import {connect} from "dva";
import {ActiveStatusCell} from "routes/Endpoint/Endpoint/Components";
import {CellMenu} from "routes/EndpointManage/Endpoint/CellsDetail";
import {queryAssignmentsByAsset, queryAssignmentsByEP} from "services/assignmentApi";

@injectIntl()
export class AssignmentsList extends Component {

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId,
    assetId: this.props.assetId
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
    },{
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'token',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} },
    },{
      field: "assetDto.name",
      headerComponentParams: { fm: {id: "endpoint.common.assignAsset", defaultMessage: "关联资产"} },
    },{
      field: "assetDto.createdTime", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.associateTime", defaultMessage: "关联时间"} },
    },{
      field: "status",
      cellRenderer: 'activeStatusCell',
      headerComponentParams: { fm: {id: "endpoint.common.associateStatus", defaultMessage: "关联状态"} },
    },
  ];

  agComponents = {
    activeStatusCell: ActiveStatusCell,
    dateCell: DateCell,
    cellMenu: CellMenu,
    agColumnHeader: AgHeader,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    let thiz = this
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        if(thiz.props.endpointId){
          queryAssignmentsByEP(pageParams)
            .then((res) => {
              log.info("get 关联资产 by endpoint api", res)
              let data = res.data
              pageParams.total = data.totalElements
              params.successCallback(data.content, pageParams.total);
            })
        }else if(thiz.props.assetId){
          queryAssignmentsByAsset(pageParams)
            .then((res) => {
              log.info("get 关联资产 by asset api", res)
              let data = res.data
              pageParams.total = data.totalElements
              params.successCallback(data.content, pageParams.total);
            })
        }

      }
    };
    params.api.setDatasource(dataSource);
  }

  render() {
    return (
      <div style={{minHeight: 300,position: "relative"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          location={this.props.location}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}

@injectIntl()
export class PointsList extends Component {

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Location",
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'longitude',
      headerComponentParams: { fm: {id: "common.longtitude", defaultMessage: "经度"} },
    },{
      field: 'latitude',
      headerComponentParams: { fm: {id: "common.latitude", defaultMessage: "纬度"} },
    },{
      field: "metadata",
      headerComponentParams: { fm: {id: "common.metadata", defaultMessage: "元数据"} },
    },{
      field: "eventDate", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.eventdate", defaultMessage: "事件日期"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndpointEvents(pageParams)
          .then((res) => {
            log.info("get 资产位置 api", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  render() {
    return (
      <div style={{minHeight: 300,position: "relative"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}

@injectIntl()
export class MeasureList extends Component {

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Measurement",
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'assignmentToken',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} },
    }, {
      field: 'measurements',
      cellRenderer: 'ObjToStr',
      headerComponentParams: { fm: {id: "common.measure", defaultMessage: "测量"} },
    },{
      field: "metadata",
      headerComponentParams: { fm: {id: "common.metadata", defaultMessage: "元数据"} },
    },{
      field: "eventDate", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.eventdate", defaultMessage: "事件日期"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
    ObjToStr:ObjToStr,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndpointEvents(pageParams)
          .then((res) => {
            log.info("get 测量信息 api", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  render() {
    return (
      <div style={{minHeight: 300,position: "relative"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}

@injectIntl()
export class AlertList extends Component {

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Alert",
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'type',
      headerComponentParams: { fm: {id: "common.type", defaultMessage: "类型"} },
    }, {
      field: 'level',
      headerComponentParams: { fm: {id: "common.level", defaultMessage: "级别"} },
    },{
      field: "message",
      headerComponentParams: { fm: {id: "common.message", defaultMessage: "信息"} },
    },{
      field: "source",
      headerComponentParams: { fm: {id: "assignment.common.source", defaultMessage: "来源"} },
    },{
      field: "metadata",
      headerComponentParams: { fm: {id: "common.metadata", defaultMessage: "元数据"} },
    },{
      field: "eventDate", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.eventdate", defaultMessage: "事件日期"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
    ObjToStr:ObjToStr,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndpointEvents(pageParams)
          .then((res) => {
            log.info("get 告警信息 api", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  render() {
    return (
      <div style={{minHeight: 300,position: "relative"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}

@injectIntl()
@connect(({ global, commands, user }) => ({
  onXHR: global.onXHR,
  commands,
  user,
}))
@Form.create()
export class Command extends Component {

  msg = this.props.intl.messages

  state = {
    commandDraw: false
  }

  hdlOpenCommandDraw = () => {
    this.setState({commandDraw: true})
  }

  closeCommandDrawer = () => {
    this.setState({commandDraw: false})
  }

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "CommandInvocation",
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId
  }

  columnDefs = [
    {
      field: 'id',
      headerComponentParams: { fm: {id: "endpoint.common.invokeStream", defaultMessage: "调用流水"} }
    }, {
      field: 'commandDto.name',
      headerComponentParams: { fm: {id: "specification.command.commandname", defaultMessage: "指令名"} },
    }, {
      field: "initiator",
      headerComponentParams: { fm: {id: "assignment.common.source", defaultMessage: "来源"} },
    },{
      field: "target",
      headerComponentParams: { fm: {id: "assignment.common.destination", defaultMessage: "目标"} },
    },{
      field: "eventDate", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.eventdate", defaultMessage: "事件日期"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
    ObjToStr:ObjToStr,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndpointEvents(pageParams)
          .then((res) => {
            log.info("get 指令信息 api", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
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
    if(meta){
      for (let v of meta) {
        metaData[`${v[0]}`] = v[1]
      }
    }
    invocations({
      ...formValues,
      metaData,
      "initiator": "REST",
      "initiatorId": this.props.user.tenantId,
      "target": "Endpoint",
      "tenantId": this.props.tenantId,
      endpointId: this.props.endpointId
    })
      .then(res => {
        log.info("发送指令：", res)
        if(res.status === 201){
          this.closeCommandDrawer()
          this.gridApi.refreshInfiniteCache();
          message.success(messages['alert.createSuccess'])
        }
      })
  }

  componentDidMount () {
    const {dispatch} = this.props
    dispatch({type: 'commands/fetch', payload: {token: this.props.token, tenantId: this.props.tenantId}})
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const Option = ACSelect.Option

    return (
      <div >
        <Row className={`mb10`}>
          <Col span={12}>
            <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={this.hdlOpenCommandDraw}>
              <Fm id="assignment.common.invokecommand" tagName="span" defaultMessage="调用指令" />
            </Button>
          </Col>
        </Row>
        <div style={{minHeight: 300,position: "relative"}}>
          <ACGrid
            columnDefs={this.columnDefs}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            rowSelection={"single"}
          />
        </div>
        <Drawer
          title={<Title>{this.msg['assignment.common.invokecommand']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCommandDrawer}
          visible={this.state.commandDraw}
          width={370}
        >
          <Form layout="vertical" onSubmit={this.hdlSubmit}>
            <Row>
              <Form.Item label={this.msg['common.command']}>
                {getFieldDecorator('commandToken', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <ACSelect placeholder={this.msg['common.pleaseChoose']}
                          onSelect={this.hdlTenantSelect}>
                    {this.props.commands.map(command => {
                      return (<Option value={command.token} key={command.token}>{command.name}</Option>)
                    })}
                  </ACSelect>
                )}
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label="dataRange">
                {getFieldDecorator('parameterValues.dataRange', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(
                  <ACInput type="number" />
                )}
              </Form.Item>
            </Row>
            <Row>
              <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
            </Row>
            <Row className={`mt10`}>
              <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{this.msg['common.submit']}</Button>
            </Row>

          </Form>

        </Drawer>
      </div>
    );
  }
}

export class History extends Component {


  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    tenantId: this.props.tenantId,
    endpointId: this.props.endpointId
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'lastStatus',
      headerComponentParams: { fm: {id: "common.connectStatus", defaultMessage: "连接状态"} },
    }, {
      field: 'operationType',
      headerComponentParams: { fm: {id: "common.operateType", defaultMessage: "操作类型"} },
    },{
      field: "operator",
      headerComponentParams: { fm: {id: "common.operator", defaultMessage: "操作者"} },
    },{
      field: "statusUpdateTime", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.operateTime", defaultMessage: "操作时间"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndpointHistory(pageParams)
          .then((res) => {
            log.info("get 变更记录 api", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  render() {
    return (
      <div style={{minHeight: 300,position: "relative"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}
