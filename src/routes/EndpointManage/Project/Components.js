import { Component } from 'react';
import {ACGrid, Title} from "acom";
import { Link } from 'dva/router';
import ReactEcharts from 'echarts-for-react';
import { AgHeader, Fm, injectIntl } from 'acom/Intl';
import DateCell from "acom/Cell/DateCell";
import {queryEndPoints, queryEndpointHistory, batchInvocations, analysisDatastream} from 'services/endpointApi';
import {queryProjectEvents, queryProjectZones, deleteProjectZone, createZone} from 'services/projectApi';
import assign from "lodash/assign";
import {log, parsePage} from "utils";
import {Dropdown, Icon, Spin, Menu, Modal, Button, Col, Drawer, Row, Form, message, Collapse, Select} from "antd";
import {LinkStatus, AlertStatus, ActiveStatusCell} from 'routes/Endpoint/Endpoint/Components';
import {ObjToStr} from "routes/EndpointManage/Endpoint/Cells";
import {History as EndHistory} from 'routes/EndpointManage/Endpoint/Components.js'
import {connect} from "dva";
import {ACInput, ACSelect} from "acom/Form";
import {MetaInput} from "components";
import {CommandBatch} from "routes/EndpointManage/Endpoint/ControlEditor";
import store from 'store2';
import { IconFont } from "components";
import {checkPermisson} from 'utils/Authorized';
import { AddZone, ViewZone } from './Zone';
import {Map, Polygon, Markers, InfoWindow} from 'react-amap';
import styles from './project.less';
import { MapDeviceInfo } from 'routes/Dashboard/Components';

const confirm = Modal.confirm;
const Panel = Collapse.Panel;
const Option = Select.Option;
const plugins = [
  'Scale',
  'ToolBar'
];

const offlineStyle = {
  color: '#666666',
  fontSize: 32
};
const normalStyle = {
  color: '#57df60',
  fontSize: 32
};
const infoStyle = {
  color: '#12caff',
  fontSize: 32
};
const warningStyle = {
  color: '#ffc600',
  fontSize: 32
};
const errorStyle = {
  color: '#ff8a00',
  fontSize: 32
};
const criticalStyle = {
  color: '#e80000',
  fontSize: 32
};
const unknownStyle = {
  color: '#3c4b61',
  fontSize: 32
};


class LinkCell extends Component{
  componentDidMount() {
  }

  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let name = this.props.value;
    let path = this.props.data ? this.props.data.token : "";
    let html = path ?
      <Link to={`${ppath}/detail/${path}/${this.props.data.tenantId}`}>{name}</Link>
      : ''
    return html
  }
}

@injectIntl()
class AlertStatGraph extends Component {
  msg = this.props.intl.messages;

  constructor(props) {
    super(props);
    this.state = {
      isAlertLoaded: false,

    };
  }

  componentDidMount() {
    if(this.props.alertStat){
      const alert = this.setAlertData(this.props.alertStat);
      this.setAlertGraphic(alert);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.alertStat){
      const alert = this.setAlertData(nextProps.alertStat);
      this.setAlertGraphic(alert);
    }
  }
  setAlertData(alertStat) {
    let infoCnt = 0, warningCnt = 0, criticalCnt = 0, errorCnt = 0, alertAll= 0;
    let alertGraphicData = [];
    for (let i = alertStat.length - 1; i >= 0; i--) {
        switch(alertStat[i].level) {
            case "Info":
                infoCnt = alertStat[i].count;
            break;
            case "Warning":
                warningCnt = alertStat[i].count;
            break
            case "Critical":
                criticalCnt = alertStat[i].count;
            break;
            case "Error":
                errorCnt = alertStat[i].count;
            break;
            default:
            break;
        }
    }

    alertGraphicData.push({value:infoCnt, name: this.msg['trigger.triggerRule.info'], itemStyle: {normal:{color: '#12caff'}}});
    alertGraphicData.push({value:warningCnt, name: this.msg['trigger.triggerRule.warning'], itemStyle: {normal:{color: '#ffc600'}}});
    alertGraphicData.push({value:errorCnt, name: this.msg['trigger.triggerRule.error'], itemStyle: {normal:{color: '#ff8a00'}}});
    alertGraphicData.push({value:criticalCnt, name: this.msg['trigger.triggerRule.critical'], itemStyle: {normal:{color: '#e80000'}}});

    alertAll = infoCnt + warningCnt + criticalCnt + errorCnt;

    return {
      alertGraphicData,
      alertAll
    };
  }

