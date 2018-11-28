function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function iterMenuCode(menu) {
  return [].concat(...menu.map(node => {
    if(node.nodes.length === 0){
      return node.code
    }else{
      return [].concat(node.code, iterMenuCode(node.nodes))
    }
  }))
}

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 *
 * @param key   需要查找的 node key
 * @param tree  tree data
 * @param path  父级路径数组
 * @returns     path key 数组
 */
export function findNodeParentPath (key, tree, path = []) {
  for (let node of tree) {
    let code = node.code
    let curPath = path.concat(code)
    if(code === key){
      return curPath
    }else{
      let res = findNodeParentPath(key, node.nodes, curPath)
      if (res && res[res.length - 1] === key){
        return res
      }
    }
  }
}

export function filterTreeUnchecked(keys, tree) {
  let reKeys = [...keys]
  for (let key of keys.values()) {
    let node = findNode(key, tree)
    let res = hasChildNodeAllChecked(node, keys)
    if(!res){
      reKeys = reKeys.filter(k => k !== key)
    }
  }
  return reKeys
}

export function findNode(key, tree) {
  for (let node of tree) {
    if(key === node.code){
      return node
    } else{
      let res = findNode(key, node.nodes)
      if(res){
        return res
      }
    }
  }
}

export function hasChildNodeAllChecked(node, keys) {
  for (let v of node.nodes) {
    if(keys.indexOf(v.code) === -1){
      return false
    } else{
      if(!hasChildNodeAllChecked(v, keys)){
        return false
      }
    }
  }
  return true
}

export function fillNodeParentKeys(keys, tree) {
  for (let key of keys) {
    let pathKeys = findNodeParentPath(key, tree)
    for (let pathKey of pathKeys) {
      if(keys.indexOf(pathKey) === -1){
        keys.push(pathKey)
      }
    }
  }
  return keys
}


