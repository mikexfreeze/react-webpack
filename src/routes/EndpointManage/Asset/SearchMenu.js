import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, Row, Select} from "antd";
import {ACInput, ACSelect} from "acom/Form";
import React from "react";
import { injectIntl} from 'acom/Intl'

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl()
@connect(({ global, tenants, user, assetCategories }) => ({
  onXHR: global.onXHR,
  tenants,
  user,
  assetCategories,
}))
@Form.create()
export default class SearchMenu extends Component {

  state = {
    specifications: [],
    projects: [],
  }

  msg = this.props.intl.messages

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
      id: null,
      name: null,
      type: null,
    })
  }

  componentDidMount(){
    const { setFieldsValue } = this.props.form;
    const { dispatch } = this.props
    setFieldsValue({id: this.props.searchId})
    let user = this.props.user
    if(user.level === 1){
      dispatch({type: "tenants/fetch"})
    }
    if(user.level > 1){
      this.hdlTenantChange(user.tenantId)
    }
  }

  hdlTenantChange = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'assetCategories/fetch', payload:{tenantId:e}});
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
        {(this.props.user.level === 1) &&
        <FormItem
          label={messages['common.tenantid']}
        >
          {getFieldDecorator('tenantId')(
            <ACSelect placeholder={messages['alert.pleaseChooseTenantIdFirst']}
                      allowClear
                      onSelect={this.hdlTenantChange}
                      size="small" style={{ width: "100%" }}>
              {this.props.tenants.map(tenant => {
                return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
              })}
            </ACSelect>)}
        </FormItem>
        }
        <FormItem
          label='ID'
        >
          {getFieldDecorator('id')(
            <ACInput placeholder={`${messages['common.pleaseInput']}`}
                     size="small"
            />)}
        </FormItem>
        <FormItem
          label={this.msg['endpoint.common.assetname']}
        >
          {getFieldDecorator('name')(
            <ACInput placeholder={`${messages['common.pleaseInput']}`}
                     size="small"
            />)}
        </FormItem>
        <Form.Item label={this.msg['asset.listasset.assettype']}>
          {getFieldDecorator('type')(
            <ACSelect placeholder={messages['common.pleaseChoose']} size="small">
              <Option key="长宽高" >长宽高</Option>
              <Option key="LOCATION" >经纬度</Option>
            </ACSelect>
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