  setAlertGraphic(alert) {
    const {
      alertGraphicData,
      alertAll
    } = alert;
    const alertEcOption = {
        title: {
            text: this.msg['common.alertAllCount'],
            subtext: alertAll.toString(),
            textAlign: 'center',
            left: "34%",
            top: "40%",
            textStyle: {
                color: "#666",
                fontSize: 14
            },
            subtextStyle: {
                color: "#000",
                fontSize: 32
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)",
            position: "top"
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    title: this.msg['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 50,
            orient: 'vertical',
            right: 10,
            align: 'left',
            data:[this.msg['trigger.triggerRule.info'],this.msg['trigger.triggerRule.warning'],this.msg['trigger.triggerRule.error'],this.msg['trigger.triggerRule.critical']],
            formatter:function(name){
                var oa = alertEcOption.series[0].data;
                var num = oa[0].value + oa[1].value + oa[2].value + oa[3].value;
                for(var i = 0; i < alertEcOption.series[0].data.length; i++){
                    if(name === oa[i].name){
                        if (num === 0) {
                            return name + '0%';
                        }else {
                            return name + ' ' + (oa[i].value/num * 100).toFixed(0) + '%';
                        }
                    }
                }
            }
        },
        series: [
            {
                name: this.msg['common.alertStat'],
                type:'pie',
                center: ['35%', '50%'],
                radius: ['60%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: alertGraphicData
            }
        ]
    };

    this.setState({
      alertEcOption: alertEcOption,
      isAlertLoaded: true
    });
  };

  render() {
    const { isAlertLoaded, alertEcOption }  = this.state;
    return (
      <div>
        <span>{this.msg[this.props.msgId]}</span>
        { isAlertLoaded && <ReactEcharts
          style={this.props.style}
          option={alertEcOption}
        />
        }
      </div>
    );
  }
}

@injectIntl()
class EndpointStatGraph extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isGraphOptLoaded: false,
      graphOpt: null
    };
    this.messages = this.props.intl.messages;
  }

  componentDidMount() {
    if(this.props.endpointStat){
      const status = this.setEndpointData(this.props.endpointStat);
      this.setEpStatusGraphic(status);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.endpointStat){
      const status = this.setEndpointData(nextProps.endpointStat);
      this.setEpStatusGraphic(status);
    }
  }

  setEndpointData(endpointStat) {
    let epAlertGraphicData = [], infoCntEP = 0, warningCntEP = 0, errorCntEP = 0,
        criticalCntEP = 0, offlineCntEP = 0, initCntEP = 0, normalCntEP = 0;
    for (let i = endpointStat.length - 1; i >= 0; i--) {
        switch(endpointStat[i].status) {
            case "OFFLINE":
                offlineCntEP = endpointStat[i].counts;
            break
            case "INIT":
                initCntEP = endpointStat[i].counts;
            break
            default:
            break;
        }
        switch(endpointStat[i].alertStatus) {
            case "NORMAL":
                normalCntEP = endpointStat[i].counts;
            break;
            case "INFO":
                infoCntEP = endpointStat[i].counts;
            break;
            case "WARNING":
                warningCntEP = endpointStat[i].counts;
            break;
            case "ERROR":
                errorCntEP = endpointStat[i].counts;
            break;
            case "CRITICAL":
                criticalCntEP = endpointStat[i].counts;
            break;
            default:
            break;
        }
    }

    epAlertGraphicData.push({value:infoCntEP, name: this.messages['trigger.triggerRule.info'], itemStyle: {normal:{color: '#12caff'}}});
    epAlertGraphicData.push({value:warningCntEP, name: this.messages['trigger.triggerRule.warning'], itemStyle: {normal:{color: '#ffc600'}}});
    epAlertGraphicData.push({value:errorCntEP, name: this.messages['trigger.triggerRule.error'], itemStyle: {normal:{color: '#ff8a00'}}});
    epAlertGraphicData.push({value:criticalCntEP, name: this.messages['trigger.triggerRule.critical'], itemStyle: {normal:{color: '#e80000'}}});
    epAlertGraphicData.push({value:normalCntEP, name: this.messages['endpoint.common.normal'], itemStyle: {normal:{color: '#57df60'}}});
    epAlertGraphicData.push({value:offlineCntEP, name: this.messages['endpoint.common.offline'], itemStyle: {normal:{color: '#666666'}}});
    epAlertGraphicData.push({value:initCntEP, name: this.messages['endpoint.common.init'], itemStyle: {normal:{color: '#c0c0c0'}}});

    return {
      epAlertGraphicData,
    }
  }

  setEpStatusGraphic(status) {
    const {
      epAlertGraphicData,
    } = status;
    const endpointStatusOption = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)",
            position: "top"
        },
        toolbox: {
            right: 20,
            feature: {
                saveAsImage: {
                    show: true,
                    title: this.messages['common.saveAsImage']
                }
            }
        },
        legend: {
            top: 50,
            right: 10,
            orient: 'vertical',
            align: 'left',
            data:[
              this.messages['endpoint.common.normal'],
              this.messages['trigger.triggerRule.info'],
              this.messages['trigger.triggerRule.warning'],
              this.messages['trigger.triggerRule.error'],
              this.messages['trigger.triggerRule.critical'],
              this.messages['endpoint.common.normal'],
              this.messages['endpoint.common.init'],
              this.messages['endpoint.common.offline']
            ],
        },
        series: [
            {
                name: this.messages['home.realtimeEndpointStat'],
                type:'pie',
                center: ['35%', '50%'],
                radius: ['0%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: epAlertGraphicData
            }
        ]
    };

    this.setState({
      graphOpt: endpointStatusOption,
      isGraphOptLoaded: true
    })
  };

  render() {
    const { graphOpt, isGraphOptLoaded } = this.state;
    return (
      <div>
        <span>{this.messages[this.props.msgId]}</span>
        { isGraphOptLoaded && <ReactEcharts
          style={this.props.style}

          option={graphOpt}
        />
        }
      </div>
    );
  }
}

