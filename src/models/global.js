// import { start } from 'index'

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    lang: localStorage.getItem('lang') || 'zh-CN',
    onXHR: false
  },

  effects: {},

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    changeLang(state, {payload}){
      localStorage.setItem('lang', payload)
      return {
        ...state,
        lang: payload,
      }
    },
    onXHR(state, {payload}){
      return {
        ...state,
        onXHR: payload,
      }
    },
  },

  subscriptions: {
    // setup({ history }) {
    //   // Subscribe history(url) change, trigger `load` action if pathname is `/`
    //   return history.listen(({ pathname, search }) => {
    //     if (typeof window.ga !== 'undefined') {
    //       window.ga('send', 'pageview', pathname + search);
    //     }
    //   });
    // },
  },
};
