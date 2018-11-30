import React, { createElement } from 'react';
import { Spin } from 'antd';
import Loadable from 'react-loadable';
import {cloneDeep} from "lodash";
import basicRoute from "./routerConfig";

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

let routerDataCache;
// wrapper of dynamic
export const dynamicWrapper = (app, models = [], component) => {
  // register models
  models.forEach(model => {
    if (modelNotExisted(app, model)) {
      if(require(`../models/${model}`).default === undefined){
        console.log("can't find model:", `../models/${model}`)
      }else{
        app.model(require(`../models/${model}`).default);
      }
      // eslint-disable-next-line
    }
  });

  // transformed by babel-plugin-dynamic-import-node-sync
  /* 此处接收到的 component 已经经过babel的编译，只要使用 箭头import函数就已经包含 '.then(' 故下面的区块处理非异步加载的情况 */
  if (component.toString().indexOf('.then(') < 0) {
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterMap(app, cloneDeep(basicRoute));
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }

  return Loadable({
    loader: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterMap(app, cloneDeep(basicRoute));
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
    loading: () => {
      return (
        <div className="global-spin">
          <Spin size="large" />
        </div>
      )
    },
  });

};

export const getRouter = (app, router) => {
  return router = {
    ...router,
    component: dynamicWrapper(app, router.models, router.component)
  }
}

/**
 * 输入routerConfig 配置获取 Router 组合实例
 * @param app
 * @param routerArray
 * @returns {*[]}
 */
export const getRouterMap = (app, routerArray, prouter) => {
  return [].concat(...routerArray.map(router => {
    if(prouter){
      router.path = prouter.path + router.path
    }
    if(router.children === undefined){
      return getRouter(app, router)
    }else{
      if(router.component === undefined){
        return getRouterMap(app, router.children, router)
      }else{
        return [].concat(getRouter(app, router), getRouterMap(app, router.children, router))
      }
    }
  }))
}


export const getMenuRouter = (router, ppath) => {
  return router.map(route => {
    if(ppath !== undefined){
      route.path = ppath + route.path
    }
    if(route.children !== undefined){
      route.children = getMenuRouter(route.children, route.path)
    }

    return route
  })
}