@injectIntl()
class CellMenuEndpoint extends Component{
  // TODO 操作-发送指令
  msg = this.props.intl.messages
  render () {
    let html
    if(this.props.data && this.props.data.id){
      let menu = (
        <Menu>
          <Menu.Item key="0" onClick={() => this.props.context.onOpenModal("command", this.props.data)}>
            <span>{this.msg["common.excuteCommand"]}</span>
          </Menu.Item>
        </Menu>
      )
      html = (
        <Dropdown overlay={menu} trigger={['click']}>
          <span className="cellMenu">
            <Icon type="down" style={{fontSize: "14px"}} />
          </span>
        </Dropdown>
      )
    }else{
      html = <Spin size="small"/>
    }
    return html
  }
}

@injectIntl()
class ProjectMap extends Component {
  msg = this.props.intl.messages;

  constructor(props) {
    super(props);
    const self = this;
    this.mapCenter = {
      latitude: this.props.mapCenter ? this.props.mapCenter.centerLatitude : 39.9788,
      longitude: this.props.mapCenter ? this.props.mapCenter.centerLongtitude : 116.30226,
    }
    this.state = {
      zoom: this.props.mapCenter ? this.props.mapCenter.zoom.value : 10,
      selectAreaPath: [],
      selectArea: null,
      polygonStyle: {
        strokeColor: '#0099CC',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#c6e2ff',
        fillOpacity: 0.5
      },
      areaList: [],
      isAreaListLoaded: false,
      isItemsLoaded: false,
      items: null,
      markerOffset: [-16, -16],
      infoVisible: false,
      infoPosition: {
        longitude: 120,
        latitude: 30
      },
      infoOffset: [0, 0],
      infoSize: {
        width: 200,
        height: 140
      },
      infoDetail: {
        status: 'UNKNOWN'
      },
    };

    this.mapEvents = {
      created: (ins) => {
        log.debug('map created success.');
        self.map = ins;
        let bounds = ins.getBounds();
        let transBounds = this.getMapPointBound(bounds);
        this.getAreaPoint(transBounds);
      },
      click: () => {
        log.debug('clicked');
        this.setState({
          infoVisible: false,
          mapStatus: {
            scrollWheel: true
          }
        })
      },
      moveend: () => {
        let {selectArea} = this.state;
        if (!selectArea) {
          let bounds = this.map.getBounds();
          let transBounds = this.getMapPointBound(bounds);
          this.getAreaPoint(transBounds);
        }
      },
      zoomend: () => {
        let {selectArea} = this.state;
        if (!selectArea) {
          let bounds = this.map.getBounds();
          let transBounds = this.getMapPointBound(bounds);
          this.getAreaPoint(transBounds);
        }
      }
    }

    log.debug('ProjectMap constructor isTabActive: ', this.props.isTabActive);

  }

