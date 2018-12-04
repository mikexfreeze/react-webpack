import { queryProjects } from 'services/endpointApi';
import { queryProjectByToken } from 'services/projectApi';

export default {
  namespace: 'projects',

  state: [

  ],

  effects: {
    *fetch ({payload}, {call, put, select}) {
      const res = yield queryProjects(payload)
      yield put({
        type: 'save',
        payload: res.data
      })
    },
    *fetchProject ({payload}, {call, put, select}) {
      const res = yield queryProjectByToken(payload)
      yield put({
        type: 'save',
        payload: res.data
      })
    },
  },

  reducers: {
    save(state, action) {
      state = action.payload
      return state
    },
  },
}
