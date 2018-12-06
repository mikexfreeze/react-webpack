import React, { PureComponent } from 'react';
import {Menu, Icon, Dropdown, Spin, message,} from 'antd';
import Debounce from 'lodash-decorators/debounce';
// import NoticeIcon from '../NoticeIcon';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import {connect} from "dva";
import {loadScript} from "utils/utils";
import ColorPicker from 'acom/Color/ColorPicker';
import { injectIntl } from 'react-intl'
import pathToRegexp from 'path-to-regexp';
import IconFont from "../Icon/IconFont";

function matchRoute(routerData, location) {
  for (let router of routerData.values()) {
    if(pathToRegexp(router.path).test(location.pathname)){
      return router
    }
  }
}

class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);

    this.lessLoaded = false;

    this.state = {
      color: '#1890ff',
      routerName: '',
    };
  }

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  componentDidMount() {
    this.setRouterName(this.props.routerData, this.props.location)
  }

  setRouterName = (routerData, location) => {
    let matchRouter = matchRoute(routerData, location)
    if(matchRouter){
      this.setState({
        routerName: matchRouter.name
      })
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(nextProps.location.pathname !== this.props.location.pathname){
      this.setRouterName(nextProps.routerData, nextProps.location)
    }
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  lgSelect = ({key}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLang',
      payload: key,
    });
  }

  lgChange = () => {
    const { dispatch } = this.props;

    let lang = this.props.lang
    dispatch({
      type: 'global/changeLang',
      payload: lang === 'zh-CN' ? 'en-US' : 'zh-CN',
    });
  }

  handleColorChange = (color) => {
    const changeColor = () => {
      const { intl: { messages } } = this.props;
      window.less.modifyVars({
        '@primary-color': color,
      }).then(() => {
        message.success(messages['tips.changeColor']);
        this.setState({ color });
      });
    };

    const lessUrl = 'https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.2/less.min.js';

    if (this.lessLoaded) {
      changeColor();
    } else {
      window.less = {
        async: true,
      };
      loadScript(lessUrl).then(() => {
        this.lessLoaded = true;
        changeColor();
      });
    }
  }

  render() {
    const {
      currentUser = {},
      collapsed,
      fetchingNotices,
      isMobile,
      logo,
      onNoticeVisibleChange,
      onMenuClick,
      onNoticeClear,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="logout">
          <Icon type="logout" />退出登录
        </Menu.Item>
      </Menu>
    );
    const lgMenu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.lgSelect}>
        <Menu.Item key="zh-CN">
          中文
        </Menu.Item>
        <Menu.Item key="en-US">
          ENGLISH
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.header}>
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <span style={{verticalAlign: 'top'}}>{this.state.routerName}</span>
        <div className={styles.right}>
          <ColorPicker
            type="sketch"
            small
            color={this.state.color}
            style={{float:'left',margin: '7px 20px 0 0'}}
            position="bottom"
            presetColors={[
              '#F5222D',
              '#FA541C',
              '#FA8C16',
              '#FAAD14',
              '#FADB14',
              '#A0D911',
              '#52C41A',
              '#13C2C2',
              '#1890FF',
              '#2F54EB',
              '#722ED1',
              '#EB2F96',
            ]}
            onChangeComplete={this.handleColorChange}
          />

          <IconFont className={`${styles.languageIcon} mr20`}
                    type={`icon-${this.props.lang === 'zh-CN' ? 'en' : 'zhong'}`}
                    onClick={this.lgChange} />

          {currentUser.username ? (
            <Dropdown overlay={menu} className={styles.avatarDropMenu}>
              <IconFont className={styles.avatar}
                        type="icon-user"/>
            </Dropdown>
          ) : (
            <Spin size="small" style={{ marginLeft: 8 }} />
          )}
        </div>

      </div>
    );
  }
}

export default injectIntl(connect(({global}) => ({
  lang: global.lang,
}))(GlobalHeader))

