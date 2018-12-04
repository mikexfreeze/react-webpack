import { queryEndpointGroup } from 'services/endpointApi'
import { log } from 'utils'

export default {
  namespace: 'endpointGroup',
  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryEndpointGroup(payload)
      log.info('queryEndpointGroup api;', res.data)
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
