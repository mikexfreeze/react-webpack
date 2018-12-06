import React, {Component} from 'react';
import {AgHeader, Fm, injectIntl} from "acom/Intl";
import {Button, Col, Drawer, message, Modal, Row} from "antd";
import {checkPermisson} from "utils/Authorized";
import {ACGrid, DateCell, SearchBar, Title} from "acom";
import {ActiveStatusCell, AlertStatus, LinkStatus} from "routes/Endpoint/Endpoint/Components";
import {LinkCell, RowMenu} from "./Cells";
import assign from "lodash/assign";
import {parsePage} from "utils";
import {deleteAssetCatgryTpl, queryAssetCatgryTpls} from "services/assetApi";
import SearchMenu from "./SearchMenu";
import {log} from 'utils'
import {connect} from "dva";
import {batchEditEPAsset} from "services/endpointApi";
import AssetCatgryTplEditor from "routes/EndpointManage/AssetCatgryTpl/AssetCatgryTplEditor";
import {Property} from "routes/EndpointManage/AssetCatgryTpl/Cells";

const confirm = Modal.confirm

@injectIntl()
@connect(({global}) => ({
  lang: global.lang,
}))
class AssetCategories extends Component {

  constructor(props) {
    super(props);
    this.state = {
      createDrawShow: false,
      optData: {},
      optAsset: {},
      optEndpoints: [],
      editStatus: "create",
      asset:{},
    };
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
  }

  msg = this.props.intl.messages

  columnDefs = [{
    cellRenderer: 'cellMenu',
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    field: 'id',
    headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
  },{
    field: 'name',
    cellRenderer: 'linkCell',
    headerComponentParams: { fm: {id: "assettemplate.common.templateName", defaultMessage: "模板名称"} }
  },{
    field: "tenantId",
    headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} },
  },{
    field: "description",
    headerComponentParams: { fm: {id: "common.description", defaultMessage: "描述"} },
  },{
    field: "define",
    cellRenderer: 'Property',
    width: 500, suppressSizeToFit: true,
    headerComponentParams: { fm: {id: "assettemplate.common.attrDefine", defaultMessage: "属性定义"} },
  }, /*{
    headerName: '创建时间', field: "createdTime", cellRenderer: 'dateCell',
    headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
  },*/
  ];

  defaultColDef = {
    // suppressSizeToFit: true,
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  agComponents = {
    activeStatusCell: ActiveStatusCell,
    linkCell: LinkCell,
    dateCell: DateCell,
    linkStatus: LinkStatus,
    alertStatus: AlertStatus,
    cellMenu: RowMenu,
    agColumnHeader: AgHeader,
    Property,
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;

    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryAssetCatgryTpls(pageParams)
          .then((res) => {
            console.log("资产类型模板", res)
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  showDraw = () => {
    this.setState({createDrawShow: true})
  }

  showCreateDraw = () => {
    this.setState({createDrawShow: true, editStatus: "create",})
  }

  closeCreateDraw = () => {
    this.setState({createDrawShow: false})
  }

  hdlEdit = (data) => {
    this.setState({optData: data, editStatus: "edit",})
    this.showDraw()
  }

  hdlEditSuc = () => {
    this.closeCreateDraw()
    this.gridApi.refreshInfiniteCache();
  }

  hdlDelete = (id, tenantId) => {
    log.debug("id",id, tenantId)
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteAssetCatgryTpl(id, tenantId)
          .then(res => {
            console.log("删除资产类型模板：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  assign = () => {
    let endpointIds = this.state.optEndpoints.map(endpoint => endpoint.id)
    batchEditEPAsset({
      assetId: this.state.optAsset.id,
      endpointId: endpointIds,
      tenantId: this.state.optAsset.tenantId,
      type: "Associated",
    })
      .then(res => {
        log.info("批量编辑资产关联终端：", res)
        if(res.status === 201){
          message.success(this.msg['alert.editSuccess'])
          this.closeEPsDraw()
        }
      })
  }

  // TODO 资产类型模板搜索
  hdlSearchId = (searchId) => {
    this.pageParams.name = searchId
    let thiz = this
    thiz.gridApi.refreshInfiniteCache();
  }

  hdlAdvanceSearch = (values) => {
    console.log(values)
    delete this.pageParams.name
    delete this.pageParams.tenantId

    assign(this.pageParams, values)

    this.gridApi.refreshInfiniteCache();
  }

  gridContext = {
    onEdit: this.hdlEdit,
    onDelete: this.hdlDelete,
    onAssign: this.hdlAssign,
  }

  render() {
    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              {checkPermisson("",(
                <Button type="primary" size="small" className={"mr10"} onClick={this.showCreateDraw}>
                  <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
                </Button>
              ))}

            </Col>
            <Col span={12}>
              <SearchBar
                className="mr10"
                style={{width: '350px', float: 'right'}}
                placeholder={`${this.msg['plan.common.planname']}`}
                size="small"
                onChange={this.hdlIdChange}
                value={this.state.searchId}
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
            defaultColDef={this.defaultColDef}
            location={this.props.location}
            context={this.gridContext}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"multiple"}
          />

        </div>

        <Drawer
          title={<Title>{this.msg['assetcategory.createassetcategory.addType']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDraw}
          visible={this.state.createDrawShow}
          style={{height: "calc(100% - 55px)"}}
          destroyOnClose={true}
          width={700}
        >
          <AssetCatgryTplEditor onSuccess={this.hdlEditSuc} data={this.state.optData} editStatus={this.state.editStatus} />
        </Drawer>

      </div>
    );
  }
}

export default AssetCategories;
