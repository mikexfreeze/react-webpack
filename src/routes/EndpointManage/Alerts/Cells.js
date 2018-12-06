/* create by Micheal Xiao 2018/11/13 15:29 */
import {injectIntl, Fm} from "acom/Intl";
import {Component} from "react";
import {Dropdown, Icon, Spin, Menu, Badge,} from "antd";
import React from "react";
import {Link} from "react-router-dom";

@injectIntl()
export class CellMenu extends Component {
  msg = this.props.intl.messages

  render() {
    let html;let data = this.props.data
    if (data) {
      let confirm; let clear;
      if(data.alertStatus === "NEW" || data.alertStatus === "INPROCESS"){
        clear = (
          <Menu.Item key="1" onClick={() => this.props.context.onClear(this.props.data)}>
            <span><Fm id="common.eliminate" defaultMessage="消除"/></span>
          </Menu.Item>
        )
        if(data.alertStatus === "NEW"){
          confirm = (
            <Menu.Item key="0" onClick={() => this.props.context.onCheck(this.props.data)}>
              <span><Fm id="common.confirm" defaultMessage="确认"/></span>
            </Menu.Item>
          )
        }
      }
      let menu = (
        <Menu>
          {confirm}
          {clear}
        </Menu>
      )
      html = (
        <Dropdown overlay={menu} trigger={['click']}>
          <span className="cellMenu">
            <Icon type="down" style={{fontSize: "14px"}}/>
          </span>
        </Dropdown>
      )
    } else {
      html = <Spin size="small"/>
    }
    return html
  }
}

export class LinkCell extends Component{
  componentDidMount() {
  }

  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let name = this.props.value;
    let html = name ?
      <Link to={`${ppath}/detail/${name}/${this.props.data.tenantId}`}>{name}</Link>
      : ''
    return html
  }
}

@injectIntl()
export class AlertStatus extends Component {
  msg = this.props.intl.messages

  render () {
    let status = this.props.value
    let html = ''
    switch (status) {
      case "INPROCESS":
        html = <span><Fm id='alertMgt.alertStatusInprocess' defaultMessage='处理中' /></span>
        break;
      case 'NEW':
        html = <span><Fm id='alertMgt.alertStatusNew' defaultMessage='待处理' /></span>
        break;
      default:
        html = <span><Fm id='common.unknown' defaultMessage='未知' /></span>
    }
    return html
  }
}

@injectIntl()
export class AlertLevel extends Component {
  msg = this.props.intl.messages

  render () {
    let status = this.props.value
    let html = ''
    switch (status) {
      case "Info":
        html = (
          <span>
            <Badge offset={this.props.offset} status="success" />
            <Fm id='trigger.triggerRule.info' defaultMessage='通知' />
          </span>
        )
        break;
      case 'Warning':
        html = (
          <span>
            <Badge offset={this.props.offset} status="warning" />
            <Fm id="trigger.triggerRule.warning" defaultMessage="警告" />
          </span>
        )
        break;
      case 'Error':
        html = (
          <span>
            <Badge offset={this.props.offset} status="warning" />
            <Fm id="trigger.triggerRule.error" defaultMessage="严重" />
          </span>
        )
        break;
      case 'Critical':
        html = (
          <span>
            <Badge offset={this.props.offset} status="error" />
            <Fm id='trigger.triggerRule.critical' defaultMessage='致命' />
          </span>
        )
        break;
      default:
        html = <span><Badge offset={this.props.offset} status="warning" /><Fm id="common.unknown" defaultMessage="未知状态" /></span>
    }
    return html
  }
}
