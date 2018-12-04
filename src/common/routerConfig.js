import {FormattedMessage} from "react-intl";
import Fm from 'acom/Intl/FormattedMessage'

export const login = {name: '登录', path: '/login', component: () => import(/* webpackChunkName: "login" */ '../routes/User/Login'), models: ['login', 'user']}

export const layout = {name: 'basicLayout', path: '/', component: () => import(/* webpackChunkName: "layout" */ '../layouts/BasicLayout'),}

const basicRoute = []

export default basicRoute
