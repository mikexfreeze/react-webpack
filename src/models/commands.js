import { queryCommands } from 'services/commandApi';
// import { log } from 'utils'

export default {
  namespace: 'commands',

  state: [],

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryCommands(payload)
        .then(res => {
          // log.debug("commands list api:", res)
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
      state = action.payload
      return state
    },
  },

}
