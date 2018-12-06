import {Component} from "react";
import React from "react";
import {MetaInput} from "components";
import {Button, Col, Row, Form, Input, Spin} from "antd";
import {injectIntl} from "acom/Intl";
import {ViewZoneMap, AddZoneMap} from './ZoneMap';
import DescriptionList from 'acom/DescriptionList/index';
import DateCell from 'acom/Cell/DateCell'
import {connect} from "dva";

const { Description } = DescriptionList;

@injectIntl()
@connect(({ global}) => ({
  onXHR: global.onXHR
}))
@Form.create()
export class AddZone extends Component {

  msg = this.props.intl.messages;
  path = [];

  state = {
    commands: [],
    command: undefined,
  }

  hdlSubmit = (e) => {
    e.preventDefault();
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
    this.props.onAddZone({
      ...formValues,
      metaData,
      path: this.path
    })
  }

  onDrawEnd = (path) => {
    this.path = path;
  }

  render() {

    const { getFieldDecorator } = this.props.form
    const mapCenter = this.props.mapCenter;

    return (
      <Form onSubmit={this.hdlSubmit} layout="inline">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['common.name']}>
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: this.msg['alert.inputrequired'] },
                  {pattern: /^[a-zA-Z0-9_\u4E00-\u9FA5]{0,128}$/g, message: this.msg['alert.inputCorrentName']}
                ],
              })(
                <Input type="text" />
              )}
            </Form.Item>
          </Col>

          <Col span={24}>
            <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
          </Col>
        </Row>

        <AddZoneMap mapCenter={mapCenter} onDrawEnd={this.onDrawEnd}></AddZoneMap>

        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

@injectIntl()
export class ViewZone extends Component {

  msg = this.props.intl.messages

  render() {
    const zone = this.props.zoneData;
    const mapCenter = this.props.mapCenter;
    return (
      <div>
        { zone.token ?
          <div>
            <DescriptionList
                 style={{ marginBottom: 10 }}>
              <Description term={this.msg['common.name']}>{zone.name}</Description>
              <Description term={this.msg['common.token']}>{zone.token}</Description>
              <Description term={this.msg['common.createby']}>{zone.createdBy}</Description>
              <Description term={this.msg['common.createdtime']}><DateCell value={zone.createdTime} /></Description>
            </DescriptionList>

            <ViewZoneMap mapCenter={mapCenter} zoneData={zone}></ViewZoneMap>
          </div> :
          <div className="global-spin">
            <Spin size="large" />
          </div>
        }

      </div>
    );
  }
}