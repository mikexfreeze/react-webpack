import { queryNavTree } from 'services/userApi'

export default {
  namespace: 'navTree',

  state: {
    tree: {},
  },

  effects: {
    *fetch ({payload}, {call, put}){
      const res = yield queryNavTree(payload)
        .then(res => {
          console.log("获取nav tree:", res)
          return res
        })
      if(res.status === 200){
        yield put({
          type: 'save',
          payload: res.data,
        });
      }

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
