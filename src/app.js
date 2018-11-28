/* create by Micheal Xiao 2018/11/22 15:20 */
import React from 'react'
// import LocaleAP from "./acom/locale-provider";
// import {addLocaleData, IntlProvider} from "react-intl";
import { connect } from 'dva'
import {Route, Switch, routerRedux} from "dva/router";
import {getRouter} from "./common/router";
import {login} from "./common/routerConfig";

import 'moment/locale/zh-cn';
// import walden from 'assets/json/walden';
// import echarts from 'echarts';

const { ConnectedRouter } = routerRedux;

@connect(({global}) => ({
  lang: global.lang,
}))
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const Login = getRouter(this.props.app, login).component;

    return (
      <ConnectedRouter history={this.props.history}>
        <Switch>
          <Route path="/login" exact component={Login} />
        </Switch>
      </ConnectedRouter>
    )
  }
}
