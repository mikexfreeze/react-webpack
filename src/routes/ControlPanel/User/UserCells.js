import { Component } from 'react'
import { Link } from 'dva/router'
import {injectIntl} from "acom/Intl/injectIntl";
import {Fm} from "acom/Intl";
import {Dropdown, Icon, Spin, Menu} from "antd";
import React from "react";

export class CellMenu extends Component{

  hdlEdit = () => {
    this.props.context.onEdit(this.props.value)
  }

  hdlResetPwd = () => {
    this.props.context.onResetPwd(this.props.value)
  }

  render () {
    if(this.props.value){
      let menu = (
        <Menu>
          <Menu.Item onClick={this.hdlEdit}>
            <Fm id="common.edit" defaultMessage="编辑" />
          </Menu.Item>
          <Menu.Item onClick={this.hdlResetPwd}>
            <Fm id="alert.resetPwd" defaultMessage="重置密码" />
          </Menu.Item>
        </Menu>
      )

      return (
        <Dropdown overlay={menu} trigger={['click']}>
          <span className="cellMenu">
            <Icon type="down"/>
          </span>
        </Dropdown>
      )
    }else{
      return <Spin size="small"/>
    }

  }
}

export class LinkCell extends Component{
  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let path = this.props.value
    let html = path ?
      <Link to={ppath + '/detail/' + path}>{path}</Link>
      : ''
    return html
  }
}

@injectIntl()
export class ActiveStatusCell extends Component{
  render () {
    const {intl: {messages}} = this.props

    let status = this.props.value
    let text = ''
    switch (status) {
      case 1:
        text = messages['common.activated']
        break;
      default:
        text = messages['assignment.common.noAssociate']
    }
    return <span>{text}</span>
  }
}
