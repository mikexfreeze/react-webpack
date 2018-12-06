import React, {Component} from 'react';
import {injectIntl, Fm} from "acom/Intl";
import {connect} from "dva";
import {Button, Col, Form, Icon, message, Row} from "antd";
import {ACInput, ACSelect as Select} from "acom/Form";
import {log} from "utils";
import {
  createAssetCatgryTpl,
  editAssetCatgryTpl,
  queryAllAssettCatgryTpl,
  queryAssetCatgryTpl
} from "services/assetApi";
import {Title} from "acom";

const Option = Select.Option;

@injectIntl()
@connect(({user, global, tenants}) => ({
  user,
  loading: global.loading,
  tenants,
}))
@Form.create()
export default class AssetCatgryTplEditor extends Component {

  msg = this.props.intl.messages

  state = {
    type: "",
    edit: false,
    defineArray: [],
    assetCatgryTpls: [],
  }

  componentDidMount () {
    const { dispatch } = this.props;
    const { setFieldsValue } = this.props.form;

    if(this.props.editStatus === "edit"){
      this.setState({edit:true})
    }else{
      this.setState({edit:false})
    }

    if(this.props.user.level > 1){
      queryAllAssettCatgryTpl()
        .then(res => {
          this.setState({assetCatgryTpls: res.data})
        })
    }else{
      dispatch({type: 'tenants/fetch'});
    }
    if(this.props.editStatus === "edit"){
      let {name, tenantId } = this.props.data
      let params = {name, tenantId }
      console.log(params)
      queryAssetCatgryTpl(params)
        .then(res => {
          log.info("获取模板详情：", res.data)
          let defineArray = JSON.parse(res.data.define)
          this.setState({defineArray})
          for(let i = 0; i < defineArray.length; i++){
            setFieldsValue({
              [`define[${i}].property`]: defineArray[`${i}`].property,
              [`define[${i}].dataType`]: defineArray[`${i}`].dataType,
              [`define[${i}].label`]: defineArray[`${i}`].label,
              description: res.data.description,
              name: res.data.name,
              tenantId: res.data.tenantId,
            })
          }
        })

    }

  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'assetCatgryTpls/fetch', payload:{id:e}});
    this.tenantId = e
    queryAllAssettCatgryTpl()
      .then(res => {
        this.setState({assetCatgryTpls: res.data})
      })
  }

  hdlTplChange = (e, data) => {
    const { setFieldsValue } = this.props.form;

    let params = {name: data.props.name}
    if(this.tenantId){
      params.tenantId = this.tenantId
    }
    queryAssetCatgryTpl(params)
      .then(res => {
        log.info("获取模板详情：", res.data)
        let defineArray = JSON.parse(res.data.define)
        this.setState({defineArray})
        for(let i = 0; i < defineArray.length; i++){
          setFieldsValue({
            [`define[${i}].property`]: defineArray[`${i}`].property,
            [`define[${i}].dataType`]: defineArray[`${i}`].dataType,
            [`define[${i}].label`]: defineArray[`${i}`].label,
          })
        }
      })
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        if(this.props.editStatus === "create"){
          createAssetCatgryTpl({
            ...values,
          })
            .then(res => {
              log.info("创建资产类型模板：", res)
              if(res.status === 201){
                message.success(this.msg['alert.createSuccess'])
                this.props.onSuccess()
              }
            })
        }else if(this.props.editStatus === "edit"){
          if(this.props.user.level > 1){
            values.tenantId = this.props.user.tenantId
          }
          editAssetCatgryTpl({
            ...values,
          })
            .then(res => {
              log.info("编辑资产类型模板：", res)
              if(res.status === 200){
                message.success(this.msg['common.success'])
                this.props.onSuccess()
              }
            })
        }
      };

    })

  }

  addDefineForm = () => {
    let defineArray = [...this.state.defineArray, {property: "", dataType: "", label: ""}]
    this.setState({defineArray})
  }

  rmDefineKey = (index) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    let defineArray = this.state.defineArray
    for(let i = index; i < defineArray.length - 1; i++){
      setFieldsValue({
        [`define[${i}].property`]: getFieldValue(`define[${i + 1}].property`),
        [`define[${i}].dataType`]: getFieldValue(`define[${i + 1}].dataType`),
        [`define[${i}].label`]: getFieldValue(`define[${i + 1}].label`),
      })
    }
    defineArray.splice(index, 1)
    this.setState({defineArray})
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let edit = this.state.edit
    // let define = getFieldValue("define")
    // console.log("define", define)

    let defineForm = this.state.defineArray.map((v, index) => {
      return (
        <div key={index}>
          <Icon
            style={{"fontSize":"20px",margin: "5px 5px 0 0"}}
            className="dynamic-delete-button fr pointer"
            type="minus-circle-o"
            onClick={() => this.rmDefineKey(index)}
          />
          <Row gutter={4} style={{width: "calc(100% - 30px)"}}>
            <Col span={8}>
              <Form.Item style={{marginBottom: "0"}}>
                {getFieldDecorator(`define[${index}].property`, {
                })(
                  <ACInput placeholder={this.msg['assettemplate.common.attrName']} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item style={{marginBottom: "0"}}>
                {getFieldDecorator(`define[${index}].dataType`, {
                })(
                  <Select placeholder={this.msg['assettemplate.common.type']}>
                    <Option value="Long">Long</Option>
                    <Option value="Double">Double</Option>
                    <Option value="String">String</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item style={{marginBottom: "0"}}>
                {getFieldDecorator(`define[${index}].label`, {
                })(
                  <ACInput placeholder={this.msg['assettemplate.common.showName']} />
                )}
              </Form.Item>
            </Col>

          </Row>
        </div>
      )
    })

    return (
      <Form layout="vertical" onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          {this.props.user.level === 1 &&
          <Col span={12}>
            <Form.Item label={this.msg['common.tenantid']}>
              {getFieldDecorator('tenantId', {
                rules: [{ required: true, message: this.msg['alert.common.pleaseChooseTenantIdFirst'] }],
              })(
                <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']}
                        disabled={edit}
                        onSelect={this.hdlTenantSelect}>
                  {this.props.tenants.map(tenant => {
                    return (<Option value={tenant.id} key={tenant.id}>{tenant.id}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          }
          <Col span={12}>
            <Form.Item label={this.msg['assettemplate.common.templateName']}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={<Fm id="common.description" defaultMessage="描述"/>}>
              {getFieldDecorator('description', {
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={<Fm id="assettemplate.common.extend" defaultMessage="从现有模板继承"/>}>
              <Select placeholder={this.msg['alert.common.pleaseChooseTenantIdFirst']}
                      onSelect={this.hdlTplChange}>
                {this.state.assetCatgryTpls.map((data, index) => {
                  return (<Option name={data.name} key={index}>{data.name}</Option>)
                })}
              </Select>

            </Form.Item>
          </Col>
        </Row>
        <Title className="title mb24"><Fm id="assettemplate.common.attrDefine" defaultMessage="属性定义" /></Title>
        <div>
          <div className="ant-form-item-label">
            <label className="" title={this.msg['common.metadata']}>
              <Fm id="common.propertie" defaultMessage="属性" />
            </label>
          </div>
          <div>
            {defineForm}
            <Row style={{width: "calc(100% - 33px)",marginBottom: 24}}>
              <Button type="dashed" onClick={this.addDefineForm} block>
                <Icon type="plus" /><Fm id="common.addOne" defaultMessage="增加一项" />
              </Button>
            </Row>

          </div>

        </div>
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{this.msg['common.submit']}</Button>
          </Form.Item>
        </Row>
      </Form>
    );
  }
}
