import React, {Component} from 'react';
import {Fm, injectIntl} from "acom/Intl";
import {connect} from "dva";
import {Button, Col, DatePicker, Form, Input, message, Row} from "antd";
import {ACInput, ACSelect as Select} from "acom/Form";
import {log} from "utils";
import {createEPGroup, updateEPGroup} from "services/endpointGroupApi";
import pattern from "utils/pattern";
import moment from "moment";
import MetaInput from "components/MetaInput";

const Option = Select.Option;
const { TextArea } = Input;
const { RangePicker, } = DatePicker;

@injectIntl()
@connect(({user, global, tenants, projects, specifications, endpoints}) => ({
  user,
  loading: global.loading,
  tenants,
  projects,
  specifications,
  endpoints,
}))
@Form.create()
export default class EPGroupEditor extends Component {

  msg = this.props.intl.messages

  state = {
    type: "",
    edit: false,
    defaultTimeRange: []
  }

  componentDidMount () {
    const { dispatch } = this.props;
    if(this.props.editStatus === "edit"){
      this.setState({edit:true})
    }else{
      this.setState({edit:false})
    }
    dispatch({type: 'projects/fetch', });
    dispatch({type: 'specifications/fetch', });
    dispatch({type: 'endpoints/fetch', });
    if(this.props.user.level === 1){
      dispatch({type: 'tenants/fetch'});
    }
    if(this.props.editStatus === "edit"){
      let data = this.props.data
      this.props.form.setFieldsValue({
        ...data
      })
      let thiz = this
      let endpointFilter = data.endpointFilter
      if(endpointFilter){
        setTimeout(function () {
          thiz.props.form.setFieldsValue({
            endpointFilter: {
              ...data.endpointFilter
            }
          })
        }, 100)
        if(endpointFilter.startDate){
          setTimeout(function () {
            thiz.props.form.setFieldsValue({
              timeRange: [moment(endpointFilter.startDate),moment(endpointFilter.endDate)]
            })
          }, 100)
        }
        if(endpointFilter.metaData){
          let meta = []
          for (let [i, v] of Object.entries(JSON.parse(endpointFilter.metaData))) {
            meta.push([i, v])
          }
          setTimeout(function () {
            thiz.metaInput.setDefaultValue(meta)
          }, 100)
        }
      }
      setTimeout(function () {
        thiz.getEndpoints()
      }, 200)
    }

  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;

    dispatch({type: 'projects/fetch', payload: {tenantId: e}});
    dispatch({type: 'specifications/fetch', payload:{tenantId:e}});
    dispatch({type: 'endpoints/fetch', payload:{tenantId:e}});

  }

