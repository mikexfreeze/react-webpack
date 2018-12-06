/* create by Micheal Xiao 2018/11/12 11:38 */
import React, {Component} from 'react';
import {Fm, injectIntl} from "acom/Intl";
import {Button, Card, Col, Divider, Form, message, Row, Slider} from "antd";
import {Title} from "acom";
import {ACInput as Input, ACSelect as Select} from "acom/Form";
import {connect} from "dva";
import {MetaInput} from "components";
import {createProject, queryProjectByToken, updateProject} from "services/projectApi";
import {Toolbar} from "acom/AMap";
import {Map, Marker} from "react-amap";
import {log} from "utils";

const {Option} = Select
const {TextArea} = Input

@injectIntl()
@Form.create()
@connect(({global, user, tenants}) => ({
  onXHR: global.onXHR,
  user,
  tenants,
}))
class ProjectEditor extends Component {

  constructor (props) {
    super(props)

    const params = this.props.match.params
    this.editor = false
    if(params.token){
      this.token = params.token
      this.editor = true
    }
    this.detail = false
    if(this.props.match.path.indexOf("detail") > -1){
      this.detail = true
    }

  }

  msg = this.props.intl.messages

  state = {
    data: {}
  }

  hdlEvents = {
    created: (ins) => {
      this.mapIns = ins
    },
    click: (e) => {
      this.setFieldsValue({
        'mapData.centerLatitude': e.lnglat.lat,
        'mapData.centerLongtitude': e.lnglat.lng,
      })
    },
    zoomend: (e) => {
      console.log(this.mapIns.getZoom())
      if(this.getFieldValue('mapData.zoom') !== undefined){
        this.setFieldsValue({
          'mapData.zoom': this.mapIns.getZoom(),
        })
      }

    },
  }

  componentDidMount () {
    const {dispatch} = this.props;
    const {setFieldsValue, getFieldValue} = this.props.form
    this.setFieldsValue = setFieldsValue
    this.getFieldValue = getFieldValue
    let params = this.props.match.params
    dispatch({type: 'tenants/fetch'});
    if(params.token){
      queryProjectByToken({
        token: params.token,
        tenantId: params.tenantId
      })
        .then(res => {
          log.info("queryProjectByToken:", res.data)
          setFieldsValue({
            ...res.data,
            mapData: JSON.parse(res.data.mapData)
          })
          let metaData = res.data.metaData
          if(metaData !== "{}"){
            let meta = []
            for (let v of Object.values(JSON.parse(metaData))) {
              let key = Object.keys(v)[0]
              meta.push([key, v[key]])
            }
            this.metaInput.setDefaultValue(meta)
          }
          this.setState({data: res.data})
        })
    }
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    let params = this.props.match.params

    let error;
    let formValues;
    let meta;
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    })
    this.metaInput.validator((err, data) => {
      if (err) {
        error = {
          ...error,
          meta: err,
        }
      } else {
        meta = data
      }
    })

    if (error) {
      console.log('error', error)
      return
    }
    console.log(formValues, meta)
    let metaData = {}
    if(meta){
      for (let v of meta) {
        metaData[`${v[0]}`] = v[1]
      }
    }
    if(this.editor){
      updateProject({
        ...formValues,
        metaData,
        token: params.token,
      }).then(res => {
        console.log("编辑项目：", res)
        if (res.status === 200) {
          message.success(this.msg['alert.editSuccess']);
        }
      })
    }else{
      createProject({
        ...formValues,
        metaData,
      }).then(res => {
        console.log("创建项目：", res)
        if (res.status === 201) {
          message.success(this.msg['alert.createSuccess']);
          this.props.history.goBack()
        }
      })
    }

  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form

    const editor = this.state.editor
    const center = {latitude:getFieldValue("mapData.centerLatitude"), longitude:getFieldValue("mapData.centerLongtitude")}
    return (
      <Card>
        <Form onSubmit={this.hdlSubmit}>
          <Title className="title mb10"><Fm id="project.addProject" defaultMessage="添加项目" /></Title>
          <Row gutter={16}>
            {this.props.user.level === 1 &&
            <Col span={8}>
              <Form.Item label={<Fm id="common.tenantid" defaultMessage="租户ID" />}>
                {getFieldDecorator('tenantId', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <Select placeholder={this.msg['alert.common.pleaseChoose']} disabled={editor}>
                    {this.props.tenants.map(tenant => {
                      return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            }
            <Col span={8}>
              <Form.Item label={<Fm id="common.name" defaultMessage="名称" />}>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} disabled={editor} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['common.description']}>
                {getFieldDecorator('description', {})(
                  <TextArea placeholder={this.msg['common.pleaseInput']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
            </Col>

          </Row>
          <Title className="title mt24 mb10"><Fm id="common.map" defaultMessage="地图" /></Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.mapApiKey" defaultMessage="百度地图API Key" />}>
                {getFieldDecorator('baiduMapApiKey', {
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
              <Form.Item label={<Fm id="common.longtitude" defaultMessage="经度" />}>
                {getFieldDecorator('mapData.centerLongtitude', {initialValue: "118.79"})(
                  <Input placeholder={this.msg['common.pleaseInput']} clear="false" />
                )}
              </Form.Item>
              <Form.Item label={<Fm id="common.latitude" defaultMessage="纬度" />}>
                {getFieldDecorator('mapData.centerLatitude', {initialValue: "32.03"})(
                  <Input placeholder={this.msg['common.pleaseInput']} clear="false" />
                )}
              </Form.Item>
              <Form.Item label={<Fm id="project.zoomLevel" defaultMessage="缩放级别" />}>
                {getFieldDecorator('mapData.zoom', {initialValue: 10})(
                  <Slider max={18} />
                )}
              </Form.Item>
            </Col>
            <Col span={16}>
              <div style={{height: 400, position: 'relative'}}>
              <Map useAMapUI
                   events={this.hdlEvents}
                   center={center}
                   amapkey={process.env.AMAP_KEY}
                   zoom={getFieldValue("mapData.zoom")}
              >
                <Marker position={center} />
                <Toolbar />
              </Map>
              </div>
            </Col>

          </Row>
          <Divider style={{ marginBottom: 32 }} />

          <Row>
            <Col span={3} offset={8} className="text-center">
              <Button type="default" onClick={this.props.history.goBack} block>
                <Fm id="common.goBack" defaultMessage="返回" />
              </Button>
            </Col>
            <Col span={3} offset={1} className="text-center">
              <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>
                <Fm id="common.submit" defaultMessage="提交"/>
              </Button>
            </Col>
          </Row>

        </Form>
      </Card>
    );
  }
}

export default ProjectEditor;
