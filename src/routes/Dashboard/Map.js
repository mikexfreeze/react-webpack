import React, { Component } from 'react';
import { Map, Markers, InfoWindow } from 'react-amap';
import {analysisDatastream} from 'services/endpointApi';
import log from 'utils/log';
import IconFont from 'components/Icon/IconFont';
import { MapDeviceInfo } from './Components';

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


export default class HomeMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoom: 4,
      items: null,
      isItemsLoaded: false,
      center: {latitude: 34.398263, longitude: 108.834356},
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
      markerOffset: [-16, -16],
      mapStatus: {
        scrollWheel: false
      }
    };

    this.mapInstance = null;
  }

  componentDidMount() {

  }

  hdlEvents = {
    created: (ins) => {
      log.debug(ins); this.mapInstance = ins;
      let bounds = this.mapInstance.getBounds();
      log.debug('get map bounds: ', bounds);
      log.debug('get south west: ', bounds.getSouthWest());
      log.debug('get north east: ', bounds.getNorthEast());
      log.debug('transformed bounds: ', this.getMapPointBound(bounds));
      this.getAreaPoint();
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
    zoomend: () => {
      log.debug('zoom end');
      this.getAreaPoint();
    },
    moveend: () => {
      log.debug('move end');
      this.getAreaPoint();
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

  getAreaPoint() {
    let time = new Date().getTime();
    let start = time - 3600*24*180*1000;
    if (this.mapInstance) {
      let bounds = this.mapInstance.getBounds();
      log.debug('get map bounds: ', bounds);
    }
    const bounds = this.mapInstance.getBounds();
    if (!bounds || bounds.length === 0) return;
    const mapPoints = this.getMapPointBound(bounds);
    let postData = {
      direction: "DESC",
      eventType: "Location",
      mapOperationType: "AREA",
      tenantId: this.props.tenantId,
      projectToken: this.props.projectToken,
      mapPoints: mapPoints,
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
    const { isItemsLoaded } = this.state;
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
      <div style={{height: 400}}>
        <Map
          useAMapUI
          center={this.state.center}
          zoom={this.state.zoom}
          amapkey={process.env.AMAP_KEY}
          events={this.hdlEvents}
          plugins={plugins}
          status={this.state.mapStatus}
          >
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
      </div>
    );
  }
}