import { Component } from 'react'
import {Button, Card, Col, Divider, Form, Input, message, Row, Select} from "antd";
import React from "react";
import { connect } from 'dva'
import { updateEndpointSpec } from "services/endpointSpecApi";
import { injectIntl } from 'acom/Intl/injectIntl';
import {Log} from 'utils/log';
import MetaInput from "components/MetaInput";

@connect(({endpointSpec, global, endpointCategory}) => ({
  onXHR: global.onXHR,
  endpointSpec,
  endpointCategory
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      token: Form.createFormField({
        value: props.endpointSpec.token
      }),
      name: Form.createFormField({
        value: props.endpointSpec.name
      }),
      hardwareId: Form.createFormField({
        value: props.endpointSpec.hardwareId
      }),
      containerPolicy: Form.createFormField({
        value: props.endpointSpec.containerPolicy
      }),
      metaKeys:Form.createFormField({
        value: Object.entries(JSON.parse(props.endpointSpec.properties ? props.endpointSpec.properties : '{"a":"1"}')).map((k, i) => i)
      })
    }
  },
})
@injectIntl()
export default class EndpointSpecEditor extends Component {
  constructor(props) {
    super(props);
    this.token = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
  }

  componentDidMount () {
    const { dispatch, form } = this.props;
    const { setFieldsValue } = form;
    
    dispatch({
        type: 'endpointSpec/fetch', 
        payload: {
          token: this.token,
          tenantId: this.tenantId
        }
      })
      .then(res => {
        const spec = res.data;
        setFieldsValue({
          token: spec.token,
          name: spec.name,
          hardwareId: spec.hardwareId,
          containerPolicy: this.transformContainerPolicy(spec.containerPolicy),
        })
        let meta = []
        for (let v of Object.values(JSON.parse(res.data.metaData))) {
          let key = Object.keys(v)[0]
          meta.push([key, v[key]])
        }
        this.metaInput.setDefaultValue(meta)
      })

      dispatch({
        type: 'endpointCategory/fetchAll',
        payload: {
          tenantId: this.tenantId
        }
      });
  }

  transformContainerPolicy = (value) => {
    const { intl: {messages} } = this.props;

    if (value === 'Composite') {
      return messages['specification.common.composite'];
    }else {
      return messages['specification.common.standalone'];
    }
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    const {intl: {messages}} = this.props;
    let error;let formValues;let meta = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    })

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
      Log.error('error', error)
      return
    }
    let metaData = {}
    for (let [i, v] of Object.entries(meta)) {
      metaData[`元数据-${i}`] = {[v[0]]: v[1]}
    }
    let postData = {
      ...formValues,
      metaData,
    }

    updateEndpointSpec(postData)
      .then(res => {
        if(res.status === 200){
          message.success(messages['common.edit'] + ' ' + messages['common.success']);
        }
      })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const { intl: {messages} } = this.props;
    const Option = Select.Option;
    
    return (
      <Card>
        <Form onSubmit={this.hdlSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={messages['common.token']}>
                {getFieldDecorator('token', {
                })(
                  <Input type="text" readOnly />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={ messages['specification.common.specificationname'] }>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: messages['alert.inputrequired'] }],
                })(<Input placeholder={messages['alert.inputCorrectIdOrUsername']} />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={messages['endpointCategory.endpointCategory']}>
                  {getFieldDecorator('hardwareId', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                  })(
                    <Select placeholder={messages['specification.common.chooseCategory']}>
                      {this.props.endpointCategory.categories.map(cat => {
                        return (<Option value={cat.id} key={cat.id}>{cat.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={messages['specification.common.containertype']}>
                {getFieldDecorator('containerPolicy', {
                })(
                  <Input type="text" readOnly />
                )}
              </Form.Item>
              </Col>
            <Col span={12}>
              <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={8} className="text-center">
                <Button type="default" onClick={this.props.history.goBack} block>{messages['common.return']}</Button>
            </Col>
            <Col span={3} offset={1} className="text-center">
                <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{messages['common.submit']}</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }
}
