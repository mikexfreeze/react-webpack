import fetch from "utils/fetch";

export function querySoftware(params) {
  return fetch({
    url: `/web/v1/software/all`,
    method: 'get',
    params: params
  })
}
