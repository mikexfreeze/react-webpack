import fetch from 'fetch'

export function queryUsers(params) {
  return fetch({
    url: '/web/v1/users',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export function createUsers(data) {
  return fetch({
    url: '/web/v1/users',
    method: 'post',
    data: {
      ...data,
    }
  })
}

export function updateUsers(data) {
  return fetch({
    url: '/web/v1/users/' + data.username,
    method: 'put',
    data: {
      ...data,
    }
  })
}

export function resetUserPwd(username) {
  return fetch({
    url: `/web/v1/users/${username}/reset`,
    method: 'post',
  })
}

export function queryUsersById(username) {
  return fetch({
    url: '/web/v1/users/' + username,
    method: 'get',
  })
}

export function deleteUsersById(username) {
  return fetch({
    url: '/web/v1/users/' + username,
    method: 'delete',
  })
}

export function queryMenu() {
  return fetch({
    url: '/web/v1/menu/user',
    method: 'get',
  })
}

export function queryNavTree(level) {
  return fetch({
    url: '/web/v1/menu/level/' + level,
    method: 'get',
  })
}

export function queryResourceAndOperation(level) {
  return fetch({
    url: '/web/v1/roles/resourceAndOperation/' + level,
    method: 'get',
  })
}
