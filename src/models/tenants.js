import { queryAllTenants } from 'services/tenantApi'

export default {
  namespace: 'tenants',
  state: [

  ],

  effects: {
    *fetch (_, {call, put, select}) {
      const res = yield queryAllTenants()
      // console.log('tenants api;', res.data)
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
