/**
 * 转换 getRows page params to queryFunc 所需 pageParams{page, size}
 * @param params
 */

export function parsePage (params) {
  let pageParams = {}

  if(params.startRow === 0){
    pageParams.size = params.endRow
    pageParams.page = 0
  } else {
    pageParams.size = params.endRow - params.startRow
    pageParams.page = params.startRow/pageParams.size
  }

  return pageParams
}

export default parsePage
