/* create by Micheal Xiao 2018/11/22 15:20 */
import React from 'react'
import ReactDOM from 'react-dom';
import tsTest from './test-ts'

class HelloMessage extends React.Component {
  render() {
    let ts = new tsTest("t")
    return <div>Hello {this.props.name}</div>;
  }
}

ReactDOM.render(
  <HelloMessage name="Taylor" />,
  document.getElementById('app')
);