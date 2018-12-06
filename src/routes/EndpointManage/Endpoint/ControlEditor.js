import {Button, Col, Row, Form, Icon, Input} from "antd";
import {Fm, injectIntl} from "acom/Intl";
import {ACInput, ACSelect as Select} from "acom/Form";
import {connect} from "dva";
import {Component} from "react";
import React from "react";
import {MetaInput} from "components";
import {log} from "utils";

const Option = Select.Option
const TextArea = Input.TextArea

@injectIntl()
@connect(({global, commands}) => ({
  onXHR: global.onXHR,
  commands,
}))
@Form.create()
export class CommandBatch extends Component {

  msg = this.props.intl.messages

  state = {
    commands: [],
    command: undefined,
  }

  componentDidMount () {
    const { dispatch } = this.props;
    let endpoint = this.props.endList[0]
    dispatch({type: 'commands/fetch', payload: {token: endpoint.specToken}})
      .then((res) => {
        log.debug("commands list api:", res)
        this.setState({
          commands: res.data
        })
      })
  }

  hdlCommandChange = (e) => {
    let command = this.state.commands.find(command => {
      return command.token === e
    })
    this.setState({command})
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
    let metaData = {}
    if(meta){
      for (let v of meta) {
        metaData[`${v[0]}`] = v[1]
      }
    }
    this.props.onCommands({
      ...formValues,
      metaData,
    })
  }

  render() {

    const { getFieldDecorator } = this.props.form

    let paramsInput = []
    if(this.state.command !== undefined) {
      let params = JSON.parse(this.state.command.param)
      log.debug("params", params)
      if(params.length > 0){
        for (let [index, param] of params.entries()) {
          if(param === null){return}
          let rules = []
          if(param.required){
            rules = [{ required: true, message: this.msg['common.pleaseInput'] }]
          }
          let type = "text"
          if(param.type.indexOf("Int") > -1){
            type = "number"
          }
          paramsInput.push(
            <Col span={24} key={index}>
              <Form.Item label={param.name}>
                {getFieldDecorator(`parameterValues.${param.name}`, {
                  rules,
                })(
                  <ACInput type={type} placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
          )
        }
      }
    }


    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['common.command']}>
              {getFieldDecorator('commandToken', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']} onChange={this.hdlCommandChange}>
                  {this.props.commands.map(command => {
                    return (<Option value={command.token} key={command.token}>{command.name}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          {paramsInput}
          <Col span={24}>
            <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
          </Col>
        </Row>
        <Row>
          <span className="tips-message">
            <Icon type="info-circle" theme="outlined" />&nbsp;<Fm id="endpoint.common.invokeCmdHintOne" /><br/>
            <Icon type="info-circle" theme="outlined" />&nbsp;<Fm id="endpoint.common.invokeCmdHintTwo" /><br/>
          </span>
        </Row>
        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

@injectIntl()
@connect(({global}) => ({
  onXHR: global.onXHR,
}))
@Form.create()
export class SendMsgBatch extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;
    let endpoint = this.props.endList[0]
    dispatch({type: 'commands/fetch', payload: {token: endpoint.specToken}});
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.props.onSendMsg(values)
      }
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['endpoint.common.smsText']}>
              {getFieldDecorator('messageText', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <TextArea placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <span className="tips-message">
            <Icon type="info-circle" theme="outlined" />&nbsp;<Fm id="endpoint.common.sendSmsHint" /><br/>
          </span>
        </Row>
        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

@injectIntl()
@connect(({global, otas}) => ({
  onXHR: global.onXHR,
  otas,
}))
@Form.create()
export class UpdateBatch extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;
    let endpoint = this.props.endList[0]
    dispatch({type: 'otas/fetch', payload: {1: 1, specToken: endpoint.specToken}});
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.props.onUpdate(values)
      }
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['endpoint.common.firmwareVersion']}>
              {getFieldDecorator('token', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}>
                  {this.props.otas.map(ota => {
                    return (<Option value={ota.token} key={ota.token}>{ota.version}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

@injectIntl()
@connect(({global, softwares}) => ({
  onXHR: global.onXHR,
  softwares,
}))
@Form.create()
export class SoftUpdate extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;
    let endpoint = this.props.endList[0]
    dispatch({type: 'softwares/fetch', payload: {1: 1, specToken: endpoint.specToken}});
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        this.props.onUpdate(values)
      }
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['endpoint.common.softwareVersion']}>
              {getFieldDecorator('token', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}>
                  {this.props.softwares.map(ota => {
                    return (<Option value={ota.token} key={ota.token}>{ota.version}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
