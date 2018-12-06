import { Component } from 'react'
import { Link } from 'dva/router'

export default class LinkCell extends Component{
  render () {
    let ppath = this.props.frameworkComponentWrapper.agGridReact.props.location.pathname

    if(this.props.data){
      let path = this.props.data.code
      return <Link to={ppath + '/detail/' + path}>{this.props.value}</Link>
    }else{
      return ''
    }

  }
}
