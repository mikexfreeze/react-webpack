import React, {Component} from 'react';
import {injectIntl} from "acom/Intl";
import {connect} from "dva";
import {Button, Col, Form, message, Row} from "antd";
import {ACInput, ACSelect as Select} from "acom/Form";
import {log} from "utils";
import {createAssetCategories, editAssetCategorie} from "services/assetApi";

const Option = Select.Option;

@injectIntl()
@connect(({user, global, tenants, assetCatgryTpls}) => ({
  user,
  loading: global.loading,
  tenants,
  assetCatgryTpls,
}))
@Form.create()
export default class AssetCatgryEditor extends Component {

  msg = this.props.intl.messages

  state = {
    type: "",
    edit: false
  }

  componentDidMount () {
    const { dispatch } = this.props;
    if(this.props.editStatus === "edit"){
      this.setState({edit:true})
    }else{
      this.setState({edit:false})
    }
    if(this.props.user.level > 1){
      dispatch({type: 'assetCatgryTpls/fetch'});
    }else{
      dispatch({type: 'tenants/fetch'});
    }
    if(this.props.editStatus === "edit"){
      console.log(this.props.assetCatgry)
      this.props.form.setFieldsValue({
        ...this.props.assetCatgry,
      })


    }

  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'assetCatgryTpls/fetch', payload:{id:e}});
  }

  hdlAssetTypeChange = (e, type) => {
    this.setState({type: type.props.type})
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        console.log(values)
        if(this.props.editStatus === "create"){
          createAssetCategories({
            ...values,
          })
            .then(res => {
              log.info("创建资产类型：", res)
              if(res.status === 201){
                message.success(this.msg['alert.createSuccess'])
                this.props.onSuccess()
              }
            })
        }else if(this.props.editStatus === "edit"){
          if(this.props.user.level > 1){
            values.tenantId = this.props.user.tenantId
          }
          editAssetCategorie({
            ...values,
          })
            .then(res => {
              log.info("编辑资产类型：", res)
              if(res.status === 200){
                message.success(this.msg['common.success'])
                this.props.onSuccess()
              }
            })
        }
      };

    })

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let edit = this.state.edit

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
            <Form.Item label="ID">
              {getFieldDecorator('id', {
                rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} readOnly={edit} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['assetcategory.common.assetcategoryname']}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['assetcategory.common.assetcategorytype']}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}
                        onSelect={this.hdlAssetTypeChange}>
                  {this.props.assetCatgryTpls.map(assetType => {
                    return (<Option value={assetType.name} key={assetType.id}>{assetType.name}</Option>)
                  })}
                </Select>
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
