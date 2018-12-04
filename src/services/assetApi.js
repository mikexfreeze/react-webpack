import fetch from 'fetch'
import store from "index";

export function queryAssets(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assets',
    method: 'get',
    params:{
      tenantId: user.tenantId,
      ...params
    }
  })
}

export function createAsset (data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assets',
    method: 'post',
    data:{
      tenantId: user.tenantId,
      ...data
    }
  })
}

export function queryAssetById(params) {
  return fetch({
    url: `/web/v1/assets/${params.id}@${params.tenantId}`,
    method: 'get',
    params:{
      ...params
    }
  })
}

export function editAsset (data) {
  return fetch({
    url: `/web/v1/assets/${data.id}@${data.tenantId}`,
    method: 'put',
    data:{
      ...data
    }
  })
}

export function deleteAsset (id, tenantId) {
  return fetch({
    url: `/web/v1/assets/${id}@${tenantId}`,
    method: 'delete',
  })
}

export function queryAstEvents(params) {
  return fetch({
    url: `/web/v1/assets/${params.id}@${params.tenantId}/events`,
    method: 'get',
    params:{
      ...params
    }
  })
}

export function queryAssetCategories(params) {
  return fetch({
    url: '/web/v1/assetCategories',
    method: 'get',
    params:{
      ...params
    }
  })
}

export function queryAssetCatgryById(params) {
  return fetch({
    url: `/web/v1/assetCategories/${params.id}@${params.tenantId}`,
    method: 'get',
  })
}


export function createAssetCategories (data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assetCategories',
    method: 'post',
    data:{
      tenantId: user.tenantId,
      ...data
    }
  })
}

export function editAssetCategorie (data) {
  return fetch({
    url: `/web/v1/assetCategories/${data.id}@${data.tenantId}`,
    method: 'put',
    data:{
      ...data
    }
  })
}

export function deleteAssetCategorie (id, tenantId) {
  return fetch({
    url: `/web/v1/assetCategories/${id}@${tenantId}`,
    method: 'delete',
  })
}

export function queryAllAssettCatgryTpl(params) {
  return fetch({
    url: '/web/v1/assetCategoriesTpl/all',
    method: 'get',
    params:{
      ...params
    }
  })
}

export function queryAssetCatgryTpls(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assetCategoriesTpls',
    method: 'get',
    params:{
      tenantId: user.tenantId,
      ...params
    }
  })
}

export function queryAssetCatgryTpl(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assetCategoriesTpl',
    method: 'get',
    params:{
      tenantId: user.tenantId,
      ...params
    }
  })
}

export function queryAstCatgryTplById(tenantId) {
  let user = store.getState().user
  let id = user.tenantId
  if(tenantId){
    id = tenantId
  }
  return fetch({
    url: `/web/v1/assetCategoriesTpl/${id}/all`,
    method: 'get',
  })
}

export function createAssetCatgryTpl (data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/assetCategoriesTpl',
    method: 'post',
    data:{
      tenantId: user.tenantId,
      ...data
    }
  })
}

export function editAssetCatgryTpl (data) {
  return fetch({
    url: '/web/v1/assetCategoriesTpl',
    method: 'put',
    data:{
      ...data
    }
  })
}

export function deleteAssetCatgryTpl (id, tenantId) {
  return fetch({
    url: `/web/v1/assetCategoriesTpl/${id}@${tenantId}`,
    method: 'delete',
  })
}

export function queryAssetEPStatus(params) {
  return fetch({
    url: `/web/v1/assets/${params.tenantId}/${params.id}/endpointstatus`,
    method: 'get',
  })
}

export function queryAssetAlert(params) {
  return fetch({
    url: `/web/v1/${params.tenantId}/${params.id}/alert`,
    method: 'get',
  })
}
