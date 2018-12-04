import { queryOTA } from 'services/otaApi';
import { log } from 'utils'

export default {
  namespace: 'otas',

  state: [],

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryOTA(payload)
        .then(res => {
          log.debug("queryOTA api:", res)
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
