import fetch from 'fetch'
import store from 'index'

export async function queryProjects(params) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/projects',
    method: 'get',
    params: {
      tenantId: user.tenantId,
      ...params
    }
  })
}

export function queryProjectByToken(params) {
  return fetch({
    url: `/web/v1/projects/${params.token}@${params.tenantId}`,
    method: 'get',
  })
}

export async function createProject(data) {
  let user = store.getState().user
  return fetch({
    url: '/web/v1/projects',
    method: 'post',
    data: {
      tenantId: user.tenantId,
      ...data,
    }
  })
}

export async function deleteProject(token, tenantId) {
  return fetch({
    url: `/web/v1/projects/${token}@${tenantId}`,
    method: 'delete'
  })
}



export async function updateProject(data) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/projects/${data.token}`,
    method: 'put',
    data: {
      tenantId: user.tenantId,
      ...data,
    }
  })
}

export async function queryProjectEvents(params) {
  return fetch({
    url: `/web/v1/projects/${params.projectToken}/events`,
    method: 'get',
    params: {
      ...params
    }
  })
}

// 获取项目下告警统计
export async function getProjectAlert(params) {
  return fetch({
    url: `/web/v1/projects/${params.tenantId}/${params.token}/alert`,
    method: 'get'
  });
}

// 获取项目下终端状态统计
export async function getProjectEndpointStatus(params) {
  return fetch({
    url: `/web/v1/projects/${params.tenantId}/${params.token}/endpointstatus`,
    method: 'get'
  })
}

// 获取项目下区域列表
export async function queryProjectZones(params) {
  let projectToken = params.projectToken;
  delete params.projectToken;

  return fetch({
    url: `/web/v1/projects/${projectToken}/zones`,
    method: 'get',
    params: {
      ...params
    }
  })
}

export async function deleteProjectZone(token) {
  return fetch({
    url: `/web/v1/zones/${token}`,
    method: 'delete'
  })
}

// 创建区域
export async function createZone(data) {
  return fetch({
    url: `/web/v1/projects/${data.projectToken}/zones`,
    method: 'post',
    data: {
      ...data,
    }
  })
}