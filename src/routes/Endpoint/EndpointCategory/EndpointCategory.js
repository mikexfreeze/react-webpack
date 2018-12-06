import React from 'react'
import { Modal, Drawer, Form, Button, Col, Row, Input, message, Icon, Divider} from 'antd';
import { queryEndPointCategories, createEndPointCategory, deleteEndPointCategory } from 'services/endpointCategoryApi'
import {ACGrid, DateCell, Title, SearchBar} from 'acom'
import {connect} from "dva";
import LinkCell from './linkCell'
import CellMenu from './rowMenu'
import TextArea from 'antd/lib/input/TextArea';
import assign from "lodash/assign";
import {parsePage} from "utils/grid";
import { AgHeader, Fm, injectIntl} from 'acom/Intl'
import {Log} from "utils/log";
import SearchMenu from './searchMenu';

const confirm = Modal.confirm;

@injectIntl()
@connect(({ global, user }) => ({
  onXHR: global.onXHR,
  user
}))
@Form.create()
export default class EndpointCategory extends React.Component {
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
    this.selectedRows = [];
  }

  columnDefs = [{
    cellRenderer: 'cellMenu',
    width: 60,
    cellClass: 'text-center',
    suppressSizeToFit: true,
    headerClass: 'text-center',
    pinned: 'left',
    headerComponentParams: { fm: {id: "common.action", defaultMessage: "操作"} }
  }, {
    field: 'id',
    filter: 'agTextColumnFilter',
    cellRenderer: 'linkCell',
    headerComponentParams: { fm: {id: "common.id", defaultMessage: "ID"} }
  }, {
    field: 'name',
    headerComponentParams: { fm: {id: "common.name", defaultMessage: "名称"} },
  }, {
    field: "createdBy",
    headerComponentParams: { fm: {id: "common.createby", defaultMessage: "创建者"} },
  }, {
    field: "createdTime", 
    cellRenderer: 'dateCell',
    headerComponentParams: { fm: {id: "common.createdtime", defaultMessage: "创建时间"} },
  },
  ];

  defaultColDef = {
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  agComponents = {
    linkCell: LinkCell,
    dateCell: DateCell,
    cellMenu: CellMenu,
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

  onACGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.sizeColumnsToFit();

    let pageParams = this.pageParams

    var dataSource = {
      rowCount: null,
      getRows: function(params) {
        assign(pageParams, parsePage(params))

        queryEndPointCategories(pageParams)
          .then((res) => {
            Log.debug("终端类别信息", res);
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

  hdlSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.properties = {}
        for (let v of values.meta) {
          values.properties[v[0]] = v[1]
        }

        createEndPointCategory(values)
          .then(res => {
            Log.debug("创建终端类别：", res)
            if(res.status === 201){
              this.closeCreateDrawer()
              this.gridApi.refreshInfiniteCache();
            }
          })
      }
    });
  }

  hdlAdvanceSearch = (values) => {
    delete this.pageParams.tenantId
    delete this.pageParams.name
    delete this.pageParams.id
    assign(this.pageParams, values)
    Log.debug(values);
    this.gridApi.refreshInfiniteCache();
  }

  hdlIdChange = (v) => {
    this.setState({searchId: v})
  }

  hdlSearchId = (searchId) => {
    this.pageParams.id = searchId
    this.gridApi.refreshInfiniteCache();
  }

  hdlSelectionChanged = () => {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  hdlDeleteRow = () => {
    const { intl: {messages} } = this.props;
    if(this.selectedRows.length < 1){
      message.error(messages['common.atLeastOne'], 3,)
    }else{
      let selectedRows = this.selectedRows.map(row => row.id)
      let thiz = this
      confirm({
        title: messages['alert.delete'],
        okText: messages['common.confirm'],
        okType: 'danger',
        cancelText: messages['common.cancel'],
        onOk() {
          deleteEndPointCategory(selectedRows)
            .then(res => {
              Log.debug("删除终端类别：", res)
              thiz.gridApi.refreshInfiniteCache();
            })
        },
      });
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  uuid = 100

  addMeta = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    const nextKeys = keys.concat(this.uuid);
    this.uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      metaKeys: nextKeys,
    });
  }

  removeMeta = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }
    // can use data-binding to set
    form.setFieldsValue({
      metaKeys: keys.filter(key => key !== k),
    });
  }

  render () {
    const { intl: {messages} } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('metaKeys', {initialValue: [1]})
    const metaData = getFieldValue('metaKeys');
    const formMetas = metaData.map((k, i) => {
      return (
        <Row gutter={8} key={i} type="flex">
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][0]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['common.inputName'],
                }],
              })(
                <Input placeholder={messages['common.inputName']} />
              )}
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][1]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: messages['common.inputValue'],
                }],
              })(
                <Input placeholder={messages['common.inputValue']} />
              )}
            </Form.Item>
          </Col>
          {metaData.length > 1 ? (
            <Col span={2}>
              <Icon
                style={{"fontSize":"20px", "paddingTop":"9px"}}
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={metaData.length === 1}
                onClick={() => this.removeMeta(k)}
              />
            </Col>
          ) : null}
        </Row>
      )
    })

    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12}>
              <Button type="primary" size="small" icon="plus" className={"mr10"} onClick={this.showCreateDrawer}>
                <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
              </Button>
              <Button type="danger" size="small" icon="minus" onClick={this.hdlDeleteRow}>
                <Fm id="common.delete" tagName="span" defaultMessage="删除" />
              </Button>
            </Col>
            <Col span={12}>
              <SearchBar
                style={{width: '350px', float: 'right'}}
                placeholder={messages['common.name']}
                size="small"
                onChange={this.hdlIdChange}
                value={this.state.searchId}
                onPressEnter={this.hdlSearchId}
              >
                <SearchMenu
                  onIdChange={this.hdlIdChange}
                  searchId={this.state.searchId}
                  onSearch={this.hdlAdvanceSearch} />
              </SearchBar>
            </Col>
          </Row>
        </div>

        <div className="content-content">
          <ACGrid
            columnDefs={this.columnDefs}
            defaultColDef={this.defaultColDef}
            location={this.props.location}
            frameworkComponents={this.agComponents}
            onACGridReady={this.onACGridReady}
            onSelectionChanged={this.hdlSelectionChanged}
            rowSelection={"multiple"}
          />
        </div>

        <Drawer
          title={<Title>{messages['endpointCategory.addEndpointCategory']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDrawer}
          visible={this.state.createDrawerShow}
          width={370}
        >
          <Form layout="vertical" onSubmit={this.hdlSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="ID">
                  {getFieldDecorator('id', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                  })(
                    <Input type="text" placeholder={messages['alert.inputCorrectIdOrUsername']} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={ messages['common.name'] }>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                  })(<Input placeholder={messages['alert.inputCorrectIdOrUsername']} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="SKU">
                  {getFieldDecorator('sku')(<Input placeholder={messages['alert.inputCorrentJasperId']} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={messages['common.description']}>
                  {getFieldDecorator('description', {})(
                    <TextArea placeholder={messages['alert.inputMaxLength300']} autosize={{ minRows: 2, maxRows: 6 }} style={{marginTop: "2px"}} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <div className="ant-form-item-label">
                  <label className="" title={messages['common.metadata']}>{messages['common.metadata']}</label>
                </div>
                {formMetas}
                <Row>
                  <Col span={24}>
                    <Button type="dashed" onClick={this.addMeta} style={{width:"100%", margin: "10px 0 24px"}}>
                      <Icon type="plus" /> {messages['common.addAItem']}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Divider style={{ marginBottom: 32 }} />
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={this.props.onXHR}>{messages['common.submit']}</Button>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    )
  }
}

