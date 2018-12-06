import React, {Component} from 'react';
import {Fm} from "acom/Intl";

class LevelFilter extends Component {
  render() {
    switch (+this.props.level) {
      case 1:
        return <Fm id="common.systemlevel" defaultMessage="系统级" />
      case 2:
        return <Fm id="common.tenantlevle" defaultMessage="租户级" />
      case 3:
        return <Fm id="common.projectlevel" defaultMessage="项目级" />
      default:
        return '未知级别'
    }
  }
}

export {LevelFilter};
