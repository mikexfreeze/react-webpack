/* create by Micheal Xiao 2018/11/22 15:20 */
import dva from 'dva';
// import './index.css';

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#app');