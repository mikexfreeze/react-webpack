/* create by Micheal Xiao 2018/11/13 15:29 */
import {Fm, injectIntl} from "acom/Intl";
import {Component} from "react";
import {Dropdown, Icon, Spin, Menu} from "antd";
import React from "react";
import {Link} from "react-router-dom";
import {EndpointListBase} from "routes/Endpoint/Endpoint/Components";
import {queryEPByEPG} from "services/endpointGroupApi";

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
export class Status extends Component {
  msg = this.props.intl.messages

  render () {
    let status = this.props.value
    let html = ''
    switch (status) {
      case "STATIC":
        html = <span><Fm id='endpointGroup.static' defaultMessage='静态' /></span>
        break;
      case 'DYNAMIC':
        html = <span><Fm id='endpointGroup.dynamic' defaultMessage='动态' /></span>
        break;
      default:
        html = <span><Fm id='common.unknown' defaultMessage='未知' /></span>
    }
    return html
  }
}

@injectIntl()
export class EndpointList extends EndpointListBase {
  constructor (props) {
    super(props)
    if(this.props.type === "STATIC"){
      this.columnDefs = [
        {
          cellRenderer: 'EndPointListMenu',
          width: 60,
          cellClass: 'text-center',
          suppressSizeToFit: true,
          headerClass: 'text-center',
          pinned: 'left',
          headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
        },
        ...this.columnDefs
      ]

      this.agComponents = {
        ...this.agComponents,
        EndPointListMenu,
      }
    }
  }

  queryTableData = queryEPByEPG

  pageParams = {
    ...this.pageParams,
    id: this.props.id,
  }

  gridContext = {
    onDelete: this.props.onDelete,
  }
}

@injectIntl()
export class EndPointListMenu extends Component {
  msg = this.props.intl.messages

  render() {
    let html
    if (this.props.data) {
      let menu = (
        <Menu>
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
