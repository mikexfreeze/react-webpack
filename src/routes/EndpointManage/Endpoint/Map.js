import React, {Component} from 'react';
import {Marker, InfoWindow, Map} from 'react-amap';
import {Toolbar} from "acom/AMap";
import {analysisDatastream} from 'services/endpointApi'
import {log} from "utils";
import {injectIntl} from "acom/Intl";
import {TracingMenu, Path} from "components/Map";
import {message} from 'antd'

@injectIntl()
class MyMap extends Component {
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
    this.getLastPoint()
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
    let offset = [0, -10]
    let markInfoHtml = `<span>
      ${this.msg['common.longtitude']}: ${this.state.longitude}<br />
      ${this.msg['common.latitude']}: ${this.state.latitude}
    </span>`
    return (
      <div style={{height: 400, position: 'relative'}}>
        <Map useAMapUI
             center={center}
             events={this.hdlEvents}
             amapkey={process.env.AMAP_KEY}
              >
          <Toolbar />
          <Path onReady={this.hdlPathInsReady} />
          <Marker position={center} events={this.markerEvents} />
          <InfoWindow  position={center}
                       visible={this.state.showMarkInfo}
                       content={markInfoHtml}
                       offset={offset}
          />
        </Map>
        <TracingMenu onPlayback={this.hdlTracePlayback}
                     onTracing={this.hdlTracing}
                     onStopTracing={this.hdlStopTracing}
                     onTabChange={this.hdlTabChange}/>
      </div>
    );
  }
}

export default MyMap;
