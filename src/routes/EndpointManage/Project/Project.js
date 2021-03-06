import React from 'react'
import { Modal, Drawer, Form, Button, Col, Row, Input, message, Divider, Select} from 'antd';
import { createEndPointSpec } from 'services/endpointSpecApi';
import { queryProjects, deleteProject } from 'services/projectApi';
import {ACGrid, DateCell, Title, SearchBar} from 'acom'
import {connect} from "dva";
import {LinkCell} from './Components';
import assign from "lodash/assign";
import {parsePage} from "utils/grid";
import { AgHeader, injectIntl} from 'acom/Intl'
import {Log} from "utils/log";
import MetaInput from "components/MetaInput";
import store from 'store2';
import SearchMenu from './SearchMenu';
import moment from 'moment';

const confirm = Modal.confirm;

@injectIntl()
@connect(({ global, user, tenants }) => ({
  onXHR: global.onXHR,
  user,
  tenants
}))
@Form.create()
export default class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createDrawerShow: false,
    };
    this.userLevel = store.get('user').level;
    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
    }
    this.selectedRows = [];
  }

  columnDefs = [
    {
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

  defaultColDef = {
    suppressSorting: true,
    suppressMenu: true,
    suppressFilter: true,
  }

  agComponents = {
    linkCell: LinkCell,
    dateCell: DateCell,
    agColumnHeader: AgHeader
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
    const { dispatch } = this.props;
    if (this.userLevel) {
      dispatch({
        type: 'endpointCategory/reset'
      })
    }
    const { resetFields } = this.props.form;
    resetFields();
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

        queryProjects(pageParams)
          .then((res) => {
            Log.debug("项目管理分页", res);
            let data = res.data
            pageParams.total = data.totalElements
            params.successCallback(data.content, pageParams.total);
          })
      }
    };
    params.api.setDatasource(dataSource);
  }

  componentDidMount () {
    const { dispatch } = this.props

    // 非系统级用户，请求终端类别数据
    if (this.userLevel !== 1) {
      const tenantId = store.get('user').tenantId;
      dispatch({
        type: 'endpointCategory/fetchAll',
        payload: {
          tenantId: tenantId
        }
      })
    }else {
      dispatch({
        type: 'tenants/fetch'
      })
    }
  }

  hdlTenantIdChange = (tenantId) => {
    const { dispatch } = this.props
    if (tenantId) {
      dispatch({
        type: 'endpointCategory/fetchAll',
        payload: {
          tenantId: tenantId
        }
      })
    }

    setTimeout(() => {
      this.setState({state: this.state});
    }, 500);
  }

  hdlSubmit = (e) => {
    e.preventDefault();
    let error;let formValues;let meta = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      error = err
      formValues = values
    });
    this.metaInput.validator((err, data) => {
      if(err){
        error = {
          ...error,
          meta: err,
        }
      }else{
        meta = data
      }
    });
    if(error){
      Log.error('error', error)
      return
    }

    let metaData = {}
    for (let [i, v] of Object.entries(meta)) {
      metaData[`元数据-${i}`] = {[v[0]]: v[1]}
    }

    let postData = {
      ...formValues,
      metaData
    }

    createEndPointSpec(postData)
      .then(res => {
        Log.debug("创建终端规格：", res)
        if(res.status === 201){
          this.closeCreateDrawer()
          this.gridApi.refreshInfiniteCache();
        }
      })
  }

  hdlAdvanceSearch = (values) => {
    delete this.pageParams.tenantId
    delete this.pageParams.name
    delete this.pageParams.token
    delete this.pageParams.startDate
    delete this.pageParams.endDate
    if(values.timeRange){
      values.startDate = moment(values.timeRange[0]).format("YYYY-MM-DD HH:mm:ss")
      values.endDate = moment(values.timeRange[1]).format("YYYY-MM-DD HH:mm:ss")
    }
    assign(this.pageParams, values)
    delete this.pageParams.timeRange
    Log.debug(values);
    this.gridApi.refreshInfiniteCache();
  }

  hdlIdChange = (v) => {
    this.setState({searchId: v})
  }

  hdlSearchId = (searchId) => {
    this.pageParams.name = searchId
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
      let [ row ] = this.selectedRows;
      let thiz = this
      confirm({
        title: messages['alert.delete'],
        okText: messages['common.confirm'],
        okType: 'danger',
        cancelText: messages['common.cancel'],
        onOk() {
          deleteProject(row.token, row.tenantId)
            .then(res => {
              Log.debug("删除项目：", res)
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

  render () {
    const { intl: {messages} } = this.props;
    const { getFieldDecorator } = this.props.form;
    const Option = Select.Option;
    const containerPolicies = [
      {name: messages['specification.common.standalone'], value: 'Standalone'},
      {name: messages['specification.common.composite'], value: 'Composite'},
    ];

    return (
      <div className="flex-content">
        <div className="content-header">
          <Row>
            <Col span={12} offset={12}>
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
          title={<Title>{messages['specification.common.addspecification']}</Title>}
          placement="right"
          closable={false}
          onClose={this.closeCreateDrawer}
          visible={this.state.createDrawerShow}
          width={370}
        >
          <Form layout="vertical" onSubmit={this.hdlSubmit}>
            <Row gutter={16} style={{display: this.userLevel === 1 ? 'block' : 'none'}}>
              <Col span={24}>
                <Form.Item label={ messages['common.tenantid'] }>
                  {getFieldDecorator('tenantId', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                  })(
                    <Select placeholder={messages['common.chooseTenant']} onChange={this.hdlTenantIdChange}>
                      {this.props.tenants.map(data => {
                        return (<Option value={data.id} key={data.id}>{data.id}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={ messages['specification.common.specificationname'] }>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                  })(
                    <Input type="text" placeholder={messages['alert.inputCorrectIdOrUsername']} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={messages['specification.common.containertype']}>
                  {getFieldDecorator('containerPolicy', {
                    rules: [{ required: true, message: messages['alert.inputrequired'] }],
                    initialValue: 'Standalone'
                  })(
                    <Select placeholder={messages['specification.common.chooseContainerPolicy']}>
                      {containerPolicies.map(cat => {
                        return (<Option value={cat.value} key={cat.value}>{cat.name}</Option>)
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <MetaInput wrappedComponentRef={(metaInput) => this.metaInput = metaInput} />
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

