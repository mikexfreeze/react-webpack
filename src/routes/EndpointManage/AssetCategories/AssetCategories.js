import React, {Component} from 'react';
import {AgHeader, Fm, injectIntl} from "acom/Intl";
import {Button, Col, Divider, Drawer, message, Modal, Row} from "antd";
import {checkPermisson} from "utils/Authorized";
import {ACGrid, DateCell, SearchBar, Title} from "acom";
import {ActiveStatusCell, AlertStatus, EndpointSelectList, LinkStatus} from "routes/Endpoint/Endpoint/Components";
import {LinkCell, RowMenu} from "./Cells";
import assign from "lodash/assign";
import {parsePage} from "utils";
import {deleteAssetCategorie, queryAssetCategories} from "services/assetApi";
import SearchMenu from "./SearchMenu";
import {log} from 'utils'
import {connect} from "dva";
import {batchEditEPAsset} from "services/endpointApi";
import AssetCatgryEditor from "routes/EndpointManage/AssetCategories/AssetCatgryEditor";

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
      ePsDrawShow: false,
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
    field: 'id',
    filter: 'agTextColumnFilter',
    cellRenderer: 'linkCell',
    headerName: 'ID',
  }, {
    field: 'name',
    headerComponentParams: { fm: {id: "endpoint.common.assetname", defaultMessage: "资产名称"} },
  }, {
    field: "tenantId",
    headerComponentParams: { fm: {id: "common.tenantid", defaultMessage: "租户ID"} },
  }, {
    // TODO 连接资产类型模板
    field: "type",
    headerComponentParams: { fm: {id: "assetcategory.common.assetcategorytype", defaultMessage: "资产类型"} },
  }, {
    headerName: '创建时间', field: "createdTime", cellRenderer: 'dateCell',
    headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
  },
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
  }

  onACGridReady = (params) => {
    this.gridApi = params.api;

    let pageParams = this.pageParams
    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))
        queryAssetCategories(pageParams)
          .then((res) => {
            console.log("资产类型", res)
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

  closeEPsDraw = () => {
    this.setState({ePsDrawShow: false})
  }

  hdlEdit = (asset) => {
    this.setState({asset, editStatus: "edit",})
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
        deleteAssetCategorie(id, tenantId)
          .then(res => {
            console.log("删除资产：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.gridApi.deselectAll()
            thiz.gridApi.refreshInfiniteCache();
          })
      },
    });
  }

  hdlAssign = (asset) => {
    this.setState({
      ePsDrawShow: true,
      optAsset: asset
    })
  }

  hdlEPListChange = (endpoints) => {
    this.setState({optEndpoints: endpoints})
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

  hdlSearchId = (searchId) => {
    this.pageParams.name = searchId
    let thiz = this
    thiz.gridApi.refreshInfiniteCache();
  }

  hdlAdvanceSearch = (values) => {
    console.log(values)
    delete this.pageParams.name
    delete this.pageParams.tenantId
    delete this.pageParams.id
    delete this.pageParams.type

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
                placeholder={`${this.msg['endpoint.common.assetname']}`}
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
          title={<Title>{this.msg['assetcategory.createassetcategory.type']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDraw}
          visible={this.state.createDrawShow}
          style={{height: "calc(100% - 55px)"}}
          destroyOnClose={true}
          width={700}
        >
          <AssetCatgryEditor onSuccess={this.hdlEditSuc} assetCatgry={this.state.asset} editStatus={this.state.editStatus} />
        </Drawer>
        <Drawer
          title={<Title>{this.msg['assignment.common.associateep']}</Title>}
          placement="bottom"
          closable={false}
          onClose={this.closeEPsDraw}
          visible={this.state.ePsDrawShow}
          style={{height: "calc(100% - 55px)"}}
          destroyOnClose={true}
          height={700}
        >
          <EndpointSelectList tenantId={this.state.optAsset.tenantId} onChange={this.hdlEPListChange} />
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={2} offset={10} className="text-center">
              <Button type="default" className="mauto" onClick={this.closeEPsDraw}>
                <Fm id="common.goBack" />
              </Button>
            </Col>
            <Col span={2} className="text-center">
              <Button type="primary" disabled={this.state.optEndpoints.length === 0}
                      loading={this.props.onXHR} onClick={this.assign}>
                <Fm id="common.submit" defaultMessage="提交"/>
              </Button>
            </Col>
          </Row>
        </Drawer>

      </div>
    );
  }
}

export default AssetCategories;
