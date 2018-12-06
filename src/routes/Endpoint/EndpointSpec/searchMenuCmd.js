import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, Row} from "antd";
import {ACInput} from "acom/Form";
import React from "react";
import { injectIntl} from 'acom/Intl';

const FormItem = Form.Item;

@injectIntl()
@connect(({ global, tenants }) => ({
  onXHR: global.onXHR,
  tenants,
}))
@Form.create()
export default class SearchMenu extends Component {
  state = {
    
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSearch(values)
      }
    });
  }

  hdlClear = (e) => {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      tenantId: null,
      name: null,
      hardwareId: null,
      containerPolicy: null
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { setFieldsValue } = this.props.form;
    if(nextProps.searchId !== this.props.searchId){
      setFieldsValue({id: nextProps.searchId})
    }
  }

  render () {
    const {intl: {messages}} = this.props
    const { getFieldDecorator } = this.props.form;

    return (
      <Form className='search-form' onSubmit={this.hdlSubmit}>
        <FormItem
          label={messages['specification.command.commandname']}
        >
          {getFieldDecorator('name')(
            <ACInput size="small" />
          )}
        </FormItem>
        <Row>
          <Button type="primary" htmlType="submit" size="small" loading={this.props.onXHR} style={{ marginRight: 8 }}>{messages['common.search']}</Button>
          <Button type="default" size="small" onClick={this.hdlClear} loading={this.props.onXHR}>{messages['common.clearSearch']}</Button>
        </Row>
      </Form>
    )
  }
}
