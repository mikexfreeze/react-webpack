import { log } from 'utils'
import {queryAstCatgryTplById} from "services/assetApi";

export default {
  namespace: 'assetCatgryTpls',
  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryAstCatgryTplById(payload.id)
      log.info('queryAstCatgryTplById api;', res.data)
      yield put({
        type: 'save',
        payload: res.data
      })
    }
  },

  reducers: {
    save(state, action) {
      state = action.payload
      return state
    },
  },
}
