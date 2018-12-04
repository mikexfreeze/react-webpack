import React, {Component} from 'react';
import {Button, Col, Drawer, message, Modal, Row} from "antd";
import {Fm} from "acom/Intl";
import {ACGrid, SearchBar, Title} from "acom";
import {checkPermisson} from "utils/Authorized";
import assign from "lodash/assign";
import {parsePage, log} from "utils";
import moment from "moment";

const confirm = Modal.confirm

export default class MainPage extends Component {

  state = {
    searchId: "",
    selectedRows: [],
    editorDrawShow: false,
    editStatus: "create",
    data: {},
  }

  msg = this.props.intl.messages

  _isMounted = true

  pageParams = {
    page: 0,
    size: 100,
    total: 0,
  }

  size = "small"

  selectedRows = []

  defaultColDef = {
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  onACGridReady = (params) => {
    let thiz = this
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        thiz.queryTableData(pageParams)
          .then((res) => {
            log.info("queryTableData", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  hdlCreate = () => {
    this.setState({editorDrawShow: true, editStatus: "create",})
  }

  closeEditorDraw = () => {
    this.setState({editorDrawShow: false})
  }

  hdlEdit = (data) => {
    this.setState({editorDrawShow: true, editStatus: "edit", data,})
  }

  hdlDelete = (data) => {
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        thiz.deleteAPi(data)
          .then(res => {
            log.info("删除api：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  hdlEditSuc = () => {
    this.closeEditorDraw()
    this.gridApi.refreshInfiniteCache();
  }

  hdlSearchId = (searchId) => {
    this.pageParams.id = searchId
    this.gridApi.refreshInfiniteCache();
  }

  hdlAdvanceSearch = (values) => {
    delete this.pageParams.startDate
    delete this.pageParams.endDate
    for (let [i, v] of Object.entries(values)) {
      if(i === "timeRange" && v !== undefined){
        this.pageParams.startDate = moment(v[0]).format("YYYY-MM-DD 00:00:00")
        this.pageParams.endDate = moment(v[1]).format("YYYY-MM-DD 00:00:00")
      }else{
        this.pageParams[i] = v
      }
    }
    this.gridApi.refreshInfiniteCache();
  }

  hdlIdChange = (v) => {
    this.setState({searchId: v})
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
    if(this._isMounted){
      this.setState({selectedRows: this.gridApi.getSelectedRows()})
    }
  }

  searchProps = () => {
    return {
      onSearch: this.hdlAdvanceSearch,
      onIdChange: this.hdlIdChange,
      searchId: this.state.searchId
    }
  }

  ACgridProps = {}

  componentWillUnmount () {
    this._isMounted = false
  }

  render() {
    let contentHeader;
    if(this.contentHeader){
      contentHeader = this.contentHeader()
    }else{
      let SearchBarHtml
      if(this.SearchBar){
        SearchBarHtml = this.SearchBar()
      }else{
        SearchBarHtml = (
          <SearchBar
            style={{width: '350px', float: 'right'}}
            placeholder={`${this.msg['common.search']} ID`}
            onChange={this.hdlIdChange}
            value={this.state.searchId}
            onPressEnter={this.hdlSearchId}
            size={this.size}
          >
            <this.SearchMenu {...this.searchProps()} />
          </SearchBar>
        )
      }
      contentHeader = (
        <div className="content-header">
          <Row>
            <Col span={12}>
              {checkPermisson("",(
                <Button type="primary" size={this.size} icon="plus" className={"mr10"} onClick={this.hdlCreate}>
                  <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
                </Button>
              ))}
            </Col>
            <Col span={12}>
              {SearchBarHtml}
            </Col>
          </Row>
        </div>
      )
    }

    let DrawTitle = (<Fm id="common.create" defaultMessage="创建" />)
    if(this.state.editStatus === "edit"){
      DrawTitle = (<Fm id="common.edit" defaultMessage="编辑" />)
    }

    return (
      <div className="flex-content">
        {contentHeader}
        <div className="content-content ">

          <ACGrid
            columnDefs={this.columnDefs}
            context={this.gridContext}
            defaultColDef={this.defaultColDef}
            location={this.props.location}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            {...this.ACgridProps}
          />

        </div>
        {this.Editor ?
          <Drawer
            title={<Title>{DrawTitle}</Title>}
            placement="right"
            closable={false}
            onClose={this.closeEditorDraw}
            visible={this.state.editorDrawShow}
            style={{height: "calc(100% - 55px)"}}
            destroyOnClose={true}
            width={700}
          >
            <this.Editor onSuccess={this.hdlEditSuc} data={this.state.data} editStatus={this.state.editStatus} />
          </Drawer>
          : null}

      </div>
    );
  }
}
