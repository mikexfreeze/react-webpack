import fetch from 'fetch'
import store from 'index'

export async function queryEndPointSpecs(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/specifications',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params
    }
  })
}

export async function createEndPointSpec(data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/specifications',
    method: 'post',
    data: {
      ...data,
      tenantId: user.tenantId
    }
  })
}

export async function deleteEndPointSpec(token, tenantId) {
  return fetch({
    url: `/web/v1/specifications/${token}@${tenantId}`,
    method: 'delete'
  })
}

export async function queryEndPointSpecByToken(token, tenantId) {
  return fetch({
    url: `/web/v1/specifications/${token}@${tenantId}`,
    method: 'get',
  })
}

export async function updateEndpointSpec(data) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/specifications/${data.token}`,
    method: 'put',
    data: {
      ...data,
      tenantId: user.tenantId
    }
  })
}

export async function queryEndPointSpecAll(tenantId) {
  return fetch({
    url: `/web/v1/specifications/${tenantId}`,
    method: 'get',
  })
}

export async function queryEndPointSpecCommands(params) {
  return fetch({
    url: `/web/v1/specifications/${params.token}/commands`,
    method: 'get',
    params: {
      ...params
    }
  })
}

export async function createEndPointSpecCommand(data) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/specifications/${data.token}/commands`,
    method: 'post',
    data: {
      ...data,
      tenantId: user.tenantId
    }
  })
}

export async function queryEndPointSpecAllCommandsByToken(token, tenantId) {
  return fetch({
    url: `/web/v1/specifications/${token}/commands/all?tenantId=${tenantId}`,
    method: 'get',
  })
}