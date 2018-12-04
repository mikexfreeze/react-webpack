import fetch from 'fetch'

export function queryRoles(params) {
  return fetch({
    url: '/web/v1/roles',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export function queryRolesAll(params) {
  return fetch({
    url: '/web/v1/roles/all',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export function queryRoleById(code) {
  return fetch({
    url: '/web/v1/roles/' + code,
    method: 'get',
  })
}

export function deleteRoleById(code) {
  return fetch({
    url: '/web/v1/roles/' + code,
    method: 'delete',
  })
}

export function createRole(data) {
  let initData = {
    code: null,
    description:null,
    level:"1",
    menuCodes:[],
    metaData:{},
    name:"test4",
    permissionTokens:[],
    tenantId:null,
  }
  return fetch({
    url: '/web/v1/roles',
    method: 'post',
    data: {
      ...initData,
      ...data,
    }
  })
}

export function updateRole(data) {
  let initData = {
    code: null,
    description:null,
    menuCodes:[],
    metaData:{},
    name:"test4",
    permissionTokens:[],
    tenantId:null,
  }
  let postData = {
    ...initData,
    ...data,
  }

  delete postData.level
  return fetch({
    url: '/web/v1/roles/' + data.code,
    method: 'put',
    data: postData
  })
}
