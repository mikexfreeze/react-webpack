import React from 'react'
import { Modal, Button, Col, Row,  message} from 'antd';
import { AgHeader, Fm, injectIntl} from 'acom/Intl'
import {ACGrid, DateCell, SearchBar} from 'acom'
import {deleteRoleById, queryRoles} from "services/roleApi";
import CellMenu from '../rowMenu'
import LinkCell from './linkCell'
import {parsePage} from "utils/grid";
import assign from 'lodash/assign'
import SearchMenu from "./SearchMenu";
import { log } from "utils";

const confirm = Modal.confirm;

@injectIntl()
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createDrawerShow: false,
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
    this.selectedRows = []
  }

  msg = this.props.intl.messages

  columnDefs = [
    {
      cellRenderer: 'cellMenu',
      width: 60,
      field: 'code',
      cellClass: 'text-center',
      suppressSizeToFit: true,
      headerClass: 'text-center',
      headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
    },{
      headerName: '角色名称',
      field: 'name',
      cellRenderer: 'linkCell',
      headerComponentParams: { fm: {id: "role.common.rolename", defaultMessage: "角色名称"} }
    },{
      headerName: '角色级别',
      field: 'level',
      headerComponentParams: { fm: {id: "role.common.rolelevel", defaultMessage: "角色级别"} }
    },{
      headerName: '租户ID', field: "tenantId",
      headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} }
    },{
      headerName: '创建时间', field: "createdTime", cellRenderer: 'dateCell',
      headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
    },
  ];

  defaultColDef = {

  }

  cellComponents = {
    linkCell: LinkCell,
    dateCell: DateCell,
    cellMenu: CellMenu,
    agColumnHeader: AgHeader,
  }

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

        queryRoles(pageParams)
          .then((res) => {
            console.log("角色列表", res)
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

  hdlCreacte = () => {
    this.props.history.push('role-manage/create')
    this.props.history.goForward()
  };

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  hdlDeleteRow = () => {
    if(this.selectedRows.length < 1){
      message.error("请至少选择一行数据", 3,)
    }else{
      // let selectedRows = this.selectedRows.map(row => row.id)
      let thiz = this
      confirm({
        title: '确认删除',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          deleteRoleById(thiz.selectedRows[0].code)
            .then(() => {
              message.success("删除成功")
              thiz.gridApi.refreshInfiniteCache();
            })
        },
      });
    }
  }

  clearSearchParams = () => {
    delete this.pageParams.level
    delete this.pageParams.tenantId
    delete this.pageParams.name
  }

  hdlSearchId = (searchId) => {
    this.clearSearchParams()
    this.pageParams.name = searchId
    this.gridApi.refreshInfiniteCache();
  }

  hdlAdvanceSearch = (values) => {
    log.debug('search values:', values)
    this.clearSearchParams()

    assign(this.pageParams, values)
    this.gridApi.refreshInfiniteCache();
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

  render () {


    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={this.hdlCreacte}>
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
            frameworkComponents={this.cellComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"single"}
          />

        </div>

      </div>


    )
  }
}

