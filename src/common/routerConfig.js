import {FormattedMessage} from "react-intl";
import Fm from 'acom/Intl/FormattedMessage'

export const login = {name: '登录', path: '/login', component: () => import(/* webpackChunkName: "Login" */'../routes/User/Login'), models: ['login', 'user']}

export const layout = {name: 'basicLayout', path: '/', component: () => import(/* webpackChunkName: "BasicLayout" */'../layouts/BasicLayout'),}

const basicRoute = [
  {
    name: "首页",
    path: '/dashboard', icon: 'icon-shouye', exact: true, component: () => import(/* webpackChunkName: "Dashboard" */'../routes/Dashboard/Dashboard'), models: ['events']},
  {
    name: <Fm id="sidebar.nav.deviceJoin.menu" defaultMessage="终端接入" />, path: '/endpoint', authority: "M_DEV_MGT", icon: 'icon-zhongduanjieru',
    children: [
      {name: <Fm id="sidebar.nav.deviceJoin.endpointCategory" defaultMessage="终端类别" />, path: '/endpoint-category', exact: true, component: () => import(/* webpackChunkName: "EndpointCategory" */'../routes/Endpoint/EndpointCategory/EndpointCategory'), models: ['tenants'],
        children: [
          {name: <Fm id="endpointCategory.endpointCategoryDetail" defaultMessage="终端类别详情" /> , path:'/detail/:id/:tenantId', hide: true, component: () => import(/* webpackChunkName: "EndpointCategoryDetail" */'routes/Endpoint/EndpointCategory/EndpointCategoryDetail'), models: ['endpointCategory']},
          {name: <Fm id="endpointCategory.editEndpointCategory" defaultMessage="编辑终端类别" />, path:'/edit/:id/:tenantId', exact: true, hide: true, component: () => import(/* webpackChunkName: "EndpointCategoryEditor" */'routes/Endpoint/EndpointCategory/EndpointCategoryEditor'), models: ['endpointCategory']},
        ]
      },
      {name: <Fm id="sidebar.nav.deviceJoin.endpointSpecification" defaultMessage="终端规格" />, path: '/endpoint-specification', exact: true, component: () => import(/* webpackChunkName: "EndpointSpec" */'../routes/Endpoint/EndpointSpec/EndpointSpec'), models: ['tenants'],
        children: [
          {name: <Fm id="specification.common.specificationDetail" defaultMessage="规格详情" /> , path:'/detail/:id/:tenantId', hide: true, component: () => import(/* webpackChunkName: "EndpointSpecDetail" */'routes/Endpoint/EndpointSpec/EndpointSpecDetail'), models: ['endpointSpec', 'command']},
          {name: <Fm id="specification.common.editspecification" defaultMessage="编辑规格" />, path:'/edit/:id/:tenantId', exact: true, hide: true, component: () => import(/* webpackChunkName: "EndpointSpecEditor" */'routes/Endpoint/EndpointSpec/EndpointSpecEditor'), models: ['endpointSpec', 'endpointCategory']},
        ]
      },
    ]
  }
]

export default basicRoute
