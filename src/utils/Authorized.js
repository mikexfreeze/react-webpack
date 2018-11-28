import RenderAuthorized from '../acom/Authorized';
import { getAuthority } from './authority';

// getAutority 从 localstorage 获取当前用户权限
let Authorized = RenderAuthorized(getAuthority()); // eslint-disable-line

// Reload the rights component
const reloadAuthorized = () => {
  Authorized = RenderAuthorized(getAuthority());
};

let checkPermisson = Authorized.check

export { reloadAuthorized, checkPermisson };
export default Authorized;
