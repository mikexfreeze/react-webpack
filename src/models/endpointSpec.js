import { queryEndPointSpecByToken } from 'services/endpointSpecApi';

export default {
  namespace: 'endpointSpec',

  state: {
    name: '',
    containerPolicy: '',
    token: '',
    hardwareName: '',
    createdBy: '',
    createdTime: '',
    updateTime: '',
    metaData: "{}"
  },

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryEndPointSpecByToken(payload.token, payload.tenantId)
        .then(res => {
          return res
        })
      if(res.status === 200){
        yield put({
          type: 'save',
          payload: res.data,
        });
      }
      return res
    }
  },

  reducers: {
    save(state, action) {
      return {...state, ...action.payload}
    },
    edit(state, action) {
      return {...state, ...action.payload}
    }
  },

}
