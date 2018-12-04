import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'dva/router';
import styles from './index.less';
import { urlToList } from 'acom/_utils/pathTools'
import cloneDeep from 'lodash/cloneDeep'
import { getMenuRouter } from '../../common/router'

const { Sider } = Layout;
const { SubMenu } = Menu;

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '/iconfont.js',
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
  }
  if (typeof icon === 'string') {
    return <IconFont type={icon} />;
  }
  return icon;
};

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) => {
  return paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))),
    []
  );
}
/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = menu =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * @props collapsed
 * @props logo
 * @props menuData
 */
export default class SiderMenu extends React.Component {
  constructor(props) {
    super(props);
    this.menus = getMenuRouter(cloneDeep(props.menuData));
    this.flatMenuKeys = getFlatMenuKeys(this.menus);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
  }

  componentDidMount () {}

  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const {
      location: { pathname },
    } =
    props || this.props;
    return getMenuMatchKeys(this.flatMenuKeys, urlToList(pathname));
  }



  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData, ppath) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hide)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };

  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    const { Authorized } = this.props;
    if (Authorized && Authorized.check) {
      const { check } = Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = (item, ppath) => {
    // 当有children 且 route 没有设定组件 就展示子菜单
    if (item.children && item.children.some(child => child.name) && item.component === undefined) {
      const childrenItems = this.getNavMenuItems(item.children, item.path);
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </span>
              ) : (
                item.name
              )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return <Menu.Item key={item.path}>{this.getMenuItemPath(item, ppath)}</Menu.Item>;
    }
  };

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = (item, ppath) => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    const { location } = this.props;
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };

  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {
      location: { pathname },
    } = this.props;
    return getMenuMatchKeys(this.flatMenuKeys, urlToList(pathname));
  };

  isMainMenu = key => {
    return this.menus.some(item => key && (item.key === key || item.path === key));
  };

  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };

  render() {
    const {
      collapsed,
    } = this.props
    const { openKeys } = this.state;
    const menuProps = collapsed
      ? {}
      : {
        openKeys,
      };

    let selectedKeys = this.getSelectedMenuKeys();
    // console.log('selectedKeys:', selectedKeys)
    // console.log('openKeys:', openKeys)
    // console.log('this.menu:', this.menus);

    return (
      <Sider
        trigger={null}
        collapsible
        breakpoint="lg"
        collapsed={collapsed}
        width={185}
        collapsedWidth={46}
        theme="light"
        className={styles.sider}
      >
        <div className={`${styles.logo} ${collapsed ? styles.logoColl : null}`} key="logo">
          <Link to="/">
            <IconFont className={styles.logoIcon} type="icon-logo" />
            <IconFont className={`${styles.logoText} ml10`} type="icon-Aconn" />
          </Link>
        </div>
        <Menu
          mode="inline"
          theme="light"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
        >
          {this.getNavMenuItems(this.menus)}
        </Menu>
      </Sider>
    );
  }
}