  componentDidMount() {
    let pageParams = {
      page: 0,
      size: 100,
      projectToken: this.props.projectToken,
      tenantId: this.props.tenantId
    }
    queryProjectZones(pageParams)
      .then((res) => {
        log.info("get project zones api", res)
        let areaList = res.data.content;
        this.setState({
          areaList: areaList,
          isAreaListLoaded: true
        });
      }, (err) => {
        log.error('get project zone list error: ', err);
      })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectAreaPath !== prevState.selectAreaPath) {
      log.debug('set map fit view ready');
      if (this.map) {
        log.debug('set map fit view');
        this.map.setFitView();
      }
    }

    log.debug('componentDidUpdate: ', prevProps.isTabActive, this.props.isTabActive);
    if (this.props.isTabActive !== prevProps.isTabActive) {
      log.debug('map tab active: ', this.props.isTabActive);
      this.setState({
        areaList: [],
        isAreaListLoaded: false
      })
      let pageParams = {
        page: 0,
        size: 100,
        projectToken: this.props.projectToken,
        tenantId: this.props.tenantId
      }
      queryProjectZones(pageParams)
        .then((res) => {
          log.info("get project zones api", res)
          let areaList = res.data.content;
          this.setState({
            areaList: areaList,
            isAreaListLoaded: true
          });
        }, (err) => {
          log.error('get project zone list error: ', err);
        })
    }
  }

  markersEvents = {
    click: (MapsOptions, marker) => {
      log.debug('marker click: ', MapsOptions, marker);
      log.debug('markder extData: ', marker.getExtData());
      const extData = marker.getExtData();
      let alertInfo = extData.info.alarm ? extData.info.alarm['summary'] : '';
      let status = 'UNKNOWN';
      if (extData.info.endpointStatus === 'OFFLINE') {
        status = 'OFFLINE';
      }else if (extData.info.endpointAlertStatus){
        status = extData.info.endpointAlertStatus;
      }
      this.setState({
        infoPosition: extData.position,
        infoVisible: true,
        infoDetail: {
          endpointId: extData.info.endpointId,
          projectName: extData.info.project.projectName,
          alert: alertInfo,
          position: `lng: ${extData.position.longitude}, lat: ${extData.position.latitude}`,
          status: status
        }
      });
    }
  }

  getMapPointBound(bounds) {
    if (!bounds) return;
    let southWest = bounds.getSouthWest();
    let northEast = bounds.getNorthEast();

    const mapPoints = [
      {lng: northEast.lng, lat: northEast.lat},
      {lng: northEast.lng, lat: southWest.lat},
      {lng: southWest.lng, lat: southWest.lat},
      {lng: southWest.lng, lat: northEast.lat},
      {lng: northEast.lng, lat: northEast.lat}
    ];

    return mapPoints;
  }

  getAreaPoint(bounds) {
    let time = new Date().getTime();
    let start = time - 3600*24*180*1000;

    if (!bounds || bounds.length === 0) return;
    let postData = {
      direction: "DESC",
      eventType: "Location",
      mapOperationType: "AREA",
      tenantId: this.props.tenantId,
      projectToken: this.props.projectToken,
      mapPoints: bounds,
      timeFrame: {start: start, end: time},
      assetId: this.props.assetId
    }
    analysisDatastream(postData)
      .then(res => {
        let data = res.data.result
        log.info("analysisDatastream api:", data)
        if(data.length > 0){
          this.setState({
            items: data,
            isItemsLoaded: true
          });
        }
      })
  }

  handleAreaChange = (value) => {
    log.debug('selected area: ', value);
    let {areaList} = this.state;
    let selectAreaPath = [];

    if (!areaList || areaList.length === 0) return;

    for (let i = 0, len = areaList.length; i < len; i++) {
      if (areaList[i].token === value) {
        selectAreaPath = areaList[i].coordinates;
        break;
      }
    }

    this.getAreaPoint(selectAreaPath);
    this.setState({
      selectAreaPath: selectAreaPath,
      selectArea: value
    });
  }

  renderMarkerLayout(extData) {
    const data = extData.info;
    if (data.endpointStatus === 'OFFLINE') {
      // OFFLINE
      return <IconFont type="icon-map" style={offlineStyle} />;
    }else {
        switch(data.endpointAlertStatus) {
            case "NORMAL":
              // ONLINE
              return <IconFont type="icon-map" style={normalStyle} />;
            case "INFO":
              // ALERT_INFO
              return <IconFont type="icon-map" style={infoStyle} />;
            case "WARNING":
              // ALERT_WARNING
              return <IconFont type="icon-map" style={warningStyle} />;
            case "ERROR":
              // ALERT_ERROR
              return <IconFont type="icon-map" style={errorStyle} />;
            case "CRITICAL":
              // ALERT_CRITICAL
              return <IconFont type="icon-map" style={criticalStyle} />;
            default:
              return <IconFont type="icon-map" style={unknownStyle} />;
        }
    }
  }

  render() {
    const {areaList, isItemsLoaded, isAreaListLoaded} = this.state;
    let markList = [];
    if (isItemsLoaded) {
      const items = this.state.items;
      markList = items.map((value) => {
        const position = {latitude: value.loc.lat, longitude: value.loc.lng};
        return {
          position: position,
          info: value
        };
      })
    }

    return (
      <div style={{height: 400, position: 'relative'}}>
        <Map useAMapUI
             center={this.mapCenter}
             zoom={this.state.zoom}
             amapkey={process.env.AMAP_KEY}
             plugins={plugins}
             events={this.mapEvents}
              >
          <Polygon path={this.state.selectAreaPath} style={this.state.polygonStyle}/>
          {isItemsLoaded &&
            <Markers
              markers={markList}
              useCluster={true}
              render={this.renderMarkerLayout}
              events={this.markersEvents}
              offset={this.state.markerOffset}
            />
          }
          <InfoWindow
            position={this.state.infoPosition}
            visible={this.state.infoVisible}
            isCustom
            size={this.state.infoSize}
            offset={this.state.infoOffset}
          >
            {this.state.infoVisible && <MapDeviceInfo
              endpointId={this.state.infoDetail.endpointId}
              projectName={this.state.infoDetail.projectName}
              alert={this.state.infoDetail.alert}
              position={this.state.infoDetail.position}
              status={this.state.infoDetail.status}
            />
            }
          </InfoWindow>
        </Map>

        <div className={styles.toolPanel} style={{minHeight: '150px'}}>
          <Collapse defaultActiveKey={["1"]}>
            <Panel header={this.msg['project.areaControl']} key="1">
              {
                ((this.state.areaList.length > 0) || isAreaListLoaded) ? <div className={styles.buttonMargin}>
                  <Select
                    style={{ width: '100%' }}
                    onChange={this.handleAreaChange}
                    placeholder={this.msg['common.choooseZone']}
                  >
                    {areaList.map(area => <Option key={area.name} value={area.token}>{area.name}</Option>)}
                  </Select>
                </div> : <div className="global-spin">
                  <Spin size="large" />
                </div>
              }
            </Panel>
          </Collapse>
        </div>
      </div>
    )
  }
}

