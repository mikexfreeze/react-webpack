import React from 'react'
import { Modal, Drawer, Form, Button, Col, Row, message} from 'antd';
import ACGrid from 'acom/AC-grid/AC-grid'
import DateCell from 'acom/Cell/DateCell'
import {deleteUsersById, queryUsers, resetUserPwd} from "services/userApi";
import {parsePage} from "utils/grid";
import assign from 'lodash/assign'
import {AgHeader, Fm, injectIntl} from "acom/Intl/index";
import SearchMenu from "./SearchMenu";
import {SearchBar, Title} from "acom";
import {LinkCell, ActiveStatusCell, CellMenu} from "routes/ControlPanel/User/UserCells";
import {log} from "utils";
import UserEdtior from './UserEditor'

const confirm = Modal.confirm;

@injectIntl()
@Form.create()
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createDrawerShow: false,
      editorUsername: '',
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
    this.selectedRows = []
  }

  msg = this.props.intl.messages

  columnDefs = [{
    cellRenderer: 'cellMenu',
    width: 60,
    field: 'username',
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
  },{
    headerName: '用户名',
    field: 'username',
    cellRenderer: 'linkCell',
    headerComponentParams: { fm: {id: "common.username", defaultMessage: "用户名"} }
  }, {
    headerName: '用户归属',
    field: 'tenantName',
    headerComponentParams: { fm: {id: "user.common.userAffiliation", defaultMessage: "用户归属"} }
  }, {
    headerName: '用户角色',
    field: "roleName",
    headerComponentParams: { fm: {id: "user.common.userrole", defaultMessage: "用户角色"} }
  }, {
    headerName: '状态',
    field: "status",
    cellRenderer: "activeStatusCell"
  }, {
      headerName: '创建时间',
      field: "createdTime",
      cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },
  ];

  defaultColDef = {

  }

  cellComponents = {
    linkCell: LinkCell,
    dateCell: DateCell,
    cellMenu: CellMenu,
    activeStatusCell: ActiveStatusCell,
    agColumnHeader: AgHeader,
  }

  showCreateDrawer = () => {
    this.setState({
      createDrawerShow: true,
    });
  };

  closeCreateDrawer = () => {
    this.setState({
      createDrawerShow: false,
    });
  };

  /**
   * onGridReady
   * @param params
   * this.pageParams 经过 decode 过程与 ag-grid getRows 交互，getRows 直接输出 this.pageParams 的 size 和 page 至 queryFunc
   * queryFunc 接收 getRows 输出的 size 和 page 并与组件中的其他查询参数结合，同后台交互
   * @return this.gridApi
   * params.api.setDatasource
   *
   */
  onACGridReady = (params) => {
    this.gridApi = params.api;

    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))

        queryUsers(pageParams)
          .then((res) => {
            console.log("用户列表", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  componentDidMount () {

  }

  hdlCreate = () => {
    this.setState({editorUsername: ''})
    this.showCreateDrawer()
  }

  hdlCreacted = (e) => {
    this.gridApi.refreshInfiniteCache();
    this.closeCreateDrawer()
  }

  hdlEdit = (e) => {
    this.setState({
      editorUsername: e
    })
    this.showCreateDrawer()
  }

  hdlResetPwd = (username) => {
    let thiz = this
    confirm({
      title: this.msg['alert.resetpwd'],
      okText: this.msg['common.ok'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        resetUserPwd(username)
          .then(res => {
            message.success(thiz.msg[`alert.resetsuccess`])
          })
      },
    });
  }

  clearSearchParams = () => {
    delete this.pageParams.level
    delete this.pageParams.tenantId
    delete this.pageParams.roleName
    delete this.pageParams.username
  }

  hdlSearchId = (searchId) => {
    this.clearSearchParams()
    this.pageParams.username = searchId
    this.gridApi.refreshInfiniteCache();
  }

  hdlAdvanceSearch = (values) => {
    log.debug('search values:', values)
    this.clearSearchParams()

    assign(this.pageParams, values)
    this.gridApi.refreshInfiniteCache();
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  hdlDeleteRow = () => {
    if(this.selectedRows.length < 1){
      message.error(this.msg[`alert.atLeastOne`], 3,)
    }else{
      // let selectedRows = this.selectedRows.map(row => row.id)
      let thiz = this
      let username = this.selectedRows[0].username
      confirm({
        title: this.msg['alert.delete'],
        okText: this.msg['common.ok'],
        okType: 'danger',
        cancelText: this.msg['common.cancel'],
        onOk() {
          deleteUsersById(username)
            .then(res => {
              thiz.gridApi.refreshInfiniteCache();
              message.success(thiz.msg[`alert.deleteSuccess`])
            })
        },
      });
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  gridContext = {
    onEdit: this.hdlEdit,
    onResetPwd: this.hdlResetPwd,
  }

  render () {

    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={this.hdlCreate}>
                <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
              </Button>
              <Button type="danger" size="small" icon="minus" onClick={this.hdlDeleteRow}>
                <Fm id="common.delete" tagName="span" defaultMessage="删除" />
              </Button>
            </Col>
            <Col span={12}>
              <SearchBar
                style={{width: '350px', float: 'right'}}
                placeholder={`${this.msg['common.search']} ID`}
                size="small"
                onPressEnter={this.hdlSearchId}
              >
                <SearchMenu
                  onSearch={this.hdlAdvanceSearch} />
              </SearchBar>
            </Col>
          </Row>
        </div>
        <div className="content-content ">

          <ACGrid
            columnDefs={this.columnDefs}
            location={this.props.location}
            context={this.gridContext}
            frameworkComponents={this.cellComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"multiple"}
          />

        </div>

        <Drawer
          title={<Title>{this.msg['user.common.adduser']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDrawer}
          visible={this.state.createDrawerShow}
          width={720}
        >
          <UserEdtior onCreated={this.hdlCreacted} id={this.state.editorUsername} />

        </Drawer>
      </div>


    )
  }
}

