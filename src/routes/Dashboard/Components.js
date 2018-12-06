import React, {Component} from 'react';
import { injectIntl, Fm } from "acom/Intl";
import styles from './Dashboard.less';
import { Row, Col } from 'antd';

@injectIntl()
export class GraphicCard extends Component {
  render() {
    return (
      <div className={styles.graphBox}>
        <p className={styles.graphBoxTitle}>{this.props.graphTitle}</p>
        {this.props.children}
      </div>
    );
  }
}

const infowindowBgStyle = {
  OFFLINE: '#666666',
  NORMAL: '#57df60',
  INFO: '#12caff',
  WARNING: '#ffc600',
  ERROR: '#ff8a00',
  CRITICAL: '#e80000',
  UNKNOWN: '#3c4b61'
}

export class MapDeviceInfo extends Component {
  render() {
    return (
      <div className={styles.infoBox} style={{borderColor: infowindowBgStyle[this.props.status]}}>
        <Row className={styles.infoBoxRow}>
          <Col span={6}>设备ID:</Col>
          <Col span={18}>{this.props.endpointId}</Col>
        </Row>
        <Row style={{backgroundColor: '#f6faff'}}  className={styles.infoBoxRow}>
          <Col span={6}>项目:</Col>
          <Col span={18}>{this.props.projectName}</Col>
        </Row>
        <Row  className={styles.infoBoxRow}>
          <Col span={6}>告警:</Col>
          <Col span={18}>{this.props.alert}</Col>
        </Row>
        <Row style={{backgroundColor: '#f6faff'}}  className={styles.infoBoxRow}>
          <Col span={6}>位置:</Col>
          <Col span={18}>{this.props.position}</Col>
        </Row>
      </div>
    );
  }
}

const statusTitle = {
  NORMAL: 'endpoint.common.normal',
  INFO: 'trigger.triggerRule.info',
  WARNING: 'trigger.triggerRule.warning',
  ERROR: 'trigger.triggerRule.error',
  CRITICAL: 'trigger.triggerRule.critical',
  OFFLINE: 'endpoint.common.offline'
}
// 项目地图标题状态组件
function StatusTitle(props) {
  const bgColor = infowindowBgStyle[props.status];
  const statusName = statusTitle[props.status];
  const count = props.count;
  return (
    <span className={styles.marginleft}>
      <i className={styles.projectHomeIcon} style={{backgroundColor: bgColor}}></i>
      <span className={styles.marginleftsm}><Fm id={statusName} /></span>
      <span className={styles.marginleftsm}>{count}</span>
    </span>
  )
}

// 项目地图标题组件
function ProjectMapTitle(props) {
  const epCount = props.epStatus;
  return (
    <span>
      <span><Fm id="home.projectRealtimeAlertStat" defaultMessage="项目终端实时状态" /></span>
      <span>(</span>
      <span><Fm id="home.allJoinCount" defaultMessage="总接入数" />:{epCount.projectAllJoinCount}</span>
      <StatusTitle status="NORMAL" count={epCount.normalCntEP} />
      <StatusTitle status="INFO" count={epCount.infoCntEP} />
      <StatusTitle status="WARNING" count={epCount.warningCntEP} />
      <StatusTitle status="ERROR" count={epCount.errorCntEP} />
      <StatusTitle status="CRITICAL" count={epCount.criticalCntEP} />
      <StatusTitle status="OFFLINE" count={epCount.offlineCntEP} />
      <span>)</span>
    </span>
  );
}

export { ProjectMapTitle };