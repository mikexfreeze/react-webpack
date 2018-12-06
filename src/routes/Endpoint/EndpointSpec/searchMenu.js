import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, Row} from "antd";
import {ACInput, ACSelect} from "acom/Form";
import React from "react";
import { injectIntl} from 'acom/Intl';
import {queryEndPointAllCategories} from 'services/endpointCategoryApi';
import {Log} from 'utils/log';
import store from 'store2';

const FormItem = Form.Item;
const Option = ACSelect.Option;

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
      this.hdlTenantChange(this.tenantId);
    }
  }

  state = {
    categories: [],
  }

  hdlTenantChange = (e) => {
    const { setFieldsValue } = this.props.form;
    Log.debug(e);
    queryEndPointAllCategories(e).then(res => {
      this.setState({categories: res.data})
      setFieldsValue({category: null})
    })
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (this.userLevel !== 1) {
        values.tenantId = this.tenantId;
      }
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
    const containerPolicies = [
      {name: messages['specification.common.standalone'], value: 'Standalone'},
      {name: messages['specification.common.composite'], value: 'Composite'},
    ];
    
    return (
      <Form className='search-form' onSubmit={this.hdlSubmit}>
        {this.userlevel !== 1 && <FormItem
          label={messages['common.tenantid']}
          style={{display: this.userLevel !== 1 ? 'none': 'block'}}
        >
          {getFieldDecorator('tenantId')(
          <ACSelect placeholder={messages['alert.pleaseChooseTenantIdFirst']}
                  onSelect={this.hdlTenantChange}
                  size="small" style={{ width: "100%" }}>
            {this.props.tenants.map(tenant => {
              return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
            })}
          </ACSelect>)}
        </FormItem>
        }
        <FormItem
          label={messages['common.name']}
        >
          {getFieldDecorator('name')(
            <ACInput size="small"/>
          )}
        </FormItem>
        <Form.Item label={messages['endpointCategory.endpointCategory']}>
          {getFieldDecorator('hardwareId')(
            <ACSelect placeholder={messages['specification.common.chooseCategory']} size="small">
              {this.state.categories.map(cat => {
                return (<Option value={cat.id} key={cat.id}>{cat.name}</Option>)
              })}
            </ACSelect>
          )}
        </Form.Item>
        <Form.Item label={messages['specification.common.containertype']}>
          {getFieldDecorator('containerPolicy')(
            <ACSelect placeholder={messages['specification.common.chooseContainerPolicy']} size="small">
              {containerPolicies.map(type => {
                return (<Option value={type.value} key={type.value}>{type.name}</Option>)
              })}
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
