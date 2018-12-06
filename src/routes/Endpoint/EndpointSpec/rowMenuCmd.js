import { Component } from 'react'
import {Menu, Dropdown, Icon, Spin} from 'antd';
import React from "react";
import Fm from "acom/Intl/FormattedMessage";
import {Log} from 'utils/log';

export default class DateCell extends Component{
  constructor(props) {
    super(props);
    this.edit = this.edit.bind(this);
    this.token = this.props.data.token;
  }

  edit(token) {
    Log.debug(token);
    this.props.context.componentParent.showEditDrawer(token);
  }

  menu = (
    <Menu>
      <Menu.Item key="0">
        <a onClick={ () => this.edit(this.token)}><Fm id="common.edit" defaultMessage="编辑" /></a>
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