@injectIntl()
class EndpointsList extends Component {
  constructor(props) {
    super(props);
    this.username = store.get('user').username;
    this.state = {
      optModal:{
        visible: false,
        title: "",
        type: "",
        data: {}
      }
    }
  }

  componentDidMount () {
    this.mounted = true;
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  msg = this.props.intl.messages

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
  }

  columnDefs = [
    {
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
      headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
    },{
      field: 'id',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    },{
      field: 'iccid',
      headerComponentParams: { fm: {id: "endpoint.common.iccid", defaultMessage: "ICCID"} }
    },{
      field: 'specification.name',
      headerComponentParams: { fm: {id: "endpoint.common.spec", defaultMessage: "规格"} }
    }, {
      field: 'assignmentToken',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} },
    },{
      field: "assignment.assetDto.name",
      headerComponentParams: { fm: {id: "endpoint.common.assignAsset", defaultMessage: "关联资产"} },
    },{
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

  agComponents = {
    dateCell: DateCell,
    cellMenu: CellMenuEndpoint,
    agColumnHeader: AgHeader,
    linkStatus: LinkStatus,
    alertStatus: AlertStatus,
    activeStatusCell: ActiveStatusCell
  }

  closeAll = () => {
    this.closeModal()
  }

  hdlSelectionChanged = () => {
    let selectedRows = this.gridApi.getSelectedRows()
    let batchEnable = false
    if(selectedRows.length > 0){
      batchEnable = true
      for (let endpoint of selectedRows) {
        if(endpoint.specToken !== selectedRows[0].specToken){
          batchEnable = false
        }
      }
    }
    this.mounted && this.setState({
      selectedRows,
      batchEnable,
    })
  }

  hdlCommandBatch = (data) => {
    let postData = {
      ...data,
      endpointIds: this.state.selectedRows.map(row => row.id),
      initiator: "REST",
      initiatorId: this.username,
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
    }
    optModal = {
      ...optModal,
      type,
      data,
      visible: true
    }
    log.debug('hdlOpenModal: ', optModal);
    this.setState({optModal})
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams
    let thiz = this
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        if(thiz.props.projectToken){
            queryEndPoints(pageParams)
            .then((res) => {
              log.info("get endpoints by endpoint api", res)
              let data = res.data
              pageParams.total = data.totalElements
              params.successCallback(data.content, pageParams.total);
            })
        }
      }
    };
    params.api.setDatasource(dataSource);
  }

  gridContext = {
    onOpenModal: this.hdlOpenModal
  }

  render() {
    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              {checkPermisson("",(
                <Button type="primary" size="small" className={"mr10"} onClick={() => {
                  let selectRows = this.gridApi.getSelectedRows();
                  this.hdlOpenModal("command", selectRows[0]);
                }}
                        disabled={!this.state.batchEnable}>
                  <Fm id="endpoint.common.createBatchTask" tagName="span" defaultMessage="批量发送指令" />
                </Button>
              ))}
            </Col>
            <Col span={12}>
              <Button size="small" className="fr"><IconFont type="icon-shezhi" /></Button>
              <Button size="small" className="fr mr10"><IconFont type="icon-daochu" /></Button>
              <Button size="small" className="fr mr10 ml10"><IconFont type="icon-shuaxin" /></Button>
            </Col>
          </Row>
        </div>
        <div className="content-content ">
          <ACGrid
            columnDefs={this.columnDefs}
            location={this.props.location}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            context={this.gridContext}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"multiple"}
          />
        </div>
        <Modal
          title={this.state.optModal.title}
          visible={this.state.optModal.visible}
          onCancel={this.closeModal}
          destroyOnClose
          footer={null}
        >
          <CommandBatch endList={[this.state.optModal.data]} onCommands={this.hdlCommandBatch} />
        </Modal>
      </div>
    );
  }
}

