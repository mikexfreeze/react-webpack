import { Component } from 'react'
import {Button, Card, Col, Divider, Form, Icon, Input, message, Row, Select} from "antd";
import { injectIntl, Fm } from "acom/Intl";
import { Title } from 'acom'
import { ACSelect, ACInput } from 'acom/Form'
import React from "react";
import { connect } from 'dva'
import { updateEndPoint, querySpecifications, queryAcct } from "services/endpointApi";

@injectIntl()
@connect(({endpoint, projects, global, tenants}) => ({
  onXHR: global.onXHR,
  endpoint,
  projects,
  tenants,
}))
@Form.create({
  mapPropsToFields(props) {
    return {
      tenantId: Form.createFormField({
        value: props.endpoint.tenantId
      }),
      id: Form.createFormField({
        value: props.endpoint.id
      }),
      username: Form.createFormField({
        value: props.endpoint.endpointAuthDto.username
      }),
      projectToken: Form.createFormField({
        value: props.endpoint.project.token
      }),
      specToken: Form.createFormField({
        value: props.endpoint.specification.token
      }),
      description: Form.createFormField({
        value: props.endpoint.description
      }),
      acctId: Form.createFormField({
        value: props.endpoint.acctId
      }),
      iccid: Form.createFormField({
        value: props.endpoint.iccid
      }),
      metaKeys:Form.createFormField({
        value: Object.entries(JSON.parse(props.endpoint.metaData ? props.endpoint.metaData : '{}')).map((k, i) => i)
      }),
    }
  },
})
export default class EndpointEditor extends Component {

  state = {
    specifications: [],
    accts: []
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch({type: 'projects/fetch'});
    dispatch({type: 'tenants/fetch'});
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
    querySpecifications({tenantId: this.tenantId})
      .then(res => {
        this.setState({specifications: res.data})
      })
    queryAcct({tenantId: this.tenantId})
      .then(res => {
        this.setState({accts: res.data})
      })
    this.getMeta()
  }

  msg = this.props.intl.messages

  getMeta = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'endpoint/fetch',
      payload: {
        id: this.id,
        tenantId: this.tenantId
      }
    })
      .then(res => {
        const {form} = this.props;
        let metaData = Object.entries(JSON.parse(res.data.metaData ? res.data.metaData : "{}"))
        setTimeout(function () {
          form.setFieldsValue({
            meta: metaData,
          })
        }, 200)
      })
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.metaData = {}
        if(values.meta){
          for (let v of values.meta) {
            values.metaData[v[0]] = v[1]
          }
        }
        values.tenantId = this.props.endpoint.tenantId
        updateEndPoint(values)
          .then(res => {
            console.log("编辑终端：", res)
            if(res.status === 200){
              message.success(`${this.msg['alert.editSuccess']}`);
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
    // if (keys.length === 1) {
    //   return;
    // }
    // can use data-binding to set
    form.setFieldsValue({
      metaKeys: keys.filter(key => key !== k),
    });
  }

  render () {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const Option = Select.Option
    const { TextArea } = Input;

    getFieldDecorator('metaKeys', {initialValue: []})
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
                  message: this.msg['common.inputName'],
                }],
              })(
                <Input placeholder={this.msg['common.inputName']} />
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
                  message: this.msg['common.inputValue'],
                }],
              })(
                <Input placeholder={this.msg['common.inputValue']} />
              )}
            </Form.Item>
          </Col>
          {metaData.length > 0 && (
            <Col span={2}>
              <Icon
                style={{"fontSize":"20px", "paddingTop":"9px"}}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.removeMeta(k)}
              />
            </Col>
          )}
        </Row>
      )
    })

    return (
      <Card>
        <Form onSubmit={this.hdlSubmit}>
          <Title className="title mb10"><Fm id="endpoint.common.editendpoint" defaultMessage="编辑终端" /></Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={this.msg['common.tenantid']}>
                {getFieldDecorator('tenantId', {
                  rules: [{ required: true, message: '请选择规格' }],
                })(
                  <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']} disabled>
                    {this.props.tenants.map(tenant => {
                      return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['batch.endpointId']}>
                {getFieldDecorator('id', {
                  rules: [{ required: true, message: '请输入终端ID' }],
                })(<Input placeholder="请输入终端ID" readOnly="readonly" />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['user.common.username']}>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: '请输入用户名' }],
                })(<Input placeholder="请输入用户名" readOnly="readonly" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={this.msg['endpoint.common.projectSelect']}>
                {getFieldDecorator('projectToken', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <Select placeholder={this.msg['common.pleaseChoose']} disabled>
                    {this.props.projects.map(project => {
                      return (<Option value={project.token} key={project.token}>{project.name}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['endpoint.common.specificationselect']}>
                {getFieldDecorator('specToken', {
                  rules: [{ required: true, message: '请选择规格' }],
                })(
                  <Select placeholder={this.msg['endpoint.common.chooseSpecification']} >
                    {this.state.specifications.map(spec => {
                      return (<Option value={spec.token} key={spec.token}>{spec.name}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <div className="ant-form-item-label">
                <label className="" title={this.msg['common.metadata']}>{this.msg['common.metadata']}</label>
              </div>
              {formMetas}
              <Row>
                <Col span={22}>
                  <Button type="dashed" onClick={this.addMeta} style={{width:"100%", margin: "10px 0 24px"}}>
                    <Icon type="plus" /> {this.msg['common.addOne']}
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Form.Item label={this.msg['common.description']}>
                {getFieldDecorator('description', {})(
                  <TextArea placeholder={this.msg['alert.plsInputDescription']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Title className="title mb10"><Fm id="endpoint.common.simCardInfo" defaultMessage="SIM卡信息" /></Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={this.msg['operator.operatorAccount']}>
                {getFieldDecorator('acctId')(
                  <ACSelect placeholder={this.msg['common.pleaseChoose']}>
                    {this.state.accts.map(acct => {
                      return (<Option value={acct.id} key={acct.id}>{acct.operatorAcctName}</Option>)
                    })}
                  </ACSelect>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="ICCID">
                {getFieldDecorator('iccid')(
                  <ACInput placeholder={this.msg['common.pleaseInput']} type="number" />
                )}
              </Form.Item>
            </Col>

          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={8} className="text-center">
                <Button type="default" onClick={this.props.history.goBack} block>{this.msg['common.return']}</Button>
            </Col>
            <Col span={3} offset={1} className="text-center">
                <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
            </Col>
          </Row>
        </Form>

      </Card>
    )
  }
}
