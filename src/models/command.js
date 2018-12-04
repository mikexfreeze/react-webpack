import { queryCommandByToken } from 'services/commandApi';

export default {
  namespace: 'command',

  state: {
  },

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryCommandByToken(payload.token, payload.tenantId)
        .then(res => {
          return res
        })
      if(res.status === 200){
        yield put({
          type: 'save',
          payload: res.data,
        });
      }
      return res
    }
  },

  reducers: {
    save(state, action) {
      return {...state, ...action.payload}
    },
    edit(state, action) {
      return {...state, ...action.payload}
    }
  },

}
