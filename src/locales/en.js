import appLocaleData from 'react-intl/locale-data/en';
// 引入组件的多语言
import msg1 from './en-US';
import msg2 from './en.json'
import flatten from "flat";
import assgin from "lodash/assign";

let messages = assgin(msg1, msg2)

window.appLocale = {

  messages: flatten(messages),
  // locale
  locale: 'en-US',

  // react-intl locale-data
  data: appLocaleData,

  // 自定义 formates
  formats: {
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
      currency: 'USD',
    },
  },
};

export default window.appLocale;
