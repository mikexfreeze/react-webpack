import {routerRedux} from 'dva/router';
import {message} from 'antd';
import axios from 'axios'
import store from 'store2'
import {queryMenu} from 'services/userApi'
import { reloadAuthorized } from 'utils/Authorized';
import reduxStore from 'index'

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    * login({payload}, {call, put}) {
      let res = yield axios.post( process.env.BASE_API + '/auth?code=' + payload.verifCode, {
        username: payload.userName,
        password: payload.password,
      }, {withCredentials: true}).catch(e => {
        return {e}
      })

      if (res.status === 200) {
        console.log('login api:', res)
        localStorage.setItem('token', res.data.token)
        const resMenu = yield queryMenu()
        // console.log("resMenu", resMenu)
        if(resMenu.status !== 200){
          message.error(JSON.parse(resMenu.e.request.response).message);
          return
        }
        let menuAuth = iterAuth(resMenu.data)
        res.data.permissions = res.data.permissions.concat(menuAuth)
        // console.log("menuAuth", menuAuth)
        store.set('authority', res.data.permissions)
        store.set('user', res.data)
        let lang = reduxStore.getState().global.lang
        if(lang === "zh-CN"){
          message.success('登录成功');
        }else if(lang === "en-US"){
          message.success('login success');
        }
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: true,
          },
        });
        yield put(routerRedux.push({pathname: '/dashboard'}))
      } else {
        console.log(res.e.request)
        // message.error('登录失败');
        message.error(JSON.parse(res.e.request.response).message);
      }
    },
    *logout(_, { put }) {
      localStorage.setItem('token', '')
      store.remove('authority')
      store.remove('user')
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
      yield put(
        routerRedux.push({
          pathname: '/login',
          // search: stringify({
          //   redirect: window.location.href,
          // }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, {payload}) {
      reloadAuthorized()
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};

function iterAuth (authArray) {
  return [].concat(...authArray.map((v) => {
    if(v.nodes.length === 0){
      return v.code
    }else{
      return [].concat(v.code, iterAuth(v.nodes))
    }
  }))
}
