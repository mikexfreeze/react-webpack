/* create by Micheal Xiao 2018/11/23 10:58 */
import {AgHeader, injectIntl} from "acom/Intl";
import {MainPage} from "components";
import {deleteEPGroup, queryEPGroups} from "services/endpointGroupApi";
import {CellMenu, LinkCell, Status} from "./Components";
import {DateCell} from "acom";
import SearchMenu from "./SearchMenu";
import EPGroupEditor from "./EPGroupEditor";

@injectIntl()
export default class EndpointGroup extends MainPage {

  queryTableData = queryEPGroups

  deleteAPi = deleteEPGroup

  columnDefs = [
    {
      cellRenderer: 'CellMenu',
      width: 60,
      field: 'username',
      cellClass: 'text-center',
      suppressSizeToFit: true,
      headerClass: 'text-center',
      headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
    },{
      field: 'id',
      cellRenderer: 'LinkCell',
      headerComponentParams: { fm: {id: "endpointGroup.endpointGroupId", defaultMessage: "终端组ID"} },
    },{
      field: 'groupName',
      headerComponentParams: { fm: {id: "endpointGroup.endpointGroupName", defaultMessage: "终端组名称"} },
    },{
      field: 'type',
      cellRenderer: 'Status',
      headerComponentParams: { fm: {id: "endpointGroup.endpointgroupType", defaultMessage: "终端组类型"} },
    },{
      field: 'endpointsCount',
      headerComponentParams: { fm: {id: "endpointGroup.endpointCount", defaultMessage: "终端数量"} },
    },{
      field: "createdTime",
      cellRenderer: 'DateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },{
      field: "updateTime",
      cellRenderer: 'DateCell',
      headerComponentParams: { fm: {id: "common.updatedtime", defaultMessage: "更新时间"} },
    },
  ];

  agComponents = {
    CellMenu,
    LinkCell,
    DateCell,
    Status,
    agColumnHeader: AgHeader
  }

  SearchMenu = SearchMenu

  Editor = EPGroupEditor

  gridContext = {
    onEdit: this.hdlEdit,
    onDelete: this.hdlDelete,
  }

}
