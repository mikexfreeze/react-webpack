import { 
  getQuotaData, 
  getAlertData, 
  getStorageData, 
  getTenantsMsgData, 
  getTenantsStorageData
} from 'services/eventApi';
import { getJoinedEndpoints, getRealtimeEndpoints, getTenantsEndpointsData } from 'services/endpointApi';
import { getTenantsApiInvokedData } from 'services/tenantApi';
import { getProjectAlert, getProjectEndpointStatus } from 'services/projectApi';
import log from 'utils/log';

export default {
  namespace: 'events',

  state: {
    quota: null,
    alert: null,
    storage: null,
    joinedEndpoints: null,
    realtimeEndpoints: null,
    sysMsgData: null,
    sysStorageData: null,
    projectQuota: null,
    projectAlert: null,
    projectEndpoint: null
  },
  
  effects: {
    *fetch({ payload }, { call, put }) {
      log.debug('model events fetch: ', payload);
      const quotaResponse = yield call(getQuotaData, payload.quotaParam);
      const alertResponse = yield call(getAlertData, payload.alertParam);
      const storageResponse = yield call(getStorageData, payload.storageParam);
      const joinedEndpointResponse = yield call(getJoinedEndpoints, payload.joinedEndpointParam);
      const realtimeEndpointResponse = yield call(getRealtimeEndpoints, payload.realtimeEndpointParam);
      yield put({
        type: 'save',
        payload: { 
          quota: quotaResponse,
          alert: alertResponse,
          storage: storageResponse,
          joinedEndpoints: joinedEndpointResponse,
          realtimeEndpoints: realtimeEndpointResponse
        },
      });
    },

    *fetchSys({ payload }, { call, put }) {
      const msgResponse = yield call(getTenantsMsgData);
      const storageResponse = yield call(getTenantsStorageData);
      const apiInvokedResponse = yield call(getTenantsApiInvokedData);
      const endpointCountResponse = yield call(getTenantsEndpointsData);
      yield put({
        type: 'save',
        payload: {
          sysMsg: msgResponse,
          sysStorage: storageResponse,
          sysApi: apiInvokedResponse,
          sysEndpoint: endpointCountResponse
        }
      });
    },

    *fetchProject({ payload }, { call, put }) {
      const quotaResponse = yield call(getQuotaData, payload.quotaParam);
      const alertResponse = yield call(getProjectAlert, payload.alertParam);
      const endpointResponse = yield call(getProjectEndpointStatus, payload.endpointParam);
      yield put({
        type: 'save',
        payload: {
          projectQuota: quotaResponse,
          projectAlert: alertResponse,
          projectEndpoint: endpointResponse
        }
      })
    }
  },

  reducers: {
    save(state, action) {
      state = { 
        ...action.payload
      };
      return state;
    }
  }
}