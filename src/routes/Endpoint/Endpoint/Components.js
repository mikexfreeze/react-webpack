import { Component } from 'react'
import { Badge } from 'antd';
import Fm from 'acom/Intl/FormattedMessage'
import {injectIntl} from "acom/Intl/injectIntl";
import React from "react";
import {queryEndPointsUnassign} from "services/endpointApi";
import {LinkCell, RowMenu} from "routes/EndpointManage/Endpoint/Cells";
import {ACGrid, DateCell} from "acom";
import {AgHeader} from "acom/Intl";
import assign from "lodash/assign";
import {parsePage, log} from "utils";
import {CheckboxHeader} from "acom/AC-grid/HeaderComponents";

export class LinkStatus extends Component{
  render () {
    let status = this.props.value
    let html = ''
    switch (status) {
      case 'INIT':
        html = <span><Badge offset={this.props.offset} status="default" /><Fm id='endpoint.common.init' defaultMessage='初始化' /></span>
        break;
      case 'ONLINE':
        html = <span><Badge offset={this.props.offset} status="processing" /><Fm id='endpoint.common.online' defaultMessage='在线' /></span>
        break;
      case 'OFFLINE':
        html = <span><Badge offset={this.props.offset} status="error" /><Fm id='endpoint.common.offline' defaultMessage='掉线' /></span>
        break;
      default:
        html = <span><Badge offset={this.props.offset} status="warning" /><Fm id='common.unknown' defaultMessage='未知' /></span>
    }
    return html
  }
}

@injectIntl()
export class ActiveStatusCell extends Component{
  render () {
    const {intl: {messages}} = this.props

    let status = this.props.value
    let text = ''
    switch (status) {
      case "Active":
        text = messages['common.activated']
        break;
      case "Released":
        text = messages['assignment.common.release']
        break;
      default:
        text = messages['assignment.common.noAssociate']
    }
    return <span>{text}</span>
  }
}

export class AlertStatus extends Component{
  render () {
    let status = this.props.value
    let html = ''
    switch (status) {
      case 'INIT':
        html = <span><Badge offset={this.props.offset} status="default" /><Fm id="endpoint.common.init" defaultMessage="初始化" /></span>
        break;
      case 'INFO':
        html = <span><Badge offset={this.props.offset} status="success" /><Fm id='trigger.triggerRule.info' defaultMessage='通知' /></span>
        break;
      case 'NORMAL':
        html = <span><Badge offset={this.props.offset} status="processing" /><Fm id="endpoint.common.normal" defaultMessage="正常" /></span>
        break;
      case 'ERROR':
        html = <span><Badge offset={this.props.offset} status="warning" /><Fm id="trigger.triggerRule.error" defaultMessage="严重" /></span>
        break;
      case 'CRITICAL':
        html = <span><Badge offset={this.props.offset} status="error" /><Fm id='trigger.triggerRule.critical' defaultMessage='致命' /></span>
        break;
      default:
        html = <span><Badge offset={this.props.offset} status="warning" /><Fm id="common.unknown" defaultMessage="未知状态" /></span>
    }
    return html
  }
}

@injectIntl()
export class EndpointSelectList extends Component{

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    tenantId: this.props.tenantId
  }

  columnDefs = [{
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    checkboxSelection: true,
    headerComponent: 'CheckboxHeader',
  },{
    field: 'id',
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
    CheckboxHeader: CheckboxHeader
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;

    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryEndPointsUnassign(pageParams)
          .then((res) => {
            console.log("queryEndPointsUnassign:", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
    this.props.onChange(this.selectedRows)
  }

  render(){
    return(
      <div style={{minHeight: 500,position: "relative",height: "100%"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          defaultColDef={this.defaultColDef}
          location={this.props.location}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          onSelectionChanged={this.hdlSelectionChanged}
          rowSelection={"multiple"}
        />
      </div>
    )
  }
}

export class EndpointListBase extends Component{

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    tenantId: this.props.tenantId
  }

  columnDefs = [
    {
    field: 'id',
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
    CheckboxHeader: CheckboxHeader
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;

    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: (params) => {
        assign(pageParams, parsePage(params))
        this.queryTableData(pageParams)
          .then((res) => {
            log.info(this.queryTableData.name, res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  render(){
    return(
      <div style={{minHeight: 300,position: "relative",height: "100%"}}>
        <ACGrid
          columnDefs={this.columnDefs}
          defaultColDef={this.defaultColDef}
          location={this.props.location}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          context={this.gridContext}
          rowSelection={"multiple"}
        />
      </div>
    )
  }
}

