/* create by Micheal Xiao 2018/11/13 15:29 */
import {injectIntl} from "acom/Intl";
import {Component} from "react";
import {Dropdown, Icon, Spin, Menu} from "antd";
import React from "react";

@injectIntl()
export class CellMenu extends Component {
  msg = this.props.intl.messages

  render() {
    let html
    if (this.props.data) {
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
