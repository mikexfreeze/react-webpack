import fetch from "utils/fetch";

export function queryTenants(params) {
  return fetch({
    url: '/web/v1/tenants',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export function queryAllTenants() {
  return fetch({
    url: '/web/v1/tenants/all',
    method: 'get',
  })
}

export function queryTenantById(id) {
  return fetch({
    url: '/web/v1/tenants/' + id,
    method: 'get',
  })
}

export function createTenant(data) {
  return fetch({
    url: '/web/v1/tenants',
    method: 'post',
    data: {
      ...data,
    }
  })
}

export function updateTenant(data) {
  return fetch({
    url: '/web/v1/tenants/' + data.id,
    method: 'put',
    data: {
      ...data,
    }
  })
}

export function deleteTenant(id) {
  return fetch({
    url: '/web/v1/tenants/' + id,
    method: 'delete',
  })
}

// 系统级用户首页-获取各租户API调用统计数据
export async function getTenantsApiInvokedData() {
  return fetch({
    url: '/web/v1/tenants/apicount',
    method: 'get',
  })
}
