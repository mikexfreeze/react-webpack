import React, {Component} from 'react';
import {Fm, injectIntl} from "acom/Intl";
import {Button, Checkbox, Col, Form, message, Row, Select} from "antd";
import {connect} from "dva";
import {batchEditEPAsset, batchEditEPGroup, batchReleaseEndPoint, batchUpdateEndPoint} from "services/endpointApi";
import {log} from "utils";
import {MetaInput} from "components";

const Option = Select.Option

@injectIntl()
@connect(({global, specifications}) => ({
  onXHR: global.onXHR,
  specifications,
}))
@Form.create()
export class EndSpecBatch extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;

    dispatch({type: 'specifications/fetch', payload: {tenantId:this.props.endList[0].tenantId}});
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let endpointIdList = []
        console.log(this.props.endList)
        for (let endpoint of this.props.endList) {
          endpointIdList.push(endpoint.id)
        }

        batchUpdateEndPoint({
          ...values,
          endpointIdList,
        })
          .then(res => {
            console.log("批量编辑终端：", res)
            if(res.status === 200){
              message.success(`${this.msg['alert.editSuccess']}`);
              this.props.onBatch()
            }
          })
      }
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['endpoint.common.endpointSpec']}>
              {getFieldDecorator('specToken', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}>
                  {this.props.specifications.map(spec => {
                    return (<Option value={spec.token} key={spec.token}>{spec.name}</Option>)
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
@connect(({global}) => ({
  onXHR: global.onXHR,
}))
@Form.create()
export class EndAssetBatchRelease extends Component {

  msg = this.props.intl.messages

  state = {
    checked: true
  }

  hdlCheck = (e) => {
    this.setState({checked: e.target.checked})
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let assignmentList = []
        let tenantId = this.props.endList[0].tenantId
        console.log(this.props.endList)
        for (let endpoint of this.props.endList) {
          if(endpoint.assignmentToken){
            assignmentList.push(endpoint.assignmentToken)
          }
        }
        if(assignmentList.length === 0){
          message.error(`${this.msg['endpoint.common.unassociatedasset']}`);
          return
        }

        batchReleaseEndPoint(tenantId, assignmentList)
          .then(res => {
            log.info("批量编辑终端-资产释放：", res)
            if(res.status === 200){
              message.success(`${this.msg['alert.editSuccess']}`);
              this.props.onBatch()
            }
          })
      }
    });
  }

  render() {

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['alert.deleteassociate']}>
              <Checkbox onChange={this.hdlCheck} defaultChecked={true}>
                <Fm id="common.yes" defaultMessages="是" />
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row style={{marginTop: 30}}>
          <Col span={4} offset={20} className="text-center">
            <Button type="primary" htmlType="submit"
                    disabled={!this.state.checked}
                    loading={this.props.onXHR} block>{this.msg['common.submit']}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

@injectIntl()
@connect(({global, assetCategories, assets}) => ({
  onXHR: global.onXHR,
  assetCategories,
  assets,
}))
@Form.create()
export class EndAssignBatch extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch({type: 'assetCategories/fetch', payload: {tenantId:this.props.endList[0].tenantId}});
  }

  hdlCategoryChange = (e) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'assets/fetch',
      payload: {
        tenantId:this.props.endList[0].tenantId,
        categoryId: e,
      }
    });
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

    let endpointId = []
    for (let endpoint of this.props.endList) {
      endpointId.push(endpoint.id)
    }

    batchEditEPAsset({
      ...formValues,
      endpointId,
      tenantId: this.props.endList[0].tenantId,
      metaData,
    })
      .then(res => {
        log.info("批量编辑终端资产关联：", res)
        if(res.status === 201){
          message.success(this.msg['alert.editSuccess'])
          this.props.onBatch()
        }
      })
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['assignment.common.assetcategory']} required>
              <Select placeholder={this.msg['common.pleaseChoose']} onChange={this.hdlCategoryChange}>
                {this.props.assetCategories.map(asset => {
                  return (<Option value={asset.id} key={asset.id}>{asset.name}</Option>)
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={this.msg['assignment.common.asset']}>
              {getFieldDecorator('assetId', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}>
                  {this.props.assets.map(asset => {
                    return (<Option value={asset.id} key={asset.id}>{asset.name}</Option>)
                  })}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
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
@connect(({global, endpointGroup}) => ({
  onXHR: global.onXHR,
  endpointGroup,
}))
@Form.create()
export class EPGroupBatch extends Component {

  msg = this.props.intl.messages

  componentDidMount () {
    const { dispatch } = this.props;

    dispatch({type: 'endpointGroup/fetch', payload: {tenantId:this.props.endList[0].tenantId}});
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let endpointIdSet = []
        for (let endpoint of this.props.endList) {
          endpointIdSet.push(endpoint.id)
        }

        batchEditEPGroup({
          ...values,
          endpointIdSet,
          tenantId: this.props.endList[0].tenantId
        })
          .then(res => {
            console.log("批量编辑终端-添加终端组：", res)
            if(res.status === 200){
              message.success(`${this.msg['alert.editSuccess']}`);
              this.props.onBatch()
            }
          })
      }
    });
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.hdlSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={this.msg['endpoint.common.endpointGroup']}>
              {getFieldDecorator('groupId', {
                rules: [{ required: true, message: this.msg['common.pleaseChoose'] }],
              })(
                <Select placeholder={this.msg['common.pleaseChoose']}>
                  {this.props.endpointGroup.map(group => {
                    return (<Option value={group.id} key={group.id}>{group.groupName}</Option>)
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
