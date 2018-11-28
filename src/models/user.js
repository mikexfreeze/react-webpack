import store from "store2"
import {routerRedux} from 'dva/router';

export default {
  namespace: 'user',

  state: {
    level: 0,
    permissions: [],
    roles: [],
    tenantId: '',
    token: '',
    username: '',
  },

  effects: {

    *fetchCurrent(_, { call, put }) {
      // let loginInfo = JSON.parse(localStorage.getItem('loginInfo'))
      // const res = yield axios.post( process.env.BASE_API + '/auth', {
      //   username: loginInfo.username,
      //   password: loginInfo.password,
      // }).then(res => {
      //   console.log('get currentUser:', res.data)
      //   return res.data
      // }).catch(e => {
      //   return {}
      // })
      const user = store.get('user')
      if(!user){
        yield put(routerRedux.push({pathname: '/login'}))
      }
      console.log("current user", user)
      yield put({
        type: 'save',
        payload: user,
      });

    },
  },

  reducers: {
    /**
     * @param action.payload 为 user 对象
     */
    save(state, action) {
      return {...state, ...action.payload}
    },
  },
};
