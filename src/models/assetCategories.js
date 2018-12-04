import { queryAssetCategories } from 'services/endpointApi'
import { log } from 'utils'

export default {
  namespace: 'assetCategories',
  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryAssetCategories(payload)
      log.info('queryAssetCategories api;', res.data)
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
