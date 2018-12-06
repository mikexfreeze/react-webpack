import React, {Component} from 'react';
import {queryAssetCatgryTpl} from "services/assetApi";
import {log} from "utils";
import {Title} from "acom";
import {Fm, injectIntl} from "acom/Intl";
import {Button, Card, Col, Row, Spin} from "antd";
import DescriptionList from "acom/DescriptionList";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import styles from "routes/ControlPanel/Role/RoleEditor.less";

const { Description } = DescriptionList;

@injectIntl()
export default class AssetCatgryTplDetail extends Component {
  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId

    this.pageParams = {
      page: 0,
      size: 100,
      total: 0,
      tenantId: this.tenantId
    }
    this.state = {
      data: {}
    }
  }

  msg = this.props.intl.messages

  componentDidMount () {
    queryAssetCatgryTpl({
      name: this.id,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryAssetCatgryTpl:", res.data)
      let data = {
          ...res.data,
        define: JSON.parse(res.data.define),
      }
      this.setState({data})
    })
  }

  columns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  }, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  }];

  data = [{
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  }, {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  }, {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  }];

  render() {

    let data = this.state.data
    console.log(data.define)
    return (
      <div>
        { data.id ?
          <Card bordered={false}>
            <Title className={`title mb24`}><Fm id="assetcategory.common.assetcategorydetail" defaultMessage="资产类型详情" /></Title>
            <DescriptionList size="large" col={2}
                             className="mb24">
              <Description term="ID">{data.id}</Description>
              <Description term={this.msg['common.tenantid']}>{data.tenantId}</Description>
              <Description term={this.msg['asset.listasset.assetname']}>{data.name}</Description>
              <Description term={<Fm id="common.description" defaultMessage="描述" />}>{data.description}</Description>
            </DescriptionList>
            <Title className="title mb24"><Fm id="assettemplate.common.attrDefine" defaultMessage="属性定义" /></Title>
            <div
              className={`ag-theme-fresh ${styles.agTable} mb24`}
              style={{width: 600}}
            >
              <AgGridReact
                rowData={data.define}
                enableColResize={true}
                suppressPaginationPanel={true}
                suppressPropertyNamesCheck={true}
                domLayout='autoHeight'
              >
                <AgGridColumn field="property" headerName={this.msg['assettemplate.common.attrName']}/>
                <AgGridColumn field="dataType" headerName={this.msg['assettemplate.common.type']}/>
                <AgGridColumn field="label" headerName={this.msg['assettemplate.common.showName']}/>
              </AgGridReact>
            </div>
            <Row>
              <Col span={3} offset={10}>
                <Button type="default" className="mauto" onClick={this.props.history.goBack} block><Fm id="common.goBack" /></Button>
              </Col>
            </Row>
          </Card>
          :
          <div className="global-spin">
            <Spin size="large" />
          </div>
        }
      </div>
    );
  }
}


