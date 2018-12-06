import {Component} from 'react'
import {Button, Card, Col, Divider, Row, Spin, Tabs} from "antd";
import {Fm, injectIntl} from "acom/Intl";
import {queryProjectByToken, getProjectEndpointStatus, getProjectAlert} from 'services/projectApi';
import {log} from 'utils'
import React from "react";
import {Title} from "acom";
import DescriptionList from "acom/DescriptionList";
import DateCell from "acom/Cell/DateCell";
import storage from 'store2';
import { AlertStatGraph, EndpointStatGraph, EndpointsList, PointsList, MeasureList,
         AlertList, History, Zone, ProjectMap } from './Components';

const TabPane = Tabs.TabPane;
const { Description } = DescriptionList;

@injectIntl()
class ProjectDetail extends Component {

  constructor(props){
    super(props);
    this.token = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
    this.userLevel = storage.get('user').level;

    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
      tenantId: this.tenantId
    }
    this.state = {
      project: {},
      endpointStat: {},
      isEndpointStatLoaded: false,
      alertStat: {},
      isAlertStatLoaded: false,
      activeTabKey: 1
    }

  }

  componentDidMount () {
    queryProjectByToken({
      token: this.token,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryProjectByToken:", res.data)
      this.setState({project: res.data})
    })

    getProjectEndpointStatus({
      token: this.token,
      tenantId: this.tenantId
    }).then(res => {
      log.info('getProjectEndpointStatus: ', res.data);
      this.setState({
        endpointStat: res.data,
        isEndpointStatLoaded: true
      });
    });

    getProjectAlert({
      token: this.token,
      tenantId: this.tenantId
    }).then(res => {
      log.info('getProjectAlert: ', res.data);
      this.setState({
        alertStat: res.data,
        isAlertStatLoaded: true
      })
    });
  }

  onTabChange = (activeKey) => {
    log.debug('Tab activeKey: ', activeKey);

    // this.activeTabKey = activeKey;

    this.setState({
      activeKey: activeKey
    });
  }

  msg = this.props.intl.messages

  render() {

    let asset = this.state.project;
    const { project, endpointStat, isEndpointStatLoaded, alertStat, isAlertStatLoaded, activeKey } = this.state;

    return (
      <div>
        { project.token ?
          <Card bordered={false}>
            <Title className={`title mb24`}><Fm id="project.projectDetail" defaultMessage="项目详情" /></Title>
            <Row gutter={12}>
              <Col span={8}>
                {isEndpointStatLoaded && <EndpointStatGraph msgId="home.realtimeEndpointStat" endpointStat={endpointStat}></EndpointStatGraph>}
              </Col>
              <Col span={8}>
                {isAlertStatLoaded && <AlertStatGraph msgId="home.realtimeAlertStat" alertStat={alertStat}></AlertStatGraph>}
              </Col>
              <Col span={8}>
                <DescriptionList size="large" col={1}
                                 style={{ marginBottom: 32 }}>
                  {this.userLevel === 1 && <Description term={this.msg['common.tenantid']}>{asset.tenantId}</Description>}
                  <Description term={this.msg['common.name']}>{project.name}</Description>
                  <Description term={this.msg['common.token']}>{project.token}</Description>
                  <Description term={this.msg['common.createby']}>{project.createdBy}</Description>
                  <Description term={this.msg['common.createdtime']}><DateCell value={asset.createdTime} /></Description>
                  <Description term={this.msg['common.updatedtime']}><DateCell value={asset.updateTime} /></Description>
                  <Description term={this.msg['project.mapApiKey']}>{project.baiduMapApiKey}</Description>
                  <Description term={this.msg['common.description']}>{project.description}</Description>
                </DescriptionList>
              </Col>
            </Row>

            <Tabs defaultActiveKey="1" onChange={this.onTabChange}>
              <TabPane tab={this.msg['common.endpoint']} key="1">
                <div style={{minHeight: 300,position: "relative"}}>
                  <EndpointsList tenantId={this.tenantId} projectToken={project.token} location={this.props.location} />
                </div>
              </TabPane>
              <TabPane tab={this.msg['common.map']} key="2">
                <ProjectMap tenantId={this.tenantId} projectToken={this.token} isTabActive={activeKey} />
              </TabPane>
              <TabPane tab={this.msg['common.locations']} key="3">
                <PointsList tenantId={this.tenantId} projectToken={this.token} />
              </TabPane>
              <TabPane tab={this.msg['common.measurements']} key="4">
                <MeasureList tenantId={this.tenantId} projectToken={this.token} />
              </TabPane>
              <TabPane tab={this.msg['common.alerts']} key="5">
                <AlertList tenantId={this.tenantId} projectToken={this.token} />
              </TabPane>
              <TabPane tab={this.msg['common.zone']} key="6">
                <Zone tenantId={this.tenantId} projectToken={this.token} mapCenter={JSON.parse(project.mapData)} />
              </TabPane>
              <TabPane tab={this.msg['common.changeLog']} key="7">
                <History tenantId={this.tenantId} projectToken={this.token} />
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

export default ProjectDetail;
