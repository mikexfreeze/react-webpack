import React, {Component} from 'react';
import {queryAssetCatgryById} from "services/assetApi";
import {log} from "utils";
import {Title} from "acom";
import {Fm, injectIntl} from "acom/Intl";
import {Button, Card, Col, Row, Spin} from "antd";
import DateCell from "acom/Cell/DateCell";
import DescriptionList from "acom/DescriptionList";

const { Description } = DescriptionList;

@injectIntl()
class AssetCatgryDetail extends Component {
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
    queryAssetCatgryById({
      id: this.id,
      tenantId: this.tenantId
    }).then(res => {
      log.info("queryAssetCatgryById:", res.data)
      this.setState({data: res.data})
    })
  }

  render() {

    let data = this.state.data
    return (
      <div>
        { data.id ?
          <Card bordered={false}>
            <Title className={`title mb24`}><Fm id="assetcategory.common.assetcategorydetail" defaultMessage="资产类型详情" /></Title>
            <DescriptionList size="large" col={2}
                             style={{ marginBottom: 32 }}>
              <Description term="ID">{data.id}</Description>
              <Description term={this.msg['common.tenantid']}>{data.tenantId}</Description>
              <Description term={this.msg['asset.listasset.assetname']}>{data.name}</Description>
              <Description term={this.msg['assetcategory.common.assetcategorytype']}>{data.type}</Description>
              <Description term={this.msg['common.createby']}>{data.createdBy}</Description>
              <Description term={this.msg['common.createdtime']}><DateCell value={data.createdTime} /></Description>
              <Description term={this.msg['common.updatedtime']}><DateCell value={data.updateTime} /></Description>
            </DescriptionList>
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

export default AssetCatgryDetail;
