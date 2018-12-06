import { Component } from 'react'
import { Link } from 'dva/router'
import {Dropdown, Icon, Spin, Menu} from "antd";
import React from "react";
import {injectIntl} from "acom/Intl";

@injectIntl()
export class RowMenu extends Component{
  msg = this.props.intl.messages
  render () {
    let html
    if(this.props.data && this.props.data.id){
      let menu = (
        <Menu>
          <Menu.Item key="0">
            <Link to={`${this.props.frameworkComponentWrapper.agGridReact.props.location.pathname}/edit/${this.props.data.id}/${this.props.data.tenantId}`}>
              {this.msg["common.edit"]}
            </Link>
          </Menu.Item>
          <Menu.Item key="1" onClick={() => this.props.context.onDelete(this.props.value, this.props.data.tenantId)}>
            <span>{this.msg["common.delete"]}</span>
          </Menu.Item>
          <Menu.Item key="2" onClick={() => this.props.context.onOpenModal("command", this.props.data)}>
            <span>{this.msg["common.excuteCommand"]}</span>
          </Menu.Item>
          <Menu.Item key="3" onClick={() => this.props.context.onOpenModal("sendMsg", this.props.data)}>
            <span>{this.msg["endpoint.common.sendSMS"]}</span>
          </Menu.Item>
          <Menu.Item key="4" onClick={() => this.props.context.onOpenModal("firmwareUpdate", this.props.data)}>
            <span>{this.msg["endpoint.common.firmwareUpdate"]}</span>
          </Menu.Item>
          <Menu.Item key="5" onClick={() => this.props.context.onOpenModal("softwareUpdate", this.props.data)}>
            <span>{this.msg["endpoint.common.softwareUpdate"]}</span>
          </Menu.Item>
          <Menu.Item key="6" onClick={() => this.props.context.onOpenModal("modifyAssociate", this.props.data)}>
            <span>{this.msg["endpoint.common.modifyAssociate"]}</span>
          </Menu.Item>
        </Menu>
      )
      html = (
        <Dropdown overlay={menu} trigger={['click']}>
          <span className="cellMenu">
            <Icon type="down" style={{fontSize: "14px"}} />
          </span>
        </Dropdown>
      )
    }else{
      html = <Spin size="small"/>
    }
    return html
  }
}

export class LinkCell extends Component{

  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let path = this.props.value
    let html = path ?
      <Link to={`${ppath}/detail/${path}/${this.props.data.tenantId}`}>{path}</Link>
      : ''
    return html
  }
}

export class ObjToStr extends Component {
  render () {

    return (
      <span>{Object.entries(this.props.value).toString()}</span>
    )
  }
}
