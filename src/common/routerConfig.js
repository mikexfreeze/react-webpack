import {FormattedMessage} from "react-intl";
import Fm from 'acom/Intl/FormattedMessage'

export const login = {name: '登录', path: '/login', component: () => import('../routes/User/Login'), models: ['login', 'user']}

export const layout = {name: 'basicLayout', path: '/', component: () => import('../layouts/BasicLayout'),}

const basicRoute = []

export default basicRoute
