import { Component } from 'react'
import {Button, Card, Col, Divider, Form, Icon, Input, message, Row} from "antd";
import React from "react";
import { connect } from 'dva'
import { updateEndpointCategory } from "services/endpointCategoryApi";
import { injectIntl } from 'acom/Intl/injectIntl'

@connect(({endpointCategory, global}) => ({
  onXHR: global.onXHR,
  endpointCategory,
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      id: Form.createFormField({
        value: props.endpointCategory.id
      }),
      sku: Form.createFormField({
        value: props.endpointCategory.sku
      }),
      name: Form.createFormField({
        value: props.endpointCategory.name
      }),
      description: Form.createFormField({
        value: props.endpointCategory.description
      }),
      metaKeys:Form.createFormField({
        value: Object.entries(JSON.parse(props.endpointCategory.properties ? props.endpointCategory.properties : '{"a":"1"}')).map((k, i) => i)
      }),
      // meta: Form.createFormField({
      //   value: []
      // }),
    }
  },
})
@injectIntl()
export default class EndpointCategoryEditor extends Component {

  componentDidMount () {
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
    this.getMeta()
  }

  getMeta = () => {
    const { dispatch } = this.props;
    dispatch({
        type: 'endpointCategory/fetch', 
        payload: {
          id: this.id,
          tenantId: this.tenantId
        }
      })
      .then(res => {
        const {form} = this.props;
        let metaData = Object.entries(JSON.parse(res.data.properties ? res.data.properties : "{}"))
        setTimeout(function () {
          form.setFieldsValue({
            meta: metaData,
          })
        }, 200)
      })
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    const {intl: {messages}} = this.props;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.metaData = {}
        for (let v of values.meta) {
          values.metaData[v[0]] = v[1]
        }
        updateEndpointCategory(values)
          .then(res => {
            if(res.status === 200){
              message.success(messages['common.edit'] + ' ' + messages['common.success']);
              this.getMeta()
              // this.props.history.goBack()
            }
          })
      }
    });
  }

  uuid = 100

  addMeta = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    const nextKeys = keys.concat(this.uuid);
    this.uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      metaKeys: nextKeys,
    });
  }

  removeMeta = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }
    // can use data-binding to set
    form.setFieldsValue({
      metaKeys: keys.filter(key => key !== k),
    });
  }

  render () {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { TextArea } = Input;
    const { intl: {messages} } = this.props;

    getFieldDecorator('metaKeys', {initialValue: [1]})
    const metaData = getFieldValue('metaKeys');
    const formMetas = metaData.map((k, i) => {
      return (
        <Row gutter={8} key={i} type="flex">
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][0]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['common.inputName'],
                }],
              })(
                <Input placeholder={messages['common.inputName']} />
              )}
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][1]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['common.inputValue'],
                }],
              })(
                <Input placeholder={messages['common.inputValue']} />
              )}
            </Form.Item>
          </Col>
          {metaData.length > 1 ? (
            <Col span={2}>
              <Icon
                style={{"fontSize":"20px", "paddingTop":"9px"}}
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={metaData.length === 1}
                onClick={() => this.removeMeta(k)}
              />
            </Col>

          ) : null}

        </Row>
      )
    })

    return (
      <Card>
        <Form onSubmit={this.hdlSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="ID">
                {getFieldDecorator('id', {
                  rules: [{ required: true, message: messages['alert.inputrequired'] }],
                })(
                  <Input type="text" readOnly />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={ messages['common.name'] }>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: messages['alert.inputrequired'] }],
                })(<Input placeholder={messages['alert.inputCorrectIdOrUsername']} />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SKU">
                {getFieldDecorator('sku')(<Input placeholder={messages['alert.inputCorrentJasperId']} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <div className="ant-form-item-label">
                <label className="" title={messages['common.metadata']}>{messages['common.metadata']}</label>
              </div>
              {formMetas}
              <Row>
                <Col span={22}>
                  <Button type="dashed" onClick={this.addMeta} style={{width:"100%", margin: "10px 0 24px"}}>
                    <Icon type="plus" /> {messages['common.addAItem']}
                  </Button>
                </Col>
              </Row>

            </Col>
            <Col span={12}>
              <Form.Item label={messages['common.description']}>
                {getFieldDecorator('description', {})(
                  <TextArea placeholder={messages['alert.inputMaxLength300']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
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
