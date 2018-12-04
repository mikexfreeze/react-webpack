import { queryEndPointCategoryById, queryEndPointAllCategories } from 'services/endpointCategoryApi'

export default {
  namespace: 'endpointCategory',

  state: {
    id: '',
    sku: '',
    name: '',
    description: '',
    properties: "{}",
    categories: []
  },

  effects: {
    *fetch ({payload}, {call, put}){
      let res
      res = yield queryEndPointCategoryById(payload.id, payload.tenantId)
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
    },
    *fetchAll ({payload}, {call, put}) {
      let res
      res = yield queryEndPointAllCategories(payload.tenantId)
        .then(res => {
          return res
        })
      if(res.status === 200){
        yield put({
          type: 'all',
          payload: res.data,
        });
      }
      return res
    },
  },

  reducers: {
    save(state, action) {
      return {...state, ...action.payload}
    },
    all(state, action) {
      return {
        ...state,
        categories: action.payload
      }
    },
    edit(state, action) {
      return {...state, ...action.payload}
    },
    reset(state, {payload}) {
      return {
        ...state,
        categories: []
      }
    }
  },

}
