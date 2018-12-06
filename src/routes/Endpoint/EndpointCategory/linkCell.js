import { Component } from 'react'
import { Link } from 'dva/router'

export default class LinkCell extends Component{
  componentDidMount() {
  }

  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname
    let path = this.props.value
    let html = path ?
      <Link to={`${ppath}/detail/${path}/${this.props.data.tenantId}`}>{path}</Link>
      : ''
    return html
  }
}
