import { Component } from 'react'
import {Menu, Dropdown, Icon, Spin} from 'antd';
import {Link} from 'dva/router'
import React from "react";
import Fm from "acom/Intl/FormattedMessage";

export default class DateCell extends Component{
  componentDidMount(){
  }

  menu = (
    <Menu>
      <Menu.Item key="0">
        <Link to={`${this.props.frameworkComponentWrapper.agGridReact.props.location.pathname}/edit/${this.props.data.token}/${this.props.data.tenantId}`}><Fm id="common.edit" defaultMessage="编辑" /></Link>
      </Menu.Item>
    </Menu>
  )

  render () {
    let html = this.props.data.token ?
      <Dropdown overlay={this.menu} trigger={['click']}>
        <span className="cellMenu">
          <Icon type="down" style={{fontSize: "14px"}} />
        </span>
      </Dropdown> : <Spin size="small"/>
    return html
  }
}
