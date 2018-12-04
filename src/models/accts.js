import { queryAcct } from 'services/endpointApi'
import { log } from 'utils'

export default {
  namespace: 'accts',
  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryAcct(payload)
      log.info('accts api;', res.data)
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
