import React, {Component} from 'react';
import {injectIntl} from "acom/Intl";
import {connect} from "dva";
import {Button, Col, Form, message, Row} from "antd";
import {MetaInput} from "components";
import {ACInput, ACSelect as Select} from "acom/Form";
import {log} from "utils";
import {createAsset, editAsset} from "services/assetApi";

const Option = Select.Option;

@injectIntl()
@connect(({user, global, tenants, assetCategories}) => ({
  user,
  loading: global.loading,
  tenants,
  assetCategories,
}))
@Form.create()
class AssetEditor extends Component {

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
      dispatch({type: 'assetCategories/fetch'});
      // dispatch({type: 'projects/fetch'});
      // dispatch({type: 'accts/fetch'});
    }else{
      dispatch({type: 'tenants/fetch'});
    }
    if(this.props.editStatus === "edit"){
      this.setState({type: this.props.asset.type})
      let thiz = this
      setTimeout(function () {
        thiz.props.form.setFieldsValue({
          ...thiz.props.asset,
          configuration: JSON.parse(thiz.props.asset.configuration)
        })
      }, 20)

      let meta = []
      if(this.props.asset.properties){
        for (let [i, v] of Object.entries(JSON.parse(this.props.asset.properties))) {
          meta.push([i, v])
        }
        this.metaInput.setDefaultValue(meta)
      }


    }

  }

  hdlTenantSelect = (e) => {
    const { dispatch } = this.props;
    dispatch({type: 'assetCategories/fetch', payload:{tenantId:e}});
  }

  hdlAssetTypeChange = (e, type) => {
    this.setState({type: type.props.type})
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
    console.log({
      ...formValues,
      metaData,
    })
    if(this.props.editStatus === "create"){
      createAsset({
        ...formValues,
        properties: metaData,
        type: this.state.type
      })
        .then(res => {
          log.info("创建资产：", res)
          if(res.status === 201){
            message.success(this.msg['alert.createSuccess'])
            this.props.onSuccess()
          }
        })
    }else if(this.props.editStatus === "edit"){
      if(this.props.user.level > 1){
        formValues.tenantId = this.props.user.tenantId
      }
      editAsset({
        ...formValues,
        properties: metaData,
        type: this.state.type
      })
        .then(res => {
          log.info("编辑资产：", res)
          if(res.status === 200){
            message.success(this.msg['common.success'])
            this.props.onSuccess()
          }
        })
    }

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let edit = this.state.edit
    let assetConfig
    if(this.state.type === "长宽高"){
      assetConfig = (
        <span>
          <Col span={12}>
          <Form.Item label={this.msg['asset.common.long']}>
            {getFieldDecorator('configuration.long', {})(
              <ACInput placeholder={this.msg['common.pleaseInput']} />
            )}
          </Form.Item>
        </Col>
          <Col span={12}>
            <Form.Item label={this.msg['asset.common.width']}>
              {getFieldDecorator('configuration.width', {})(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['asset.common.height']}>
              {getFieldDecorator('configuration.height', {})(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
        </span>
      )
    }else if (this.state.type === "LOCATION"){
      assetConfig = (
        <span>
          <Col span={12}>
            <Form.Item label={this.msg['common.longtitude']}>
              {getFieldDecorator('configuration.longtitude', {})(
                <ACInput placeholder={this.msg['common.pleaseInput']}/>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['common.latitude']}>
              {getFieldDecorator('configuration.latitude', {})(
                <ACInput placeholder={this.msg['common.pleaseInput']}/>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['common.elevation']}>
              {getFieldDecorator('configuration.elevation', {})(
                <ACInput placeholder={this.msg['common.pleaseInput']}/>
              )}
            </Form.Item>
          </Col>
        </span>
      )
    }

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
                    return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
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
            <Form.Item label={this.msg['endpoint.common.assetname']}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: this.msg['common.pleaseInput'] }],
              })(
                <ACInput placeholder={this.msg['common.pleaseInput']} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={this.msg['asset.listasset.assettype']}>
              {getFieldDecorator('categoryId', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}
                        disabled={edit}
                        onSelect={this.hdlAssetTypeChange}>
                  {this.props.assetCategories.map(assetType => {
                    return (<Option value={assetType.id} type={assetType.type} key={assetType.id}>{assetType.name}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          {assetConfig}
          <Col span={12}>
            <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
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

export default AssetEditor;
