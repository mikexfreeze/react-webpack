import * as log from 'loglevel';

/*
* 使用方法(建议只使用debug,info,warn,error级别): 
*   Log.trace(), Log.debug(), Log.info(), Log.warn(), Log.error()
* 文档: https://github.com/pimterry/loglevel
*/
const level = process.env.NODE_ENV === 'development' ? 'debug' : 'error';

// 设定默认log级别，根据运行环境
log.setLevel(level);

export const Log = log;

export default log
