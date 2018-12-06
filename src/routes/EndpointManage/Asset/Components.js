import {AgHeader, injectIntl} from "acom/Intl";
import {Component} from "react";
import DateCell from "acom/Cell/DateCell";
import assign from "lodash/assign";
import {log, parsePage} from "utils";
import {analysisDatastream, queryEndpointHistory} from "services/endpointApi";
import {ACGrid} from "acom";
import React from "react";
import {message} from "antd";
import {Map} from "react-amap";
import {Toolbar} from "acom/AMap";
import {queryAstEvents} from "services/assetApi";
import {ObjToStr} from "routes/EndpointManage/Endpoint/Cells";
import {History as EndHistory} from 'routes/EndpointManage/Endpoint/Components.js'

@injectIntl()
export class MyMap extends Component {
  state = {
    latitude: 39.9788,
    longitude: 116.30226,
    zoom: 10,
    markerList: [],
    bounds: [],
    showMarkInfo: false
  }

  msg = this.props.intl.messages

  hdlEvents = {
    created: (ins) => { console.log(ins); },
    click: () => { console.log('clicked') },
  }


  markerEvents = {
    click: (e) => {
      // TODO mark 显示隐藏逻辑问题
      this.setState({showMarkInfo: !this.state.showMarkInfo})
    },
  }

  componentDidMount () {
    // this.getLastPoint()
  }

  getLastPoint = () => {
    let time = new Date().getTime()
    let start = time - 3600*24*180*1000
    let postData = {
      direction: "DESC",
      endpointId: this.props.endpointId,
      eventType: "Location",
      limit: 1,
      mapOperationType: "TRACK",
      tenantId: this.props.tenantId,
      timeFrame: {start: start, end: time}
    }
    analysisDatastream(postData)
      .then(res => {
        let data = res.data.result.data
        log.info("analysisDatastream api:", data)
        if(data.length > 0){
          let lastLoc = data[0].loc
          this.setState({
            latitude: lastLoc.lat,
            longitude: lastLoc.lng,
          })
        }

      })
  }

  hdlTracePlayback = (data) => {
    let postData = {
      endpointId: this.props.endpointId,
      eventType: "Location",
      mapOperationType: "TRACK",
      tenantId: this.props.tenantId,
      start: 0,
      timeFrame: data.timeFrame
    }
    analysisDatastream(postData)
      .then(res => {
        let data = res.data.result.data
        log.info("analysisDatastream api:", data)
        if(data.length === 0){
          message.info(this.msg['alert.noResult'])
          return
        }
        let lastLoc = data[0].loc
        this.setState({
          lat: lastLoc.lat,
          lng: lastLoc.lng
        })
        let bounds = []
        let markers = []
        for (let log of data) {
          bounds.push([log.loc.lng, log.loc.lat])
          markers.push(log.loc)
        }
        this.setState({
          bounds:bounds,
          markerList:markers
        })
        //设置数据
        this.PathIns.setData([{
          name: '路线0',
          path: bounds
        }]);

        //对第一条线路（即索引 0）创建一个巡航器
        this.navg = this.PathIns.createPathNavigator(0, {
          loop: true, //循环播放
          speed: 100000 //巡航速度，单位千米/小时
        });

        this.navg.start();
      })
  }

  hdlPathInsReady = (PathIns) => {
    this.PathIns = PathIns
  }

  hdlTabChange = (e) => {
    this.stopNavg()
  }

  stopNavg = () => {
    if(this.navg){
      this.navg.destroy()
      this.PathIns.setData([]);
    }
  }

  hdlTracing = (countTime) => {
    this.stopNavg()
    let thiz = this
    this.timer = setInterval(function () {
      thiz.getLastPoint()
    }, countTime*1000)
  }

  hdlStopTracing = () => {
    if(this.timer){
      clearInterval(this.timer)
    }
  }

  componentWillUnmount () {
    this.hdlStopTracing()
  }

  render() {
    let center = {latitude:this.state.latitude, longitude:this.state.longitude}

    return (
      <div style={{height: 400, position: 'relative'}}>
        <Map useAMapUI
             center={center}
             events={this.hdlEvents}
             amapkey={process.env.AMAP_KEY}
        >
          <Toolbar />
        </Map>
      </div>
    );
  }
}

export class PointsList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Location",
    tenantId: this.props.tenantId,
    id: this.props.assetId
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
        queryAstEvents(pageParams)
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
          defaultColDef={this.defaultColDef}
          location={this.props.location}
          frameworkComponents={this.agComponents}
          onACGridReady={this.onACGridReady}
          rowSelection={"single"}
        />
      </div>
    );
  }
}

export class MeasureList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Measurement",
    tenantId: this.props.tenantId,
    id: this.props.assetId
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
        queryAstEvents(pageParams)
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

export class AlertList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Alert",
    tenantId: this.props.tenantId,
    id: this.props.assetId
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
        queryAstEvents(pageParams)
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

export class History extends EndHistory {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    tenantId: this.props.tenantId,
    assetId: this.props.assetId
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

