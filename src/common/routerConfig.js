import {FormattedMessage} from "react-intl";
import Fm from 'acom/Intl/FormattedMessage'

export const login = {name: '登录', path: '/login', component: () => import('../routes/User/Login'), models: ['login', 'user']}

export const layout = {name: 'basicLayout', path: '/', component: () => import('../layouts/BasicLayout'),}

const basicRoute = [
  {
    name: "首页",
    path: '/dashboard', icon: 'icon-shouye', exact: true, component: () => import('../routes/Dashboard/Dashboard'), models: ['events']},

]

export default basicRoute