class PointsList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Location",
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'assignmentToken',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} }
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
        queryProjectEvents(pageParams)
          .then((res) => {
            log.info("get project event location api", res)
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

class MeasureList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Measurement",
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
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
        queryProjectEvents(pageParams)
          .then((res) => {
            log.info("get projct event measurement api", res)
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

class AlertList extends Component {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    eventType: "Alert",
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'assignmentToken',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} },
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
        queryProjectEvents(pageParams)
          .then((res) => {
            log.info("get project event alert api", res)
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

class ZoneLinkCell extends Component{

  render () {
    let path = this.props.value
    let html = path ? <a onClick={(e) => {
        e.preventDefault();
        this.props.context.onOpenModal("viewZone", this.props.data)
      }
    }>{path}</a> : '';
    return html
  }
}

@injectIntl()
@connect(({ global, commands, user }) => ({
  onXHR: global.onXHR,
  commands,
  user,
}))
@Form.create()
class Zone extends Component {
  constructor(props) {
    super(props);
    this.msg = this.props.intl.messages;

    this.state = {
      zoneDraw: false,
      optModal:{
        visible: false,
        title: "",
        type: "",
        data: {}
      }
    }
  }

  closeModal = (e) => {
    this.setState({
      optModal: {...this.state.optModal, visible: false},
    });
  }

  closeAll() {
    this.closeModal()
  }

  hdlOpenZoneDraw = () => {
    this.setState({zoneDraw: true})
  }

  closeZoneDrawer = () => {
    this.setState({zoneDraw: false})
  }

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "createdTime,desc",
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
  }

  columnDefs = [
    {
      field: 'name',
      cellRenderer: 'linkCell',
      headerComponentParams: { fm: {id: "common.name", defaultMessage: "名称"} },
    }, {
      field: "token",
      headerComponentParams: { fm: {id: "common.token", defaultMessage: "Token"} },
    },{
      field: "createdTime", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },
  ];

  agComponents = {
    dateCell: DateCell,
    agColumnHeader: AgHeader,
    linkCell: ZoneLinkCell
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;
    let pageParams = this.pageParams;
    const self = this;
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        pageParams.projectToken = self.props.projectToken;
        log.debug('project zone list ag-grid params: ', pageParams);
        queryProjectZones(pageParams)
          .then((res) => {
            log.info("get project zones api", res)
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
  }

  hdlDeleteRow = () => {
    const { intl: {messages} } = this.props;
    if(this.selectedRows.length < 1){
      message.error(messages['common.atLeastOne'], 3,)
    }else{
      let [ row ] = this.selectedRows;
      let thiz = this
      confirm({
        title: messages['alert.delete'],
        okText: messages['common.confirm'],
        okType: 'danger',
        cancelText: messages['common.cancel'],
        onOk() {
          deleteProjectZone(row.token)
            .then(res => {
              log.debug("删除区域：", res)
              thiz.gridApi.refreshInfiniteCache();
            })
        },
      });
    }
  }

  hdlOpenModal = (type, data) => {
    let optModal = this.state.optModal
    if(type === "addZone"){
      optModal.title = this.msg['area.common.addArea'];
    }else if(type === "viewZone") {
      optModal.title = this.msg['area.common.areaDetail'];
    }
    optModal = {
      ...optModal,
      type,
      data,
      visible: true
    }
    log.debug('hdlOpenModal: ', optModal);
    this.setState({optModal})
  }

  hdlAddZone = (data) => {
    log.debug('handle add zone callback: ', data);
    let postData = {
      name: data.name,
      metaData: data.metaData,
      coordinates: data.path,
      projectToken: this.props.projectToken,
      tenantId: this.props.tenantId
    };
    createZone(postData)
    .then((res) => {
      log.info("create project zone api", res)
      if(res.status === 201){
        this.closeAll();
        this.gridApi.refreshInfiniteCache();
      }
    })
  }

  gridContext = {
    onOpenModal: this.hdlOpenModal
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const Option = ACSelect.Option
    const mapCenter = this.props.mapCenter;
    let modalContent
    let type = this.state.optModal.type
    if(type === "addZone"){
      modalContent = <AddZone onAddZone={this.hdlAddZone} mapCenter={mapCenter} />
    }else if (type === "viewZone"){
      modalContent = <ViewZone zoneData={this.state.optModal.data} mapCenter={mapCenter} />
    }

    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={() => {
                let selectRow = this.gridApi.getSelectedRows();
                this.hdlOpenModal("addZone", selectRow);
              }}>
                <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
              </Button>
              <Button type="danger" size="small" icon="minus" onClick={this.hdlDeleteRow}>
                <Fm id="common.delete" tagName="span" defaultMessage="删除" />
              </Button>
            </Col>
            <Col span={12}>
              <Button size="small" className="fr"><IconFont type="icon-shezhi" /></Button>
              <Button size="small" className="fr mr10"><IconFont type="icon-daochu" /></Button>
              <Button size="small" className="fr mr10 ml10"><IconFont type="icon-shuaxin" /></Button>
            </Col>
          </Row>
        </div>
        <div style={{minHeight: 300,position: "relative"}}>
          <ACGrid
            columnDefs={this.columnDefs}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"single"}
            context={this.gridContext}
          />
        </div>
        <Drawer
          title={<Title>{this.msg['assignment.common.invokecommand']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeZoneDrawer}
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
        <Modal
          title={this.state.optModal.title}
          visible={this.state.optModal.visible}
          onCancel={this.closeModal}
          context={this.gridContext}
          destroyOnClose
          footer={null}
          width={1024}
          style={{top: 30}}
        >
          {modalContent}
        </Modal>
      </div>
    );
  }
}

class History extends EndHistory {

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
    sort: "_id,desc",
    tenantId: this.props.tenantId,
    projectToken: this.props.projectToken
  }

  columnDefs = [
    {
      field: 'endpointId',
      headerComponentParams: { fm: {id: "common.endpointId", defaultMessage: "终端ID"} }
    }, {
      field: 'assignmentToken',
      headerComponentParams: { fm: {id: "endpoint.common.assignToken", defaultMessage: "关联Token"} }
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
            log.info("get project event history api", res)
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

export {  LinkCell, AlertStatGraph, EndpointStatGraph,
          CellMenuEndpoint, EndpointsList, PointsList,
          MeasureList, History, Zone, AlertList, ProjectMap };
