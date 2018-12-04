/* create by Micheal Xiao 2018/11/26 14:35 */
import {queryEndPointsAll} from "services/endpointApi";

export default {
  namespace: 'endpoints',

  state: [],

  effects: {
    *fetch ({payload}, {call, put}) {
      const res = yield queryEndPointsAll(payload)
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
