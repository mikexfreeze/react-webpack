import React, {Component} from 'react';
import styles from "./tabs.less"
import {Icon} from 'antd'

/**
 * @Tabs 使用方法同antd Tabs 样式不同
 */
class TabPane extends Component {
  render () {
    return (
      <div>{this.props.children}</div>
    )
  }
}

class Tabs extends Component {

  state = {
    activeKey: this.props.defaultActiveKey
  }

  static TabPane = TabPane

  componentDidMount () {
    this.props.children.forEach( child => {
      // console.log(child)
    })
  }

  hdlClickTab = (key) => {
    this.setState({
      activeKey:key
    })
  }

  render() {
    let tabs = [];
    this.props.children.forEach( child => {
      let props = child.props
      let title;
      if(props.title){
        title = (
          <div className={`${styles.tabTitle}`}>
            {props.title}
          </div>
        )
      }
      let tab = (
        <div key={props.id}>
          {title}
          <div className={`${styles.tab} flex  ${(props.id === this.state.activeKey) && "active"}`} onClick={() => this.hdlClickTab(props.id)}>
            <span className={`${styles.title}`}>
              {props.tab}
            </span>
              <span className={styles.icon}>
              <Icon type="right" theme="outlined" />
            </span>
          </div>
        </div>
      )
      tabs.push(tab)
    })

    return (
      <div className={`${styles.tabs} flex`}
           style={{marginTop: -24,marginLeft: -16,marginRight: -16,height: "100%",...this.props.style}}>
        <div className={`${styles.tabsContainer}`}>
          {tabs}
        </div>
        <div className={`${styles.content} grow1`}>
          {this.props.children.filter( child => {
            return child.props.id === this.state.activeKey
          })}
        </div>
      </div>
    );
  }
}



export default Tabs;
