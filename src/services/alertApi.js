/* create by Micheal Xiao 2018/11/19 11:42 */
import store from "index";
import fetch from "utils/fetch";

export function queryAlerts(params) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/alerts`,
    method: 'get',
    params:{
      tenantId: user.tenantId,
      ...params
    }
  })
}

export function queryAlertById(id, tenantId) {
  return fetch({
    url: `/web/v1/alerts/${tenantId}/${id}`,
    method: 'get',
  })
}

export function updateAlerts(data) {
  let user = store.getState().user
  return fetch({
    url: `/web/v1/alerts/deal`,
    method: 'put',
    data:{
      tenantId: user.tenantId,
      ...data
    }
  })
}
