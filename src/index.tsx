import * as React from 'react'
import * as ReactDOM from 'react-dom';
import tsTest from './test-ts'
import jsTest from './test-js'
export interface HelloProps { name: string; }

// 'HelloProps' describes the shape of props.
// State is never set so we use the '{}' type.
class HelloMessage extends React.Component<HelloProps, {}> {
  render() {
    let ts = new tsTest("t")
    let js = new jsTest()
    return <div>Hello {this.props.name}</div>;
  }
}

ReactDOM.render(
<HelloMessage name="Taylor" />,
  document.getElementById('app')
);