import {injectIntl} from "acom/Intl";
import {Component} from "react";
import {Link} from "react-router-dom";
import {Dropdown, Icon, Spin, Menu} from "antd";
import React from "react";

@injectIntl()
export class RowMenu extends Component {
  msg = this.props.intl.messages

  render() {
    let html
    if (this.props.data && this.props.data.id) {
      let menu = (
        <Menu>
          <Menu.Item key="0" onClick={() => this.props.context.onEdit(this.props.data)}>
            <span>{this.msg["common.edit"]}</span>
          </Menu.Item>
          <Menu.Item key="1" onClick={() => this.props.context.onDelete(this.props.data)}>
            <span>{this.msg["common.delete"]}</span>
          </Menu.Item>
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

export class LinkCell extends Component {

  render() {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let path = this.props.value
    let html = path ?
      <Link to={`${ppath}/detail/${this.props.data.id}`}>{path}</Link>
      : ''
    return html
  }
}

@injectIntl()
export class ActiveStatusCell extends Component {
  render() {
    const {intl: {messages}} = this.props

    let status = this.props.value
    let text = ''
    switch (status) {
      case "Activated":
        text = messages['common.activated']
        break;
      case "Alarm":
        text = messages['common.alerts']
        break;
      case "Forbidden":
        text = messages['common.forbidden']
        break;
      default:
        text = messages['common.unknown']
    }
    return <span>{text}</span>
  }
}
