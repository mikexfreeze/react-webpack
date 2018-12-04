import { queryRolesAll } from 'services/roleApi'

export default {
  namespace: 'roles',

  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryRolesAll(payload)
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
