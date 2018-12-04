import fetch from 'fetch'
import store from 'index'

export async function queryEndPointCategories(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/hardwares',
    method: 'get',
    params: {
      ...params,
      tenantId: user.tenantId
    }
  })
}

export async function createEndPointCategory(data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/hardwares',
    method: 'post',
    data: {
      ...data,
      tenantId: user.tenantId
    }
  })
}

export async function deleteEndPointCategory(id) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/hardwares/' + id + '@' + user.tenantId,
    method: 'delete'
  })
}

export async function queryEndPointCategoryById(id, tenantId) {
  return fetch({
    url: `/web/v1/hardwares/${id}@${tenantId}`,
    method: 'get',
  })
}

export async function updateEndpointCategory(data) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/hardwares/${data.id}@${user.tenantId}`,
    method: 'put',
    data: {
      ...data,
      tenantId: user.tenantId
    }
  })
}

export async function queryEndPointAllCategories(tenantId) {
  return fetch({
    url: `/web/v1/hardwares/all?tenantId=${tenantId}`,
    method: 'get'
  })
}