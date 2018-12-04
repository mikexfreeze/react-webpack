import React from 'react'
import {Layout, Spin} from 'antd';
import SiderMenu from '../components/SiderMenu'
import { Route, Switch, Redirect } from 'dva/router';
import GlobalHeader from '../components/GlobalHeader'
import { connect } from 'dva';
import logo from 'assets/logo/ant-logo.svg'
import { getMenuData } from '../common/menu';
import basicRoute from '../common/routerConfig'
import NotFound from '../routes/Exception/404';
import Authorized from '../utils/Authorized';
import 'acom/theme/ag-grid-theme.scss'
const { Content, Header } = Layout;
const { AuthorizedRoute } = Authorized;

/**
 * 根据菜单取得重定向地址.给每个有子菜单的菜单项设置默认路由
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

@connect(({global, user}) => ({
  collapsed: global.collapsed,
  user,
}))
class BasicLayout extends React.PureComponent {

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  // 用户下拉菜单
  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch({type: 'user/fetchCurrent'})
  }

  render () {
    const {
      collapsed,
      match,
      location,
      user,
      routerData,
    } = this.props;
    // console.log('routerData:', routerData)

    return (
      <Layout>
        <SiderMenu
          collapsed={collapsed}
          Authorized={Authorized}
          onCollapse={this.handleMenuCollapse}
          menuData={basicRoute}
          location={location}
          logo={logo}
          title="AConn"
          match={match}
        />
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              collapsed={collapsed}
              location={location}
              routerData={routerData}
              onCollapse={this.handleMenuCollapse}
              currentUser={user}
              onMenuClick={this.handleMenuClick}
            />
          </Header>
          {user.username ?
            <Content style={{ margin: '12px', height: '100%' }}>
              <Switch>
                {routerData.map(item => (
                  <AuthorizedRoute
                    key={item.path}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                    authority={item.authority}
                    redirectPath="/exception/403"
                  />
                ))}
                <Redirect exact from="/" to="/dashboard" />
                <Route render={NotFound} />
              </Switch>
            </Content> :
            <div className="global-spin">
              <Spin size="large" />
            </div>
          }
        </Layout>
      </Layout>
    )
  }
}

export default BasicLayout

