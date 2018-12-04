import { queryAssets } from 'services/endpointApi'
import { log } from 'utils'

export default {
  namespace: 'assets',
  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryAssets(payload)
      log.info('queryAssets api;', res.data)
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
