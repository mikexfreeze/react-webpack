import React from 'react'
import LocaleAP from "./acom/locale-provider";
import {addLocaleData, IntlProvider} from "react-intl";
import { connect } from 'dva'
import {Route, Switch, routerRedux} from "dva/router";
import {getRouter} from "./common/router";
import {layout, login} from "./common/routerConfig";

import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
// import 'moment/locale/zh-cn';
// import walden from 'assets/json/walden';
// import echarts from 'echarts';

const { ConnectedRouter } = routerRedux;
/**
 * 获取国际化资源文件
 *
 * @param {any} lang
 * @returns
 */
function getLocale(lang) {
  /* eslint-disable global-require */
  let result = {};
  switch (lang) {
    case 'zh-CN':
      result = require('./locales/cn');
      break;
    case 'en-US':
      result = require('./locales/en');
      break;
    default:
      result = require('./locales/cn');
  }

  return result.default || result;
  /* eslint-enable global-require */
}

@connect(({global}) => ({
  lang: global.lang,
}))
export default class App extends React.Component {
  constructor(props) {
    super(props);
    // echarts.registerTheme('walden', walden);
  }

  render () {
    const BasicLayout = getRouter(this.props.app, layout).component;
    const Login = getRouter(this.props.app, login).component;

    const appLocale = getLocale(this.props.lang);
    addLocaleData(...appLocale.data);
    const antLocale = this.props.lang === 'zh-CN' ? zh_CN : undefined

    return (
      <LocaleAP locale={appLocale}>
        <LocaleProvider locale={antLocale}>
          <IntlProvider
            locale={appLocale.locale}
            messages={appLocale.messages}
            formats={appLocale.formats}
            textComponent={React.Fragment}
          >
            <ConnectedRouter history={this.props.history}>
              <Switch>
                <Route path="/login" exact component={Login} />
                <Route path="/" render={ (props) => <BasicLayout {...props} />} />
              </Switch>
            </ConnectedRouter>
          </IntlProvider>
        </LocaleProvider>
      </LocaleAP>
    )
  }
}
