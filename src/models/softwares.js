import { log } from 'utils'
import {querySoftware} from "services/softwareApi";

export default {
  namespace: 'softwares',

  state: [],

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield querySoftware(payload)
        .then(res => {
          log.debug("querySoftware api:", res)
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
