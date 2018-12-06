import {MainPage} from "components";
import {deleteTenant, queryTenants} from "services/tenantApi";
import {AgHeader, injectIntl} from "acom/Intl";
import DateCell from "acom/Cell/DateCell";
import {RowMenu, LinkCell, ActiveStatusCell} from "routes/ControlPanel/Tenant/Cells";
import {message, Modal} from "antd";
import {log} from "utils"
import SearchMenu from './SearchMenu'

const confirm = Modal.confirm

@injectIntl()
export default class TenantManage extends MainPage {

  queryTableData = queryTenants

  columnDefs = [{
    cellRenderer: 'cellMenu',
    width: 60,
    field: 'username',
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
  },{
    field: 'id',
    cellRenderer: 'linkCell',
    headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} }
  }, {
    field: 'name',
    headerComponentParams: { fm: {id: "tenant.common.tenantname", defaultMessage: "租户名称"} }
  }, {
    field: "companyName",
    headerComponentParams: { fm: {id: "tenant.common.companyname", defaultMessage: "公司名称"} }
  }, {
    field: "companyIndustry",
    headerComponentParams: { fm: {id: "tenant.common.industry", defaultMessage: "所属行业"} }
  }, {
    field: "status",
    cellRenderer: 'activeStatusCell',
    headerComponentParams: { fm: {id: "common.status", defaultMessage: "状态"} },
  }, {
    headerName: '创建时间',
    field: "createdTime",
    cellRenderer: 'dateCell',
    headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
  },
  ];

  agComponents = {
    activeStatusCell: ActiveStatusCell,
    linkCell: LinkCell,
    dateCell: DateCell,
    cellMenu: RowMenu,
    agColumnHeader: AgHeader,
  }

  hdlCreate = () => {
    let history = this.props.history
    history.push(history.location.pathname + '/create')
  }

  hdlEdit = (data) => {
    let history = this.props.history
    history.push(history.location.pathname + '/edit/' + data.id)
  }

  hdlDelete = (data) => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteTenant(data.id)
          .then(res => {
            log.info("删除：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  gridContext = {
    onEdit: this.hdlEdit,
    onDelete: this.hdlDelete,
  }

  SearchMenu = SearchMenu

}
