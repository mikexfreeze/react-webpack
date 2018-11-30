import axios from 'axios';
import {message} from 'antd';
import {routerRedux} from 'dva/router';
import store from 'index';
import {debounce} from 'lodash'
import { IntlProvider, defineMessages } from 'react-intl';

let intl; let lastLang = 'zh-CN'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000                  // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
  let lang = store.getState().global.lang
  const { dispatch } = store;
  if(intl === undefined || lastLang !== lang){
    lastLang = lang
    intl = new IntlProvider({ locale: lang, messages: getLocale(lang) }, {}).getChildContext().intl;
  }
  dispatch({
    type: 'global/onXHR',
    payload: true,
  })
  // Do something before request is sent
  let token = localStorage.getItem('token')
  if (token) {
      config.headers['Auth'] = token; // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
  }
  if(lang === 'en-US'){
    config.headers['Accept-Language'] = 'en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7'
  }else{
    config.headers['Accept-Language'] = 'zh_CN'
  }
  return config;
}, error => {
  // Do something with request error
  console.log(error); // for debug
  Promise.reject(error);
})

// respone拦截器
service.interceptors.response.use(
  response => {
    const { dispatch } = store;

    dispatch({
      type: 'global/onXHR',
      payload: false,
    })
    return response
  },
  error => {
    const { dispatch } = store;

    dispatch({
      type: 'global/onXHR',
      payload: false,
    })
    // TODO 创建终端 终端ID格式错误，错误格式处理
    console.log("fetch ERR:", error.response)
    try {
      if (error.response.status === 401 ) {
        alert401() // 防止多次显示
        dispatch(routerRedux.push({pathname: '/login'}))
      } else if (error.response.status === 402) {
        alert402()
        dispatch(routerRedux.push({pathname: '/login'}))
      } else if (error.response){
        message.error(error.response.data.message, 3,);
      }
    } catch (err) {
      message.error(intl.formatMessage(msg.errorUnknow));
    }

    return Promise.reject(error);
  }
)

export default service;


const enUS = {
  greeting: 'Hello',
  error401: 'login expird, please login again ：401',
  error402: 'login expird, please login again ：402',
  errorUnknow: 'unknow server error',
}
const zhCN = {
  greeting: '你好',
  error401: '登录过期,请重新登录：401',
  error402: '登录过期,请重新登录：402',
  errorUnknow: '服务器未知错误',
}
export const msg = defineMessages({
  greeting: {
    id: 'greeting',
    defaultMessage: 'Whats up'
  },
  error401: {
    id: 'error401',
    defaultMessage: '登录过期,请重新登录：401'
  },
  error402: {
    id: 'error402',
    defaultMessage: '登录过期,请重新登录：402'
  },
  errorUnknow: {
    id: 'errorUnknow',
    defaultMessage: '服务器未知错误'
  },
})

function getLocale(lang) {
  let result = {};
  switch (lang) {
    case 'zh-CN':
      result = zhCN;
      break;
    case 'en-US':
      result = enUS;
      break;
    default:
      result = zhCN;
  }
  return result
}


const alert401 = debounce(alertExpired401, 5000, {leading: true, trailing: false})

function alertExpired401() {
  message.error(intl.formatMessage(msg.error401), 3,)
}

const alert402 = debounce(alertExpired402, 5000, {leading: true, trailing: false})

function alertExpired402() {
  message.error(intl.formatMessage(msg.error402), 3,)
}

