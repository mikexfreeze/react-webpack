import React, {Component} from 'react';
import {Fm, injectIntl} from "acom/Intl";
import {Button, Card, Col, Divider, Form, message, Row} from "antd";
import {ACSelect as Select, ACInput as Input} from "acom/Form";
import {log, pattern} from "utils";
import {createTenant, queryTenantById, updateTenant} from "services/tenantApi";
import {Title} from "acom";
import DescriptionList from "acom/DescriptionList";
import {ActiveStatusCell} from "routes/ControlPanel/Tenant/Cells";

const { TextArea } = Input;
const { Option } = Select
const { Description } = DescriptionList;

@injectIntl()
@Form.create()
class TenantEditor extends Component {

  constructor (props) {
    super(props)

    const params = this.props.match.params
    this.editor = false
    if(params.id){
      this.id = params.id
      this.editor = true
    }
    this.detail = false
    if(this.props.match.path.indexOf("detail") > -1){
      this.detail = true
    }

  }

  state = {
    data: {}
  }

  msg = this.props.intl.messages

  componentDidMount () {
    const {setFieldsValue} = this.props.form
    let params = this.props.match.params
    if(params.id){
      queryTenantById(params.id)
        .then(res => {
          log.info("queryTenantById:", res.data)
          setFieldsValue({
            ...res.data
          })
          this.setState({data: res.data})
        })
    }
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    // this.metaInput.refTest()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        let postData = {
          ...values,
        }
        log.info('postData', postData)
        if(this.editor){
          updateTenant(postData)
            .then(res => {
              log.log("编辑角色：", res)
              if (res.status === 200) {
                message.success(this.msg['alert.editSuccess']);
              }
            })
        }else{
          createTenant(postData)
            .then(res => {
              log.info("创建租户：", res)
              if (res.status === 201) {
                message.success(this.msg['alert.createSuccess']);
                // this.getMeta()
                this.props.history.goBack()
              }
            })
        }
      }
    })


  }

  render() {

    const { getFieldDecorator } = this.props.form
    const data = this.state.data
    return (
      <Card>
        {data.id ?
          <div>
            <DescriptionList size="large"
                             className={!this.detail && "hide"}
                             title={<Title><Fm id="tenant.viewtenant.tenantdetail" defaultMessage="租户详情" /></Title>}
                             style={{ marginBottom: 24 }}>
              <Description term={<Fm id="tenant.common.tenantname" defaultMessage="租户名称" />}>{data.name}</Description>
              <Description term={<Fm id="common.tenantid" defaultMessage="租户ID" />}>{data.id}</Description>
              <Description term={<Fm id="common.status" defaultMessage="状态" />}><ActiveStatusCell value={data.status} /></Description>
              <Description term={<Fm id="tenant.common.companyname" defaultMessage="公司名称" />}>{data.companyName}</Description>
              <Description term="E-mail">{data.sysEmail}</Description>
              <Description term={<Fm id="tenant.common.industry" defaultMessage="所属行业" />}>{data.companyIndustry}</Description>
              <Description term={<Fm id="tenant.common.contactperson" defaultMessage="联系人" />}>{data.companyContactPerson}</Description>
              <Description term={<Fm id="tenant.common.contactinfo" defaultMessage="联系方式" />}>{data.companyContactInfo}</Description>
              <Description term={<Fm id="user.common.address" />}>{data.companyAddress}</Description>
              <Description term={<Fm id="common.description" />}>{data.description}</Description>

            </DescriptionList>
            <DescriptionList size="large"
                             className={!this.detail && "hide"}
                             title={<Title><Fm id="common.thirdPartyService" defaultMessage="第三方服务" /></Title>}
                             style={{ marginBottom: 24 }}>
              <Description term={<Fm id="tenant.common.mapApiKey" defaultMessage="百度地图API Key" />}>{data.baiduMapApiKey}</Description>
            </DescriptionList>
            <Row>
              <Col span={3} offset={10} className="text-center">
                <Button type="default" onClick={this.props.history.goBack} block>
                  <Fm id="common.goBack" defaultMessage="返回" />
                </Button>
              </Col>
            </Row>

          </div>

        : null}

        <Form onSubmit={this.hdlSubmit} className={this.detail ? "hide" : null}>
          <Title className="title"><Fm id="tenant.common.addtenant" defaultMessage="添加租户" /></Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={<Fm id="common.tenantid" defaultMessage="租户ID" />}>
                {getFieldDecorator('id', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} disabled={this.editor} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.tenantname" defaultMessage="租户名称" />}>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
            {
              this.editor &&
              <Col span={8}>
                <Form.Item label={<Fm id="common.status" defaultMessage="状态" />}>
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
                  })(
                    <Select placeholder={this.msg['common.pleaseChoose']}>
                      <Option value={"Activated"}><Fm id="common.activated" defaultMessage="激活" /></Option>
                      <Option value={"Alarm"}><Fm id="common.alerts" defaultMessage="告警" /></Option>
                      <Option value={"Forbidden"}><Fm id="common.forbidden" defaultMessage="禁止" /></Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            }
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.companyname" defaultMessage="公司名称" />}>
                {getFieldDecorator('companyName', {
                  rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="E-mail">
                {getFieldDecorator('sysEmail', {
                  rules: [
                    { required: true, message: this.msg['common.pleaseInput'] },
                    {type: 'email', message: this.msg['alert.pleaseInputValidEmail']}
                  ]
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.industry" defaultMessage="所属行业" />}>
                {getFieldDecorator('companyIndustry', {
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.contactperson" defaultMessage="联系人" />}>
                {getFieldDecorator('companyContactPerson', {
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.contactinfo" defaultMessage="联系方式" />}>
                {getFieldDecorator('companyContactInfo', {
                  validateTrigger: 'onBlur',
                  rules:[
                    {pattern: pattern.ChinaPhone, message: this.msg[`alert.yourPhoneNumberIsInvalid`]}
                  ]
                })(<Input addonBefore="+86" type="number" placeholder={this.msg['common.pleaseInput']} />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['user.common.address']}>
                {getFieldDecorator('companyAddress', {})(
                  <TextArea placeholder={this.msg['common.description']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={this.msg['common.description']}>
                {getFieldDecorator('description', {})(
                  <TextArea placeholder={this.msg['common.description']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                )}
              </Form.Item>
            </Col>

          </Row>
          <Title className="title"><Fm id="common.thirdPartyService" defaultMessage="第三方服务" /></Title>
          <Row>
            <Col span={8}>
              <Form.Item label={<Fm id="tenant.common.mapApiKey" defaultMessage="百度地图API Key" />}>
                {getFieldDecorator('baiduMapApiKey', {
                })(
                  <Input placeholder={this.msg['common.pleaseInput']} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={8} className="text-center">
              <Button type="default" onClick={this.props.history.goBack} block>
                <Fm id="common.goBack" defaultMessage="返回" />
              </Button>
            </Col>
            {!this.detail &&
            <Col span={3} offset={1} className="text-center">
              <Button type="primary" htmlType="submit" loading={this.props.onXHR} block>
                <Fm id="common.submit" defaultMessage="提交"/>
              </Button>
            </Col>
            }
          </Row>
        </Form>
      </Card>
    );
  }
}

export default TenantEditor;
