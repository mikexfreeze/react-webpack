import React, {Component} from 'react';
import {Fm, injectIntl} from "acom/Intl";
import {Button, Col, Form, Input, Row, Select, message} from "antd";
import {CSSTransition} from "react-transition-group";
import MetaInput from "components/MetaInput";
import {connect} from "dva";
import { ACInput } from 'acom/Form'
import {createUsers, queryUsersById, updateUsers} from "services/userApi";
import { log } from 'utils'

const Option = Select.Option
const { TextArea } = Input;

@injectIntl()
@connect(({ global, projects, tenants, roles}) => ({
  onXHR: global.onXHR,
  projects,
  tenants,
  roles,
}))
@Form.create()
class UserEditor extends Component {

  msg = this.props.intl.messages
  fm = this.props.intl.formatMessage

  state = {
    edtior: false,
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch({type: 'tenants/fetch'});
    if(this.props.id !== ''){
      this.setState({editor: true})
      this.setUser(this.props.id)
    }
  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'projects/fetch', payload:{tenantId:e}});
  }

  hdlLvChange = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'roles/fetch', payload:{level: e}});
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
    log.debug('formValues', formValues)
    log.debug('meta', meta)
    let metaData = {}
    if(meta){
      for (let v of meta) {
        metaData[v[0]] = v[1]
      }
    }
    if(this.props.id === ''){
      createUsers({
        ...formValues,
        metaData,
      }).then(res => {
        message.success(this.msg['alert.createSuccess'])
        this.props.onCreated()
      })
    }else{
      updateUsers({
        ...formValues,
        metaData,
      }).then(res => {
        message.success(this.msg['alert.editSuccess'])
        // this.props.onCreated()
      })
    }

  }

  tenantIdVerif = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    if(getFieldValue('level') > 1 && !value){
      callback(this.msg['common.pleaseChoose'])
    }
    callback()
  }

  projectIdVerif = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    if(getFieldValue('level') === "3" && !value){
      callback(this.msg['common.pleaseChoose'])
    }
    callback()
  }

  setUser = async (id) => {
    const {setFieldsValue} = this.props.form

    let res = await queryUsersById(id)
    let user = res.data
    log.info('queryUsersById', user)
    await setFieldsValue({level: user.level.toString()})
    await setFieldsValue({tenantId: user.tenantId})
    this.hdlLvChange(user.level)
    this.hdlTenantSelect(user.tenantId)
    let roles = user.roleDtos.map(v => {
      return v.code
    })
    if(user.metaData){
      let meta = Object.entries(JSON.parse(user.metaData))
      this.metaInput.setDefaultValue(meta)
    }
    setFieldsValue({
      ...user,
      level: user.level.toString(),
      roles,
    })
  }

  clearUser = () => {
    const {setFieldsValue} = this.props.form
    setFieldsValue({
      level: null,
      tenantId: null,
      projectToken: null,
      username: null,
      roles: [],
      email: null,
      lastName: null,
      firstName: null,
      phone: null,
      address: null,
      zipCode: null,
    })
    this.metaInput.setDefaultValue([])
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(this.props.id !== nextProps.id){
      if(nextProps.id !== ''){
        this.setState({editor: true})
        this.setUser(nextProps.id)
      }else{
        this.setState({editor: false})
        this.clearUser()
      }

    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form

    return (
      <div>
        <Form onSubmit={this.hdlSubmit}>
          <Row gutter={16} className={this.detail ? "hide" : null}>
            <Col span={12}>
              <Form.Item label={this.msg['user.common.userlevel']}>
                {getFieldDecorator('level', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <Select placeholder={this.msg['common.pleaseChoose']} onChange={this.hdlLvChange} disabled={this.state.editor}>
                    <Option value={"1"}><Fm id="common.systemlevel" defaultMessage="系统级" /></Option>
                    <Option value={"2"}><Fm id="common.tenantlevle" defaultMessage="租户级" /></Option>
                    <Option value={"3"}><Fm id="common.projectlevel" defaultMessage="项目级" /></Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <CSSTransition in={getFieldValue('level') > 1} timeout={200}
                           classNames='w1-100' unmountOnExit mountOnEnter>
              <Col span={12} className="animate">
                <Form.Item label={this.msg['common.tenantid']}>
                  {getFieldDecorator('tenantId', {
                    rules: [{ validator: this.tenantIdVerif,}],
                  })(
                    <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']} disabled={this.state.editor}
                            onSelect={this.hdlTenantSelect}>
                      {this.props.tenants.map(tenant => {
                        return (<Option value={tenant.id} key={tenant.createdTime}>{tenant.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </CSSTransition>
            <CSSTransition in={getFieldValue('level') === "3"} timeout={200}
                           classNames='w1-100' unmountOnExit mountOnEnter>
              <Col span={12} className="animate">
                <Form.Item label={this.msg['endpoint.common.projectSelect']}>
                  {getFieldDecorator('projectToken', {
                    rules: [{ validator: this.projectIdVerif,}],
                  })(
                    <Select placeholder={this.msg['endpoint.common.chooseProject']}>
                      {this.props.projects.map(project => {
                        return (<Option value={project.token} key={project.token}>{project.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </CSSTransition>
            <Col span={12} className="transAll">
              <Form.Item label={this.msg['user.common.username']} >
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(<Input placeholder={this.msg['common.pleaseInput']} readOnly={this.state.editor} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={this.msg['role.common.role']}>
                {getFieldDecorator('roles', {
                  rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                })(
                  <Select placeholder={this.msg['endpoint.common.pleaseChoose']} mode="multiple">
                    {this.props.roles.map((role, index) => {
                      return (<Option value={role.code} key={index}>{role.name}</Option>)
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12} className="transAll">
              <Form.Item label="Email">
                {getFieldDecorator('email', {
                  rules: [
                    { type: 'email', message: this.msg['alert.notvalidemail'], },
                    { required: true, message: this.msg['common.pleaseInput'] }
                  ],
                })(<Input placeholder={this.msg['common.pleaseInput']} />)}
              </Form.Item>
            </Col>
            <Col span={12} className="transAll">
              <Form.Item label={this.msg['user.common.lastname']}>
                {getFieldDecorator('lastName', {
                  rules: [
                    { max: 1, message: this.fm({id:"alert.maxString"},{num: 16}) }
                  ],
                })(<Input placeholder={this.msg['common.pleaseInput']} />)}
              </Form.Item>
            </Col>
            <Col span={12} className="transAll">
              <Form.Item label={this.msg['user.common.firstname']}>
                {getFieldDecorator('firstName', {
                  rules: [
                    { max: 1, message: this.fm({id:"alert.maxString"},{num: 16}) }
                  ],
                })(<Input placeholder={this.msg['common.pleaseInput']} />)}
              </Form.Item>
            </Col>
            <Col span={12} className="transAll">
              <Form.Item label={this.msg['user.common.phone']}>
                {getFieldDecorator('phone', {
                  rules:[{pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/, message: this.msg[`alert.yourPhoneNumberIsInvalid`]}]
                })(<ACInput addonBefore="+86" type="number" />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={this.msg['user.common.address']}>
                {getFieldDecorator('address', {})(
                  <TextArea placeholder={this.msg['common.pleaseInput']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>

            <Col span={12} className="transAll">
              <Form.Item label={this.msg['tenant.common.zipcode']}>
                {getFieldDecorator('zipCode', {
                  rules:[
                    {max: 8, message: this.fm({id: 'alert.maxString'},{num: 8})}
                  ]
                })(<ACInput placeholder={this.msg['common.pleaseInput']} type="number" />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{this.msg['common.submit']}</Button>
          </Form.Item>


        </Form>
      </div>
    );
  }
}

export default UserEditor;
