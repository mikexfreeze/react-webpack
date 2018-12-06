/* create by Micheal Xiao 2018/11/12 10:36 */
import {AgHeader, injectIntl} from "acom/Intl";
import {MainPage} from "components";
import {deleteProject, queryProjects} from 'services/projectApi';
import {LinkCell} from "routes/EndpointManage/Project/Components";
import {DateCell, SearchBar} from "acom";
import {CellMenu} from "./Cells"
import SearchMenu from "./SearchMenu"
import {log} from "utils";
import {message, Modal} from "antd";

const confirm = Modal.confirm

@injectIntl()
export default class ProjectManage extends MainPage {

  queryTableData = queryProjects

  columnDefs = [
    {
      cellRenderer: 'CellMenu',
      width: 60,
      field: 'username',
      cellClass: 'text-center',
      suppressSizeToFit: true,
      headerClass: 'text-center',
      headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
    }, {
      field: 'name',
      cellRenderer: 'linkCell',
      headerComponentParams: { fm: {id: "common.name", defaultMessage: "名称"} },
    }, {
      field: "tenantId",
      headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} },
    },{
      field: "token",
      headerComponentParams: { fm: {id: "common.token", defaultMessage: "Token"} },
    }, {
      field: "createdTime",
      cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },
  ];

  agComponents = {
    CellMenu,
    linkCell: LinkCell,
    dateCell: DateCell,
    agColumnHeader: AgHeader
  }

  hdlCreate = () => {
    let history = this.props.history
    history.push(history.location.pathname + '/create')
  }

  hdlEdit = (data) => {
    let history = this.props.history
    history.push(`${history.location.pathname}/edit/${data.token}/${data.tenantId}`)
  }

  hdlDelete = (data) => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteProject(data.token, data.tenantId)
          .then(res => {
            log.info("删除：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  hdlSearchName = (searchId) => {
    this.pageParams.name = searchId
    this.gridApi.refreshInfiniteCache();
  }

  SearchBar = () => {
    return (
      <SearchBar
        style={{width: '350px', float: 'right'}}
        placeholder={`${this.msg['project.inputProjectName']}`}
        onChange={this.hdlIdChange}
        value={this.state.searchId}
        onPressEnter={this.hdlSearchName}
        size={this.size}
      >
        <SearchMenu {...this.searchProps()} />
      </SearchBar>
    )
  }

  gridContext = {
    onEdit: this.hdlEdit,
    onDelete: this.hdlDelete,
  }
}
