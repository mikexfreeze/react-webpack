import { Component } from 'react'
import { Link } from 'dva/router'

export default class LinkCell extends Component{
  componentDidMount() {
  }

  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let name = this.props.value;
    let path = this.props.data ? this.props.data.token : "";
    let html = path ?
      <Link to={`${ppath}/detail/${path}/${this.props.data.tenantId}`}>{name}</Link>
      : ''
    return html
  }
}
