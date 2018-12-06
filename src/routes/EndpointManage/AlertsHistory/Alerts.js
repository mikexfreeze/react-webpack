/* create by Micheal Xiao 2018/11/19 11:23 */
import {AgHeader, injectIntl} from "acom/Intl";
import {MainPage} from "components";
import {deleteProject} from 'services/projectApi';
import {DateCell, SearchBar} from "acom";
import {CellMenu, LinkCell, AlertStatus, AlertLevel} from "../Alerts/Cells"
import SearchMenu from "../Alerts/SearchMenu"
import {log, parsePage} from "utils";
import {Col, Icon, message, Modal, Row} from "antd";
import React from "react";
import {queryAlerts, updateAlerts} from "services/alertApi";
import {CheckboxHeader} from "acom/AC-grid/HeaderComponents";
import assign from "lodash/assign";
import {connect} from "dva";

const confirm = Modal.confirm

@injectIntl()
@connect(({ global, user, }) => ({
  onXHR: global.onXHR,
  user,
}))
export default class Alerts extends MainPage {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    tenantId: this.props.user.tenantId,
    "alertStatus[0]": "NEW",
    "alertStatus[1]": "INPROCESS",
    "alertStatus[2]": "SOLVED",
  }

  queryTableData = queryAlerts

  onACGridReady = (params) => {
    let thiz = this
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        if(pageParams.tenantId){
          thiz.queryTableData(pageParams)
            .then((res) => {
              log.info("queryTableData", res)
              let data = res.data
              pageParams.total = data.totalElements
              params.successCallback(data.content, pageParams.total);
            })
        }else{
          message.info("请先选择租户ID")
          // params.successCallback([], 0);
        }

      }
    };
    params.api.setDatasource(dataSource);
  }

  columnDefs = [
    {
      field: 'id',
      cellRenderer: 'linkCell',
      headerComponentParams: { fm: {id: "common.eventId", defaultMessage: "事件ID"} },
    }, {
      field: "tenantId",
      headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} },
    },{
      field: "endpointId",
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} },
    },{
      field: "assetId",
      headerComponentParams: { fm: {id: "assignment.common.assetId", defaultMessage: "资产ID"} },
    },{
      field: "type",
      width: 105, suppressSizeToFit: true,
      headerComponentParams: { fm: {id: "trigger.triggerRule.alertType", defaultMessage: "告警类型"} },
    },{
      field: "level",
      width: 75, suppressSizeToFit: true,
      cellRenderer: 'AlertLevel',
      cellRendererParams: {offset: [0, -6]},
      headerComponentParams: { fm: {id: "trigger.triggerRule.alertLevel", defaultMessage: "告警级别"} },
    },{
      field: "alertStatus",
      width: 75, suppressSizeToFit: true,
      cellRenderer: 'AlertStatus',
      headerComponentParams: { fm: {id: "common.status", defaultMessage: "状态"} },
    },{
      field: "message",
      width: 105, suppressSizeToFit: true,
      headerComponentParams: { fm: {id: "trigger.triggerRule.alertInfo", defaultMessage: "告警信息"} },
    },{
      field: "source",
      width: 80, suppressSizeToFit: true,
      headerComponentParams: { fm: {id: "assignment.common.source", defaultMessage: "来源"} },
    },{
      field: "receivedDate",
      cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.eventTime", defaultMessage: "事件时间"} },
    },
  ];

  agComponents = {
    CellMenu,
    AlertStatus,
    AlertLevel,
    linkCell: LinkCell,
    dateCell: DateCell,
    agColumnHeader: AgHeader,
    CheckboxHeader: CheckboxHeader
  }

  hdlCheck = () => {
    updateAlerts({
      action: "ACK",
      eventIds: this.selectedRows.map(alert => alert.id),
      tenantId: this.selectedRows[0].tenantId,
    }).then(res => {
      if(res.status === 200){
        message.success(this.msg['common.success'])
        this.gridApi.refreshInfiniteCache()
      }
    })
  }

  hdlCheckSingle = (data) => {
    this.dealAlert("ACK", data)
  }

  hdlClearSingle = (data) => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        thiz.dealAlert("SOLVE", data)
      },
    });
  }

  hdlClear = () => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        thiz.dealAlerts("SOLVE")
      },
    });
  }

  dealAlert = (action, data) => {
    updateAlerts({
      action: action,
      eventIds: [data.id],
      tenantId: data.tenantId,
    }).then(res => {
      if(res.status === 200){
        message.success(this.msg['common.success'])
        this.gridApi.refreshInfiniteCache()
      }
    })
  }

  dealAlerts = (action) => {
    updateAlerts({
      action: action,
      eventIds: this.selectedRows.map(alert => alert.id),
      tenantId: this.selectedRows[0].tenantId,
    }).then(res => {
      if(res.status === 200){
        message.success(this.msg['common.success'])
        this.gridApi.refreshInfiniteCache()
      }
    })
  }

  hdlEdit = (data) => {
    let history = this.props.history
    history.push(`${history.location.pathname}/edit/${data.token}/${data.tenantId}`)
  }

  hdlDelete = (data) => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteProject(data.token, data.tenantId)
          .then(res => {
            log.info("删除：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  hdlSearchId = (searchId) => {
    this.pageParams.endpointId = searchId
    this.gridApi.refreshInfiniteCache();
  }

  autoSizeFit = () => {
    this.gridApi.sizeColumnsToFit()
  }

  gridContext = {
    onCheck: this.hdlCheckSingle,
    onClear: this.hdlClearSingle,
  }

  ACgridProps = {
    getRowNodeId: (data) => {
      return data.id
    }
  }

  contentHeader = () => {
    return (
      <div className="content-header">
        <Row>
          <Col span={12}>
            {this.props.user.level === 1 &&
            <span>
                <Icon type="exclamation-circle" theme="filled" style={{ fontSize: '16px', color: '#08c' }} />
              &nbsp; 请在高级搜索中选择租户ID (必选)
              </span>
            }

          </Col>
          <Col span={12}>
            <SearchBar
              style={{width: '350px', float: 'right'}}
              placeholder={`${this.msg['common.inputEndpointId']}`}
              onChange={this.hdlIdChange}
              value={this.state.searchId}
              onPressEnter={this.hdlSearchId}
              size={this.size}
            >
              <SearchMenu {...this.searchProps()} />
            </SearchBar>
          </Col>
        </Row>
      </div>
    )
  }
}
