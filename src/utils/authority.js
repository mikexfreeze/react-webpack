// use localStorage to store the authority info, which might be sent from server in actual project.
import store from 'store2'

export function getAuthority() {
  // console.log("get authority", store.get('authority'))
  return store.get('authority') || ['admin', 'user'];
}

export function setAuthority(authority) {
  return localStorage.setItem('authority', authority);
}
