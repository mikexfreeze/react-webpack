import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, Row, DatePicker} from "antd";
import {ACInput, ACSelect} from "acom/Form";
import React from "react";
import { injectIntl} from 'acom/Intl';
import {Log} from 'utils/log';
import store from 'store2';

const FormItem = Form.Item;
const Option = ACSelect.Option;
const { RangePicker } = DatePicker;

@injectIntl()
@connect(({ global, tenants }) => ({
  onXHR: global.onXHR,
  tenants,
}))
@Form.create()
export default class SearchMenu extends Component {
  constructor(props) {
    super(props);
    this.userLevel = store.get('user').level;

    if (this.userLevel !== 1) {
      this.tenantId = store.get('user').tenantId;
    }
  }

  state = {

  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (this.userLevel !== 1) {
        values.tenantId = this.tenantId;
      }
      Log.debug('submit search: ', values);

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
      token: null,
      timeRange: null
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
          label={messages['common.tenantid']}
          style={{display: this.userLevel !== 1 ? 'none': 'block'}}
        >
          {getFieldDecorator('tenantId')(
          <ACSelect placeholder={messages['common.chooseTenant']}
                  onSelect={this.hdlTenantChange}
                  size="small" style={{ width: "100%" }}>
            {this.props.tenants.map(tenant => {
              return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
            })}
          </ACSelect>)}
        </FormItem>
        <FormItem
          label={messages['common.name']}
        >
          {getFieldDecorator('name')(
            <ACInput size="small"/>
          )}
        </FormItem>
        <Form.Item label={messages['common.token']}>
          {getFieldDecorator('token')(
            <ACInput size="small"/>
          )}
        </Form.Item>
        <FormItem label={messages['common.createdtime']}>
          {getFieldDecorator('timeRange')(
            <RangePicker size="small" style={{width: "324px"}} showTime />
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
