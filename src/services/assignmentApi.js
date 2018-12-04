import fetch from 'fetch'

export function queryAssignmentsByEP(params) {
  return fetch({
    url: `/web/v1/endpoints/${params.endpointId}/assignments`,
    method: 'get',
    params:{
      ...params
    }
  })
}

export function queryAssignmentsByAsset(params) {
  return fetch({
    url: `/web/v1/${params.assetId}/assignments`,
    method: 'get',
    params:{
      ...params
    }
  })
}
