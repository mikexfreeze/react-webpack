import appLocaleData from 'react-intl/locale-data/zh';
// 引入组件的多语言
import msg1 from './zh-Hans';
import flatten from 'flat'
import msg2 from './cn.json'
import assgin from 'lodash/assign'


let messages = assgin(msg1, msg2)

window.appLocale = {

  messages: flatten(messages),

  // locale
  locale: 'zh-Hans',

  // react-intl locale-data
  data: appLocaleData,

  // 自定义 formates
  formats: {
    // 日期、时间
    date: {
      normal: {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
    },
    // 货币
    money: {
      currency: 'CNY',
    },
  },
};

export default window.appLocale;
