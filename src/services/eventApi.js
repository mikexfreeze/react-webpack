import fetch from 'fetch'

// 租户级和项目级-获取用量统计数据
export async function getQuotaData(params) {
  return fetch({
    url: '/web/v1/events/groupEvent',
    method: 'get',
    params: {
      ...params
    }
  });
}

// 租户级
export async function getAlertData(params) {
  return fetch({
    url: `/web/v1/events/${params.tenantId}/${params.days}`,
    method: 'get',
  });
}

// 租户级
export async function getStorageData(params) {
  return fetch({
    url: '/web/v1/events/countEvent',
    method: 'get',
    params: {
      ...params
    }
  });
}

// 系统级用户首页-获取各租户下的消息统计数据
export async function getTenantsMsgData() {
  return fetch({
    url: '/web/v1/events/message',
    method: 'get'
  })
}

// 系统级用户首页-获取各租户下的存储用量统计数据
export async function getTenantsStorageData() {
  return fetch({
    url: '/web/v1/events/storage',
    method: 'get'
  })
}