import { Component } from 'react'
import {connect} from "dva";
import { Form, Button, DatePicker, Row, Select} from "antd";
import {ACInput, ACSelect} from "acom/Form";
import React from "react";
import { injectIntl} from 'acom/Intl'
import {querySpecifications, queryProjects} from 'services/endpointApi'

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker, } = DatePicker;

@injectIntl()
@connect(({ global, tenants, user }) => ({
  onXHR: global.onXHR,
  tenants,
  user,
}))
@Form.create()
export default class SearchMenu extends Component {

  state = {
    specifications: [],
    projects: [],
  }

  hdlIdChange = (e) => {
    this.props.onIdChange(e.target.value)
  }

  hdlTenantChange = (e) => {
    const { setFieldsValue } = this.props.form;

    querySpecifications({
      tenantId: e
    }).then(res => {
      this.setState({specifications: res.data})
      setFieldsValue({specToken: null})
    })

    queryProjects({tenantId: e})
      .then(res => {
        this.setState({projects: res.data})
        setFieldsValue({projectToken: null})
      })
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
      projectToken: null,
      specToken: null,
      assignToken: null,
      timeRange: null,
    })
  }

  componentDidMount(){
    const { setFieldsValue } = this.props.form;
    setFieldsValue({id: this.props.searchId})
    let user = this.props.user
    if(user.level > 1){
      this.hdlTenantChange(user.tenantId)
    }
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
                      size="small"
                      onSelect={this.hdlTenantChange}
                      style={{ width: "100%" }}>
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
            <ACInput placeholder={`${messages['endpoint.common.searchEndpoint']} ID`}
                     size="small"
                   onChange={this.hdlIdChange}/>)}
        </FormItem>
        <Form.Item label={messages['endpoint.common.projectSelect']}>
          {getFieldDecorator('projectToken')(
            <ACSelect placeholder={messages['common.chooseProject']} size="small">
              {this.state.projects.map(project => {
                return (<Option value={project.token} key={project.token}>{project.name}</Option>)
              })}
            </ACSelect>
          )}
        </Form.Item>
        <Form.Item label={messages['endpoint.common.specificationselect']}>
          {getFieldDecorator('specToken')(
            <ACSelect placeholder={messages['endpoint.common.chooseSpecification']}
                      size="small"
                    allowClear>
              {this.state.specifications.map(spec => {
                return (<Option value={spec.token} key={spec.token}>{spec.name}</Option>)
              })}
            </ACSelect>
          )}
        </Form.Item>
        <FormItem label={messages['endpoint.common.assignToken']}>
          {getFieldDecorator('assignToken')(
            <ACInput size="small" placeholder={`${messages['common.pleaseInput']} ${messages['endpoint.common.assignToken']}`}
            />)}
        </FormItem>
        <FormItem label={messages['common.createdtime']}>
          {getFieldDecorator('timeRange')(
            <RangePicker size="small" style={{width: "324px"}} showTime />
            )}
        </FormItem>
        <Row>
          <Button type="primary" size="small" htmlType="submit" loading={this.props.onXHR} style={{ marginRight: 8 }}>{messages['common.search']}</Button>
          <Button type="default" size="small" onClick={this.hdlClear} loading={this.props.onXHR}>{messages['common.clearSearch']}</Button>
        </Row>
      </Form>
    )
  }
}
