import {Component} from 'react'
import {Button, Card, Col, Divider, Row, Spin, Tabs} from "antd";
import {Fm, injectIntl} from "acom/Intl";
import {queryAssetAlert, queryAssetById, queryAssetEPStatus} from "services/assetApi";
import {log} from 'utils'
import {
  AssignmentsList,
} from "routes/EndpointManage/Endpoint/Components";
import React from "react";
import {PointsList, MeasureList, AlertList, History} from "routes/EndpointManage/Asset/Components";
import {Title} from "acom";
import DescriptionList from "acom/DescriptionList";
import DateCell from "acom/Cell/DateCell";
import Map from "routes/Dashboard/Map";
import {AlertStatGraph, EndpointStatGraph} from "routes/EndpointManage/Project/Components";

const TabPane = Tabs.TabPane;
const { Description } = DescriptionList;

@injectIntl()
class AssetDetail extends Component {

  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId

    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
      tenantId: this.tenantId
    }
    this.state = {
      asset: {},
      endpointStat: [],
      alertStat: [],
    }
  }

  componentDidMount () {
    queryAssetById({
      id: this.id,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryAssetById:", res.data)
      this.setState({asset: res.data})
    })
    queryAssetEPStatus({
      id: this.id,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryAssetEPStatus:", res.data)
      this.setState({endpointStat: res.data})
    })
    queryAssetAlert({
      id: this.id,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryAssetAlert:", res.data)
      this.setState({alertStat: res.data})
    })
  }

  msg = this.props.intl.messages

  render() {

    let asset = this.state.asset
    return (
      <div>
        { asset.id ?
          <Card bordered={false}>
            <Title className={`title mb24`}><Fm id="asset.common.assetdetail" defaultMessage="终端详情" /></Title>
            <Row>
              <Col span={6}>
                <DescriptionList size="large" col={1}
                                 style={{ marginBottom: 32 }}>
                  <Description term={this.msg['common.tenantid']}>{asset.tenantId}</Description>
                  <Description term="ID">{asset.id}</Description>
                  <Description term={this.msg['asset.listasset.assetname']}>{asset.name}</Description>
                  <Description term={this.msg['asset.listasset.assettype']}>{asset.type}</Description>
                  <Description term={this.msg['common.createby']}>{asset.createdBy}</Description>
                  <Description term={this.msg['common.createdtime']}><DateCell value={asset.createdTime} /></Description>
                  <Description term={this.msg['common.updatedtime']}><DateCell value={asset.updateTime} /></Description>
                </DescriptionList>
              </Col>
              <Col span={9}>
                <EndpointStatGraph msgId="asset.detailasset.assignmentEpCount" style={{height: 280}} endpointStat={this.state.endpointStat} />
              </Col>
              <Col span={9}>
                <AlertStatGraph msgId="home.realtimeAlertStat" style={{height: 280}} alertStat={this.state.alertStat} />
              </Col>

            </Row>

            <Tabs defaultActiveKey="1">
              <TabPane tab={this.msg['assignment.common.associate']} key="1">
                <div style={{minHeight: 300,position: "relative"}}>
                  <AssignmentsList tenantId={this.tenantId} assetId={asset.id} location={this.props.location} />
                </div>
              </TabPane>
              <TabPane tab={this.msg['common.map']} key="2">
                <Map
                  tenantId={this.tenantId}
                />
              </TabPane>
              <TabPane tab={this.msg['common.locations']} key="3">
                <PointsList tenantId={this.tenantId} assetId={asset.id} />
              </TabPane>
              <TabPane tab={this.msg['common.measurements']} key="4">
                <MeasureList tenantId={this.tenantId} assetId={asset.id} />
              </TabPane>
              <TabPane tab={this.msg['common.alerts']} key="5">
                <AlertList tenantId={this.tenantId} assetId={asset.id} />
              </TabPane>
              <TabPane tab={this.msg['common.changeLog']} key="6">
                <History tenantId={this.tenantId} assetId={asset.id} />
              </TabPane>
            </Tabs>
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
    );
  }
}

export default AssetDetail;
