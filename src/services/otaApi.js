import fetch from "utils/fetch";

export function queryOTA(params) {
  return fetch({
    url: `/web/v1/ota/all`,
    method: 'get',
    params: params
  })
}
