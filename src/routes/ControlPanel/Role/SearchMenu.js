import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, Row, Select} from "antd";
import {ACInput} from "acom/Form";
import React from "react";
import { injectIntl } from 'acom/Intl'

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl()
@connect(({ global, tenants }) => ({
  onXHR: global.onXHR,
  tenants,
}))
@Form.create()
export default class SearchMenu extends Component {

  state = {

  }

  hdlIdChange = (e) => {
    this.props.onIdChange(e.target.value)
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
      level: null,
      name: null,
    })
  }

  componentDidMount(){
    const { setFieldsValue, getFieldValue } = this.props.form;
    const { dispatch } = this.props
    if(getFieldValue('level') > 1){
      setFieldsValue({name: this.props.searchId})
    }
    dispatch({type: 'tenants/fetch'})

  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { setFieldsValue, getFieldValue } = this.props.form;
    if(nextProps.searchId !== this.props.searchId){
      if(getFieldValue('level') > 1){
        setFieldsValue({name: this.props.searchId})
      }
    }
  }

  render () {
    const {intl: {messages}} = this.props
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (
      <Form className='search-form' onSubmit={this.hdlSubmit}>
        <FormItem
          label={messages['role.common.rolelevel']}
        >
          {getFieldDecorator('level')(
            <Select placeholder={messages['role.common.chooseRoleLevel']}
                      size="small" style={{ width: "100%" }}>
              <Option value={1} key={1}>{messages['common.systemlevel']}</Option>
              <Option value={2} key={2}>{messages['common.tenantlevle']}</Option>
            </Select>)}
        </FormItem>
        {getFieldValue('level') > 1 ?
          <FormItem
            label={messages['common.tenantid']}
          >
            {getFieldDecorator('tenantId')(
              <Select placeholder={`${messages['common.pleaseChoose']}${messages['common.tenantid']}`}
                       size="small">
                {this.props.tenants.map(tenant => (
                  <Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          : null}
        <Form.Item label={`${messages['role.common.role']} ID`}>
          {getFieldDecorator('name')(
            <ACInput placeholder={`${messages['common.pleaseInput']}${messages['role.common.role']}ID`} size="small" />
          )}
        </Form.Item>
        <Row>
          <Button type="primary" htmlType="submit" size="small" loading={this.props.onXHR} style={{ marginRight: 8 }}>{messages['common.search']}</Button>
          <Button type="default" size="small" onClick={this.hdlClear} loading={this.props.onXHR}>{messages['common.clearSearch']}</Button>
        </Row>
      </Form>
    )
  }
}
