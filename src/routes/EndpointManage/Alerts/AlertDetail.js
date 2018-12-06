/* create by Micheal Xiao 2018/11/20 17:45 */
import React, {Component} from 'react';
import DescriptionList from "acom/DescriptionList";
import {Fm, injectIntl} from "acom/Intl";
import {queryAlertById} from "services/alertApi";
import {log} from "utils";
import {Button, Card, Col, Divider, Row} from "antd";
import {Title} from "acom";
import DateCell from "acom/Cell/DateCell";
import {AlertStatus} from "./Cells"
const { Description } = DescriptionList;

@injectIntl()
class AlertDetail extends Component {

  msg = this.props.intl.messages

  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId

    this.state = {
      data: {},
    }
  }

  componentDidMount () {
    queryAlertById(this.id, this.tenantId)
      .then(res => {
        log.info("queryAlertById:", res.data)
        this.setState({data: res.data})
      })
  }
  render() {
    let data = this.state.data
    return (
      <Card bordered={false}>
        <Title className={`title mb24`}><Fm id="alertMgt.alertDetail" defaultMessage="告警详情" /></Title>
        <DescriptionList size="large" col={3}
                         style={{ marginBottom: 32 }}>
          <Description term={<Fm id="common.eventId" defaultMessage="事件ID" />}>{data.id}</Description>
          <Description term={<Fm id="common.tenantid" defaultMessage="租户ID" />}>{data.tenantId}</Description>
          <Description term={<Fm id="common.endpointId" defaultMessage="终端ID" />}>{data.endpointId}</Description>
          <Description term={<Fm id="assignment.common.assetId" defaultMessage="资产ID" />}>{data.assetId}</Description>
          <Description term={<Fm id="trigger.triggerRule.alertType" defaultMessage="告警类型" />}>{data.type}</Description>
          <Description term={<Fm id="trigger.triggerRule.alertLevel" defaultMessage="告警级别" />}>{data.level}</Description>
          <Description term={<Fm id="common.status" defaultMessage="状态" />}><AlertStatus value={data.alertStatus} /></Description>
          <Description term={<Fm id="trigger.triggerRule.alertInfo" defaultMessage="告警信息" />}>{data.message}</Description>
          <Description term={<Fm id="assignment.common.source" defaultMessage="来源" />}>{data.source}</Description>
          <Description term={<Fm id="common.eventTime" defaultMessage="事件时间" />}><DateCell value={data.receivedDate} /></Description>
        </DescriptionList>
        <Divider style={{ marginBottom: 32 }} />
        <Row>
          <Col span={3} offset={10}>
            <Button type="default" className="mauto" onClick={this.props.history.goBack} block><Fm id="common.goBack" /></Button>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default AlertDetail;
