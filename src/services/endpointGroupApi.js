/* create by Micheal Xiao 2018/11/23 11:03 */
import fetch from "utils/fetch";

export function queryEPGroups(params) {
  return fetch({
    url: `/web/v1/endpointgroup`,
    method: 'get',
    params:{
      ...params
    }
  })
}

export function queryEPGroupById(id, tenantId) {
  return fetch({
    url: `/web/v1/endpointgroup/${id}@${tenantId}`,
    method: 'get',
  })
}

export function queryEPByEPG(params) {
  return fetch({
    url: `/web/v1/endpointgroup/${params.id}@${params.tenantId}/endpoints/pageable`,
    method: 'get',
    params:{
      ...params
    }
  })
}

export function createEPGroup(data) {
  return fetch({
    url: `/web/v1/endpointgroup`,
    method: 'post',
    data:{
      ...data
    }
  })
}

export function addEPToEPGroup(data) {
  return fetch({
    url: `/web/v1/endpointgroup/addEndpoint`,
    method: 'post',
    data:{
      ...data
    }
  })
}

export function deleteEPFromEPGroup(data) {
  return fetch({
    url: `/web/v1/endpointgroup/deleteEndpoint`,
    method: 'post',
    data:{
      ...data
    }
  })
}

export function updateEPGroup(data) {
  return fetch({
    url: `/web/v1/endpointgroup/${data.id}@${data.tenantId}`,
    method: 'put',
    data:{
      ...data
    }
  })
}

export function deleteEPGroup(data) {
  return fetch({
    url: `/web/v1/endpointgroup/${data.id}@${data.tenantId}`,
    method: 'delete',
  })
}
