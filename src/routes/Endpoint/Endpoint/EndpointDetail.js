import React from 'react'
import {Card, Divider, Spin, Button, Row, Col} from 'antd';
import {Title} from "acom";
import {injectIntl, Fm} from "acom/Intl";
import DescriptionList from 'acom/DescriptionList/index';
import DateCell from 'acom/Cell/DateCell'
import {LinkStatus, AlertStatus, ActiveStatusCell} from './Components'
import { connect } from 'dva'

const { Description } = DescriptionList;
@injectIntl()
@connect(({endpoint}) => ({
  endpoint,
}))
export default class EndpointDetail extends React.Component{
  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
  }

  msg = this.props.intl.messages

  state = {
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch({
      type: 'endpoint/fetch',
      payload: {
        id: this.id,
        tenantId: this.tenantId
      },
    })
  }

  componentDidCatch(error, info) {
    console.log("ui error", error)
  }


  render(){
    let endpoint = this.props.endpoint
    let assigment = () => {
      let array = []
      if(endpoint.assignment){
        array[1] = <Description key="1" term="关联状态">{endpoint.assignment.status ? <ActiveStatusCell value={endpoint.assignment.status} /> : '未知'}</Description>
        if(endpoint.assignment.assetDto){
          array[0] = <Description key="0" term="关联资产">{endpoint.assignment.assetDto ? endpoint.assignment.assetDto.name : '空'}</Description>
        }
      }
      return array
    }
    let assign = assigment()
    // TODO metaData 显示优化
    return(
      <div>
        { endpoint.id ?
          <Card bordered={false}>
            <DescriptionList size="large"
                 title={<Title><Fm id="endpoint.common.endpointdetail" defaultMessage="终端详情" /></Title>}
                 style={{ marginBottom: 32 }}>
              <Description term={this.msg['common.tenantid']}>{endpoint.tenantId}</Description>
              <Description term={this.msg['common.tenantid']}>{endpoint.tenantId}</Description>
              <Description term={this.msg['common.endpointId']}>{endpoint.id}</Description>
              <Description term={this.msg['specification.common.specification']}>{endpoint.specification.name}</Description>
              <Description term={this.msg['trigger.triggerRule.siteName']}>{endpoint.project ? endpoint.project.name : '空'}</Description>
              {assign}
              <Description term={this.msg['common.connectStatus']}><LinkStatus value={endpoint.status} /></Description>
              <Description term={this.msg['common.alertStatus']}><AlertStatus value={endpoint.alertStatus} /></Description>
              <Description term={this.msg['common.createby']}>{endpoint.createdBy}</Description>
              <Description term={this.msg['common.createdtime']}><DateCell value={endpoint.createdTime} /></Description>
              <Description term={this.msg['common.updatedtime']}><DateCell value={endpoint.updateTime} /></Description>
              <Description term={this.msg['common.username']}>{endpoint.userName}</Description>
              <Description term={this.msg['common.password']}>{endpoint.password}</Description>
              <Description term={this.msg['common.metadata']}>{endpoint.metaData}</Description>
              <Description term={this.msg['common.description']}>{endpoint.description}</Description>
            </DescriptionList>
            <Divider style={{ marginBottom: 32 }} />
            <Row>
              <Col span={3} offset={10}>
                <Button type="default" className="mauto" onClick={this.props.history.goBack} block><Fm id="common.goBack" /></Button>
              </Col>
            </Row>
          </Card> :
          <div className="global-spin">
            <Spin size="large" />
          </div>
        }

      </div>


    )
  }

}