  getEndpoints = () => {
    const { dispatch } = this.props;
    const { getFieldValue } = this.props.form;
    dispatch({
      type: 'endpoints/fetch',
      payload:{tenantId:getFieldValue('tenantId'),specToken: getFieldValue('specToken'), projectToken: getFieldValue('projectToken')}
    });
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    let error;let formValues;let meta;
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    });
    if(this.metaInput){
      this.metaInput.validator((err, data) => {
        if (err) {
          error = {
            ...error,
            meta: err,
          }
        } else {
          meta = data
        }
      })

      if (error) {
        console.log('error', error)
        return
      }
      let metaData = {}
      if(meta){
        for (let v of meta) {
          metaData[`${v[0]}`] = v[1]
        }
      }
      formValues.endpointFilter.metaData = JSON.stringify(metaData)
    }

    if(formValues.timeRange){
      formValues.endpointFilter.startDate = moment(formValues.timeRange[0]).format("YYYY-MM-DDT00:00:00")
      formValues.endpointFilter.endDate = moment(formValues.timeRange[1]).format("YYYY-MM-DDT00:00:00")
      delete formValues.timeRange
    }
    console.log(formValues)
    if(this.props.editStatus === "create"){
      createEPGroup({
        ...formValues,
      })
        .then(res => {
          log.info("创建终端组：", res)
          if(res.status === 201){
            message.success(this.msg['alert.createSuccess'])
            this.props.onSuccess()
          }
        })
    }else if(this.props.editStatus === "edit"){
      if(this.props.user.level > 1){
        formValues.tenantId = this.props.user.tenantId
      }
      updateEPGroup({
        ...formValues,
      })
        .then(res => {
          log.info("编辑终端组：", res)
          if(res.status === 200){
            message.success(this.msg['common.success'])
            this.props.onSuccess()
          }
        })
    }

  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let edit = this.state.edit

    return (
      <Form layout="vertical" onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          {this.props.user.level === 1 &&
          <Col span={12}>
            <Form.Item label={<Fm id="common.tenantid" defaultMessage="租户ID" />}>
              {getFieldDecorator('tenantId', {
                rules: [{ required: true, message: this.msg['alert.common.pleaseChooseTenantIdFirst'] }],
              })(
                <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']}
                        disabled={edit}
                        onSelect={this.hdlTenantSelect}>
                  {this.props.tenants.map(tenant => {
                    return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          }
          <Col span={12}>
            <Form.Item label={<Fm id="endpointGroup.endpointgroupType" defaultMessage="终端组类型" />}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']} onChange={this.hdlTypeChange} disabled={edit}>
                  <Option value="STATIC" ><Fm id="endpointGroup.staticEndpointGroup" defaultMessage="静态终端组" /></Option>
                  <Option value="DYNAMIC" ><Fm id="endpointGroup.dynamicEndpointGroup" defaultMessage="动态终端组" /></Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ID">
              {getFieldDecorator('id', {
                rules: [
                  { required: true, message: this.msg['common.pleaseInput'] },
                  {pattern: pattern.ID, message: this.msg['alert.inputCorrectIdOrUsername']},
                ],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} readOnly={edit} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={<Fm id="endpointGroup.endpointGroupName" defaultMessage="终端组名称" />}>
              {getFieldDecorator('groupName', {
                rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          {getFieldValue('type') === 'DYNAMIC' ?
            <span>
              <Col span={12}>
                <Form.Item label={<Fm id="endpoint.common.projectSelect" defaultMessage="项目选择" />}>
                  {getFieldDecorator('endpointFilter.projectToken', {
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']}
                            allowClear
                            onChange={this.getEndpoints}>
                      {this.props.projects.map((project, index) => {
                        return (<Option value={project.token} key={project.token}>{project.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Fm id="endpoint.common.endpointSpec" defaultMessage="终端规格" />}>
                  {getFieldDecorator('endpointFilter.specToken', {
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']}
                            allowClear
                            onChange={this.getEndpoints}>
                      {this.props.specifications.map(spec => {
                        return (<Option value={spec.token} key={spec.token}>{spec.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Fm id="common.endpointId" defaultMessage="终端ID" />}>
                  {getFieldDecorator('endpointFilter.id', {
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']} allowClear>
                      {this.props.endpoints.map((data, index) => {
                        return (<Option value={data.id} key={index} >{data.id}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Fm id="common.connectStatus" defaultMessage="连接状态" />}>
                  {getFieldDecorator('endpointFilter.status', {
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']} allowClear>
                      <Option value="INIT" ><Fm id='endpoint.common.init' defaultMessage='初始化' /></Option>
                      <Option value="ONLINE" ><Fm id='endpoint.common.online' defaultMessage='在线' /></Option>
                      <Option value="OFFLINE" ><Fm id='endpoint.common.offline' defaultMessage='掉线' /></Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Fm id="common.alertStatus" defaultMessage="告警状态" />}>
                  {getFieldDecorator('endpointFilter.alertStatus', {
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']} allowClear>
                      <Option value="NORMAL" ><Fm id='endpoint.common.init' defaultMessage='初始化' /></Option>
                      <Option value="INFO" ><Fm id='trigger.triggerRule.info' defaultMessage='通知' /></Option>
                      <Option value="ERROR" ><Fm id='trigger.triggerRule.error' defaultMessage='严重' /></Option>
                      <Option value="CRITICAL" ><Fm id='trigger.triggerRule.critical' defaultMessage='致命' /></Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<Fm id="common.createdtime" defaultMessage="创建时间" />}>
                  {getFieldDecorator('timeRange')(
                    <RangePicker />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
              </Col>
            </span>
            : null}
          <Col span={12}>
            <Form.Item label={<Fm id="common.description" defaultMessage="描述" />}>
              {getFieldDecorator('description', {})(
                <TextArea placeholder={this.msg['alert.plsInputDescription']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{this.msg['common.submit']}</Button>
          </Form.Item>
        </Row>
      </Form>
    );
  }
}
