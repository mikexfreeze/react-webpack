import {Component} from "react";
import React from "react";
import {Map, Polygon, MouseTool} from 'react-amap';
import { Collapse, Radio, Button, Select, Spin } from 'antd';
import styles from './project.less';
import {log} from 'utils';
import { injectIntl, Fm } from 'acom/Intl';

const Panel = Collapse.Panel;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const plugins = [
  'Scale',
  'ToolBar'
];

@injectIntl()
export class AddZoneMap extends Component {
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
      radioValue: 1,
      provinceData: [],
      province: '江苏省',
      cities: [],
      city: '南京市',
      districts: [],
      district: null,
      selectAreaPath: [],
      polygonStyle: {
        strokeColor: '#0099CC',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#c6e2ff',
        fillOpacity: 0.5
      }
    };

    this.districtSearch = null;

    this.mapEvents = {
      created: (ins) => {
        log.debug('map created success.');
        self.map = ins;
        window.AMap.plugin('AMap.DistrictSearch', function() {
          self.districtSearch = new window.AMap.DistrictSearch({
            level: 'country',
            subdistrict: 1,
            showbiz: false,
            extensions: 'all'
          });

          self.districtSearch.search('中国', (status, result) => {
            log.debug('district search status: ', status);
            log.debug('district search result: ', result);
            if (result.info !== 'OK') return;
            let proviceList = result.districtList[0].districtList;
            let provinceData = [];
            proviceList.forEach((value) => {
              provinceData.push(value.name);
            })
            self.setState({
              provinceData: provinceData,
              province: provinceData[0]
            });
          })
        });
      }
    }

    this.toolEvents = {
      created: (tool) => {
        self.tool = tool;
      },
      draw({obj}) {
        self.drawEnd(obj);
      }
    }

    this.polygonEvents = {
      created: (ins) => {
        log.debug('polygon created.')
        self.polygon = ins;
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    log.debug('componentDidUpdate: ', prevState.selectAreaPath, this.state.selectAreaPath);

    if (this.state.selectAreaPath !== prevState.selectAreaPath) {
      log.debug('set map fit view ready');
      if (this.map && this.polygon) {
        log.debug('set map fit view');
        this.map.setFitView(this.polygon);
      }
    }
  }

  drawEnd(obj) {
    if (this.tool) {
      this.tool.close();
    }

    log.debug('draw end: ', obj);
    let path = [];

    if (obj.CLASS_NAME === 'AMap.Polygon') {
      let pathList = obj.getPath();

      if (pathList.length === 0) return;

      pathList.forEach((element) => {
        path.push({lng: element.lng, lat: element.lat});
      })

      // 补充起点，形成闭合的图形，后台接口需求
      path.push(path[0]);
    }
    this.props.onDrawEnd(path);
  }

  districtSelectEnd(pathList) {
    if (!pathList || pathList.length === 0) return;

    let path = [];
    pathList.forEach((element) => {
      path.push({lng: element.lng, lat: element.lat});
    })

    this.props.onDrawEnd(path);
  }

  drawPolygon() {
    this.close();
    if (this.tool) {
      this.tool.polygon({
        strokeColor: '#0099CC',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#c6e2ff',
        fillOpacity: 0.5
      });
    }
  }

  drawRectangle() {
    this.close();
    if (this.tool) {
      this.tool.rectangle({
        strokeColor: '#0099CC',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#c6e2ff',
        fillOpacity: 0.5
      });
    }
  }

  drawCircle() {
    this.close();
    if (this.tool) {
      this.tool.circle();
    }
  }

  close() {
    if (this.tool) {
      this.tool.close(true);
    }
  }

  onRadioChange = (e) => {
    this.setState({
      radioValue: e.target.value
    })
  }

  handleProvinceChange = (value) => {
    log.debug('province change: ', value);
    this.setState({
      province: null,
      cities: [],
      districts: []
    })
    const self = this;
    this.districtSearch.search(value, (status, result) => {
      log.debug('district search status: ', status);
      log.debug('district search result: ', result);
      if (result.info !== 'OK') return;
      let cityList = result.districtList[0].districtList;
      // 获取边界区域
      const selectedAreaBoundaries = result.districtList[0].boundaries;
      log.debug('provice polyline: ', selectedAreaBoundaries);
      let selectBound = null;
      let maxLen = 0;
      selectedAreaBoundaries.forEach((value) => {
        if (value.length > maxLen) {
          selectBound = value;
          maxLen = value.length;
        }
      })
      let selectedAreaPath = selectBound;
      this.districtSelectEnd(selectedAreaPath);
      // 获取城市列表
      let cityData = [];
      cityList.forEach((value) => {
        cityData.push(value.name);
      })
      self.setState({
        province: value,
        cities: cityData,
        city: cityData[0],
        selectAreaPath: selectedAreaPath
      });
    }, {
      level: 'province',
      subdistrict: 1,
      showbiz: false,
      extensions: 'all'
    })
  }

  handleCityChange = (value) => {
    log.debug('city change: ', value);
    this.setState({
      districts: [],
      city: null
    });
    const self = this;
    this.districtSearch.search(value, (status, result) => {
      log.debug('district search status: ', status);
      log.debug('district search result: ', result);
      if (result.info !== 'OK') return;
      let districtList = result.districtList[0].districtList;
      // 获取边界区域
      const selectedAreaBoundaries = result.districtList[0].boundaries;
      log.debug('city polyline: ', selectedAreaBoundaries);
      let selectBound = null;
      let maxLen = 0;
      selectedAreaBoundaries.forEach((value) => {
        if (value.length > maxLen) {
          selectBound = value;
          maxLen = value.length;
        }
      })
      let selectedAreaPath = selectBound;
      this.districtSelectEnd(selectedAreaPath);
      // 获取区级列表
      let districtData = [];
      districtList.forEach((value) => {
        districtData.push(value.name);
      })
      self.setState({
        city: value,
        districts: districtData,
        district: districtData[0],
        selectAreaPath: selectedAreaPath
      });
    }, {
      level: 'city',
      subdistrict: 1,
      showbiz: false,
      extensions: 'all'
    })
  }

  handleDistrictChange = (value) => {
    log.debug('district change: ', value);
    this.setState({
      district: value
    });

    const self = this;
    this.districtSearch.search(value, (status, result) => {
      log.debug('district search status: ', status);
      log.debug('district search result: ', result);
      if (result.info !== 'OK') return;
      // 获取边界区域
      const selectedAreaBoundaries = result.districtList[0].boundaries;
      log.debug('district polyline: ', selectedAreaBoundaries);
      let selectBound = null;
      let maxLen = 0;
      selectedAreaBoundaries.forEach((value) => {
        if (value.length > maxLen) {
          selectBound = value;
          maxLen = value.length;
        }
      })
      let selectedAreaPath = selectBound;
      this.districtSelectEnd(selectedAreaPath);
      self.setState({
        selectAreaPath: selectedAreaPath
      });
    }, {
      level: 'district',
      subdistrict: 0,
      showbiz: false,
      extensions: 'all'
    })
  }

  render() {
    let {provinceData, province, cities, city,  districts, district} = this.state;
    log.debug('ZoneMap render provinceData: ', provinceData);

    return (
      <div style={{height: 400, position: 'relative'}}>
        <Map useAMapUI
             center={this.mapCenter}
             zoom={this.state.zoom}
             amapkey={process.env.AMAP_KEY}
             plugins={plugins}
             events={this.mapEvents}
              >
          <MouseTool events={this.toolEvents} />
          <Polygon path={this.state.selectAreaPath} events={this.polygonEvents} style={this.state.polygonStyle}/>
        </Map>

        <div className={styles.toolPanel}>
          <Collapse defaultActiveKey={["1"]}>
            <Panel header={this.msg['project.areaOption']} key="1">
              <RadioGroup onChange={this.onRadioChange} value={this.state.radioValue}>
                <Radio value={1}><Fm id="area.common.administrationArea" defaultMessage="行政区域" /></Radio>
                <Radio value={2}><Fm id="area.common.customArea" defaultMessage="自定义区域" /></Radio>
              </RadioGroup>
              { this.state.radioValue === 2 && <div>
                <Button className={styles.buttonMargin} onClick={()=>{this.drawRectangle()}} block><Fm id="area.common.rectangle" defaultMessage="矩形" /></Button>
                <Button className={styles.buttonMargin} onClick={()=>{this.drawPolygon()}} block><Fm id="area.common.polyon" defaultMessage="多边形" /></Button>
                <Button className={styles.buttonMargin} onClick={()=>{this.close()}} block><Fm id="common.clear" defaultMessage="清空" /></Button>
              </div> }
              {
                this.state.radioValue === 1 && (provinceData.length > 0) ? <div className={styles.buttonMargin}>
                  <Select
                    defaultValue={provinceData[0]}
                    style={{ width: '100%' }}
                    onChange={this.handleProvinceChange}
                  >
                    {provinceData.map(province => <Option key={province}>{province}</Option>)}
                  </Select>
                </div> :
                this.state.radioValue === 1 && <div className="global-spin">
                  <Spin size="large" />
                </div>
              }
              {
                this.state.radioValue === 1 && (cities.length > 0) ? <div className={styles.buttonMargin}>
                <Select
                  style={{ width: '100%' }}
                  onChange={this.handleCityChange}
                  value={city}
                >
                  {cities.map(city => <Option key={city}>{city}</Option>)}
                </Select>
                </div> :
                this.state.radioValue === 1 && !province && <div className="global-spin">
                  <Spin size="large" />
                </div>
              }
              {
                this.state.radioValue === 1 && (districts.length > 0) ? <div className={styles.buttonMargin}>
                <Select
                  style={{ width: '100%' }}
                  onChange={this.handleDistrictChange}
                  value={district}
                >
                  {districts.map(district => <Option key={district}>{district}</Option>)}
                </Select>
                </div> :
                this.state.radioValue === 1 && !city && <div className="global-spin">
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

export class ViewZoneMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: this.props.mapCenter ? this.props.mapCenter.centerLatitude : 39.9788,
      longitude: this.props.mapCenter ? this.props.mapCenter.centerLongtitude : 116.30226,
      zoom: this.props.mapCenter ? this.props.mapCenter.zoom.value : 10,
      visible: true,
      path: this.props.zoneData.coordinates,
      style: {
        strokeColor: '#0099CC',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#c6e2ff',
        fillOpacity: 0.5
      }
    };

    this.mapInstance = null;

    this.mapEvents = {
      created: (ins) => {
        log.debug('get map instance');
        this.mapInstance = ins;
      }
    }

    this.polygonEvents = {
      created: (ins) => {
        if (this.mapInstance) {
          this.mapInstance.setFitView(ins);
        }
      }
    }
  }

  render() {
    let center = {latitude:this.state.latitude, longitude:this.state.longitude};

    return (
      <div style={{height: 400, position: 'relative'}}>
        <Map useAMapUI
             center={center}
             amapkey={process.env.AMAP_KEY}
             plugins={plugins}
             events={this.mapEvents}
              >
          <Polygon
            path={this.state.path}
            visible={this.state.visible}
            style={this.state.style}
            events={this.polygonEvents}
          />
        </Map>
      </div>
    );
  }
}