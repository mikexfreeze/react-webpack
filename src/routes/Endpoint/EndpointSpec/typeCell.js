import { Component } from 'react';
import { injectIntl } from 'acom/Intl/injectIntl';

@injectIntl()
export default class TypeCell extends Component{
  render () {
    const {intl: {messages}} = this.props;

    let type = this.props.value;
    let text = '';
    switch (type) {
      case "Composite":
        text = messages['specification.common.composite']
        break;
      default:
        text = messages['specification.common.standalone']
    }
    return <span>{text}</span>
  }
}
