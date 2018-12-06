import { Component } from 'react'
import {Menu, Dropdown, Icon, Spin} from 'antd';
import {Link} from 'dva/router'
import React from "react";
// import {injectIntl} from "acom/Intl/injectIntl";

export class CellMenu extends Component{
  // TODO 查看关联详情
  render () {
    let html
    if(this.props.data && this.props.data.token){
      let menu = (
        <Menu>
          <Menu.Item key="0">
            <Link to={`${this.props.frameworkComponentWrapper.agGridReact.props.location.pathname}/edit/${this.props.data.id}/${this.props.data.tenantId}`}>编辑</Link>
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
