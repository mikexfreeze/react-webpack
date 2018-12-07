import {FormattedMessage} from "react-intl";
import Fm from 'acom/Intl/FormattedMessage'

export const login = {name: '登录', path: '/login', component: () => import(/* webpackChunkName: "Login" */'../routes/User/Login'), models: ['login', 'user']}

export const layout = {name: 'basicLayout', path: '/', component: () => import(/* webpackChunkName: "BasicLayout" */'../layouts/BasicLayout'),}

const basicRoute = [
  {
    name: <FormattedMessage id="sidebar.nav.home.menu" defaultMessage="首页"/>,
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
  },{
    name: <Fm id="sidebar.nav.deviceManage.menu" defaultMessage="终端管理" />, path: '/endpoint-manage', icon: 'icon-zhongduanguanli', models: ['tenants'],
    children: [
      {
        name: <Fm id="sidebar.nav.deviceManage.project" defaultMessage="项目" />, path: '/project', exact: true, component: () => import('../routes/EndpointManage/Project/Project'),
        children: [
          {name: <Fm id="project.projectDetail" defaultMessage="项目详情" />, path:'/detail/:id/:tenantId', hide: true, component: () => import('routes/EndpointManage/Project/ProjectDetail.js'), models: []},
        ]
      }, {
        name: <Fm id="sidebar.nav.deviceJoin.endpoint" defaultMessage="终端" />, path: '/endpoint-list', exact: true,
        component: () => import('routes/EndpointManage/Endpoint/EndpointManage.js'),
        models: ['assetCategories', 'assets', 'endpointGroup', 'otas', 'commands', 'softwares'],
        children: [
          {name: <Fm id="endpoint.common.endpointdetail" defaultMessage="终端详情" />, path:'/detail/:id/:tenantId', hide: true, component: () => import('routes/EndpointManage/Endpoint/EndpointDetail.js'), models: ['endpoint', 'commands']},
          {name: <Fm id="endpoint.common.editendpoint" defaultMessage="终端编辑" />, path:'/edit/:id/:tenantId', exact: true, hide: true, component: () => import('routes/Endpoint/Endpoint/EndpointEditor'), models: ['specifications', 'projects', 'commands'],},
        ]
      }, {
        name: <Fm id="sidebar.nav.deviceManage.assetAssignment" defaultMessage="资产" />, path: '/asset', exact: true,
        children: [
          {
            name: <Fm id="sidebar.nav.deviceManage.assetAssignmentSub.asset" defaultMessage="资产" />,
            path:'/list', exact: true, component: () => import('routes/EndpointManage/Asset/Asset.js'), models: [],
            children: [
              {
                name: <Fm id="asset.common.assetdetail" defaultMessage="资产详情" />,
                path:'/detail/:id/:tenantId', hide: true,
                component: () => import('routes/EndpointManage/Asset/AssetDetail.js'), models: []
              },
            ]
          },{
            name: <Fm id="sidebar.nav.deviceManage.assetAssignmentSub.assetType" defaultMessage="资产类型" />,
            path:'/categories', exact: true, component: () => import('routes/EndpointManage/AssetCategories/AssetCategories.js'), models: ['assetCatgryTpls'],
            children: [
              {
                name: <Fm id="assetcategory.common.assetcategorydetail" defaultMessage="资产类型详情" />,
                path:'/detail/:id/:tenantId', hide: true,
                component: () => import('routes/EndpointManage/AssetCategories/AssetCatgryDetail.js'), models: []
              },
            ]
          },{
            name: <Fm id="sidebar.nav.deviceManage.assetAssignmentSub.assetTypeTemplate" defaultMessage="资产类型模板" />,
            path:'/categories-tmplate', exact: true, component: () => import('routes/EndpointManage/AssetCatgryTpl/AssetCatgryTpl.js'),
            models: [],
            children: [
              {
                name: <Fm id="assettemplate.common.assetTplDetail" defaultMessage="资产类型模板详情" />,
                path:'/detail/:id/:tenantId', hide: true,
                component: () => import('routes/EndpointManage/AssetCatgryTpl/AssetCatgryTplDetail.js'), models: []
              },
            ]
          }
        ]
      },{
        name: <Fm id="sidebar.nav.deviceManage.endpointGroup" defaultMessage="终端组" />, path: '/endpoint-group', exact: true,
        component: () => import('routes/EndpointManage/EndpointGroup/EndpointGroup.js'),
        models: ['endpoints'],
        children: [
          {
            name: <Fm id="endpointGroup.endpointgroupDetail" defaultMessage="终端组详情" />,
            path:'/detail/:id/:tenantId', hide: true,
            component: () => import('routes/EndpointManage/EndpointGroup/EndpointGroupDetail.js'),
          }
        ]

      },{
        name: <Fm id="sidebar.nav.deviceManage.alert" defaultMessage="告警" />, path: '/alerts', exact: true,
        children:[
          {
            name: <Fm id="sidebar.nav.deviceManage.alertSub.realtimeAlert" defaultMessage="实时告警" />, path: '/real-time-alert', exact: true,
            component: () => import('routes/EndpointManage/Alerts/Alerts.js'),
            children: [
              {
                name: <Fm id="alertMgt.alertDetail" defaultMessage="告警详情" />, path: '/detail/:id/:tenantId', exact: true,
                component: () => import('routes/EndpointManage/Alerts/AlertDetail.js'),
              }
            ]
          },{
            name: <Fm id="sidebar.nav.deviceManage.alertSub.historyAlert" defaultMessage="历史告警" />, path: '/history-alert', exact: true,
            component: () => import('routes/EndpointManage/AlertsHistory/Alerts.js'),
            children: [
              {
                name: <Fm id="alertMgt.alertDetail" defaultMessage="告警详情" />, path: '/detail/:id/:tenantId', exact: true,
                component: () => import('routes/EndpointManage/Alerts/AlertDetail.js'),
              }
            ]
          },
        ]
      }

    ]
  }, {
    name: <Fm id="sidebar.nav.controlCenter.menu" defaultMessage="控制中心" />, authority: 'M_CONTROL', path: '/ctrl', icon: 'icon-kongzhizhongxin',
    children: [
      {
        name: <Fm id="sidebar.nav.controlCenter.tenantManage" defaultMessage="租户管理" />, exact: true, authority: '', path: '/tenant-manage',
        component: ()=> import('routes/ControlPanel/Tenant/TenantManage.js'), models: [],
        children: [
          {name: <Fm id="tenant.common.addtenant" defaultMessage="添加租户" />, path: '/create', exact: true, component: ()=> import('routes/ControlPanel/Tenant/TenantEditor.js')},
          {name: <Fm id="tenant.common.edittenant" defaultMessage="编辑租户" />, path: '/edit/:id', exact: true, component: ()=> import('routes/ControlPanel/Tenant/TenantEditor.js')},
          {name: <Fm id="tenant.viewtenant.tenantdetail" defaultMessage="租户详情" />, path: '/detail/:id', exact: true, component: ()=> import('routes/ControlPanel/Tenant/TenantEditor.js')},
        ]
      }, {
        name: <Fm id="sidebar.nav.controlCenter.userManage" defaultMessage="用户管理" />, exact: true, authority: 'M_CONTROL_USER', path: '/user-manage', component: ()=> import('routes/ControlPanel/User/UserManage'), models: ['tenants', 'projects', 'roles'],
        children: [
          {name: <Fm id="user.viewuser.userdetail" defaultMessage="用户详情" />, path: '/detail/:username', exact: true, component: ()=> import('routes/ControlPanel/User/UserDetail.js')},
        ]
      }, {
        name: <Fm id="sidebar.nav.controlCenter.roleManage" defaultMessage="角色管理" />, authority: 'M_CONTROL_ROLE', path: '/role-manage', exact: true, component: ()=> import('routes/ControlPanel/Role/RoleManage'),
        children:[
          {name: <Fm id="role.common.createrole" defaultMessage="创建角色" />, path: '/create', exact: true, component: ()=> import('routes/ControlPanel/Role/RoleEditor.js')},
          {name: <Fm id="role.common.editrole" defaultMessage="编辑角色" />, path: '/edit/:code', exact: true, component: ()=> import('routes/ControlPanel/Role/RoleEditor.js')},
          {name: <Fm id="role.common.viewrole" defaultMessage="查看角色" />, path: '/detail/:code', exact: true, component: ()=> import('routes/ControlPanel/Role/RoleEditor.js')},
        ]
      },{
        name: <Fm id="sidebar.nav.controlCenter.projectManage" defaultMessage="项目管理" />, exact: true,
        path: '/project-manage', component: ()=> import('routes/ControlPanel/Project/ProjectManage.js'), models: [],
        children:[
          {name: <Fm id="project.addProject" defaultMessage="添加项目" />, path: '/create', exact: true, component: ()=> import('routes/ControlPanel/Project/ProjectEditor.js')},
          {name: <Fm id="project.editProject" defaultMessage="编辑项目" />, path: '/edit/:token/:tenantId', exact: true, component: ()=> import('routes/ControlPanel/Project/ProjectEditor.js')},
        ]
      },
    ]
  },
  {name: '404', path: '/404', hide: true, component: () => import('../routes/Exception/404.js')},
  {name: '403', path: '/403', hide: true, component: () => import('../routes/Exception/403.js')},
  {name: '500', path: '/500', hide: true, component: () => import('../routes/Exception/500.js')},
]

export default basicRoute
