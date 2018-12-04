import { querySpecifications } from 'services/endpointApi'

export default {
  namespace: 'specifications',

  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put}) {
      const res = yield querySpecifications(payload)
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
