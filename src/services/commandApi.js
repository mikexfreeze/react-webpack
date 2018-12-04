import fetch from 'fetch'

export async function deleteCommand(token,tenantId) {
  return fetch({
    url: `/web/v1/commands/${token}@${tenantId}`,
    method: 'delete'
  })
}

export async function queryCommandByToken(token,tenantId) {
  return fetch({
    url: `/web/v1/commands/${token}@${tenantId}`,
    method: 'get',
  })
}

export function queryCommands(params) {
  return fetch({
    url: `/web/v1/specifications/${params.token}/commands/all`,
    method: 'get',
    params: {
      ...params
    }
  })
}

export async function updateCommand(data) {
  return fetch({
    url: `/web/v1/commands/${data.token}`,
    method: 'put',
    data: {
      ...data
    }
  })
}

export function sendMsg(data) {
  return fetch({
    url: "/web/v1/sms/bulk",
    method: 'post',
    data: {
      ...data
    }
  })
}
