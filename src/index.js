import dva from 'dva';
import createLoading from 'dva-loading';
import { browserHistory } from 'dva/router';

// ag-grid css
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-fresh.css';

// import './acom/theme/index.less';
// import './acom/theme/theme.less';
// import 'assets/css/animate.css'

import React from "react";
import App from './app'

// 1. Initialize
const app = dva({
  onError: (err, dispatch) => {
    if (err.response) {
      console.log("catch err:", err.response)
    }
    return
  },
  history: browserHistory,
});

// 2. Plugins
app.use(createLoading({
  except: [
    'user/fetchCurrent'
  ]
}));

// 3. Model
app.model(require('./models/global').default);

// 4. Router
app.router(RouterConfig);

// 5. Start
app.start('#app')

function RouterConfig({ history, app }) {
  return (
    <App app={app} history={history} />
  );
}

export default app._store; // eslint-disable-line

