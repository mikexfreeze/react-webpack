import { Component } from 'react'

export default class LinkCell extends Component{
  constructor(props) {
    super(props);
    this.invokeViewDetail = this.invokeViewDetail.bind(this);
  }

  invokeViewDetail() {
    this.props.context.componentParent.showViewCommandDrawer(this.props.data.token);
  }

  render () {
    let name = this.props.value;
    let path = this.props.data ? this.props.data.token : "";
    let html = path ?
      <a onClick={this.invokeViewDetail} >{name}</a>
      : ''
    return html
  }
}
