import fetch from 'fetch'
import store from 'index'

export function queryEndPoints(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/endpoints',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params,
    }
  })
}

export function queryEndPointsAll(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/endpoints/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      returnCount: 100,
      ...params,
    }
  })
}

export async function queryEndPointById(id, tenantId) {
  return fetch({
    url: `/web/v1/endpoints/${id}@${tenantId}`,
    method: 'get',
  })
}

export function queryEndPointsUnassign(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/endpoints/unassign',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params,
    }
  })
}


export async function createEndPoints(data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/endpoints',
    method: 'post',
    data: {
      tenantId: user.tenantId,
      ...data,
    }
  })
}

export async function updateEndPoint(data) {
  return fetch({
    url: `/web/v1/endpoints/${data.id}@${data.tenantId}`,
    method: 'put',
    data: {
      ...data,
    }
  })
}

export async function deleteEndPoint(id, tenantId) {
  return fetch({
    url: `/web/v1/endpoints/${id}@${tenantId}`,
    method: 'delete',
  })
}

export function deleteEndPoints(endpointIdList) {
  return fetch({
    url: '/web/v1/endpoints/batchDelete',
    method: 'delete',
    data: {endpoints: endpointIdList}
  })
}

export function batchUpdateEndPoint(data) {
  return fetch({
    url: `/web/v1/endpoints/batchUpdate`,
    method: 'put',
    data: {
      ...data,
    }
  })
}

export function batchReleaseEndPoint(tenantId ,assignList) {
  return fetch({
    url: `/web/v1/assignments/${tenantId}/batchrelease`,
    method: 'post',
    data: assignList
  })
}

export function batchEditEPAsset(data) {
  return fetch({
    url: "/web/v1/assignments/batch",
    method: 'post',
    data: {
      ...data,
      type: "Associated",
    }
  })
}

export function batchEditEPGroup(data) {
  return fetch({
    url: "/web/v1/endpointgroup/addEndpoint",
    method: 'post',
    data: {
      ...data,
    }
  })
}

export function downEnpointTemp() {
  return fetch({
    url: '/web/v1/downloads/endpointTemplate',
    method: 'get',
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template.xlsx');
    document.body.appendChild(link);
    link.click();
  })
}

export async function querySpecifications(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/specifications/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params
    }
  })
}

export async function queryAcct(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/acct/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params
    }
  })
}


export function queryProjects(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/projects/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params,
    }
  })
}

export function queryAssetCategories(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assetCategories/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params,
    }
  })
}

export function queryAssets(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assets/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params,
    }
  })
}

export function queryEndpointGroup(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/endpointgroup/all',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      type: "STATIC",
      ...params,
    }
  })
}

export function queryEndpointEvents(params) {
  return fetch({
    url: `/web/v1/endpoints/${params.endpointId}@${params.tenantId}/events`,
    method: 'get',
    params: {
      ...params,
    }
  })
}

export function queryEndpointHistory(params) {
  return fetch({
    url: '/web/v1/endpoints/history',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export function analysisDatastream(data) {
  return fetch({
    url: '/web/v1/analysis/datastream',
    method: 'post',
    data: data
  })
}

export function invocations(data) {
  return fetch({
    url: `/web/v1/endpoints/${data.endpointId}@${data.tenantId}/invocations`,
    method: 'post',
    data: data
  })
}

export function batchInvocations(data) {
  return fetch({
    url: `/web/v1/endpoints/batch/invocations`,
    method: 'post',
    data: data
  })
}


export function batchUpdate(data) {
  return fetch({
    url: `/web/v1/ota/batchPush`,
    method: 'post',
    data: data
  })
}

export function batchSoftUpdate(data) {
  return fetch({
    url: `/web/v1/software/batchPush`,
    method: 'post',
    data: data
  })
}

export async function getJoinedEndpoints(params) {
  return fetch({
    url: `/web/v1/endpoints/${params.tenantId}/${params.days}`,
    method: 'get'
  });
}

export async function getRealtimeEndpoints(params) {
  return fetch({
    url: `/web/v1/endpoints/statushis/${params.tenantId}/${params.hours}`,
    method: 'get'
  });
}

// 系统级用户首页-获取各租户终端数量统计数据
export async function getTenantsEndpointsData() {
  return fetch({
    url: '/web/v1/endpoints/status/aggregate',
    method: 'get'
  });
}
