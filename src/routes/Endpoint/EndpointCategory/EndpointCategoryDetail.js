import React from 'react'
import {Card, Divider, Spin, Button, Row, Col} from 'antd';
import DescriptionList from 'acom/DescriptionList/index';
import DateCell from 'acom/Cell/DateCell'
import { connect } from 'dva'
import { injectIntl} from 'acom/Intl'

const { Description } = DescriptionList;

@injectIntl()
@connect(({endpointCategory}) => ({
  endpointCategory,
}))
export default class EndpointCategoryDetail extends React.Component{
  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId
  }

  state = {
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch({
      type: 'endpointCategory/fetch',
      payload: {
        id: this.id,
        tenantId: this.tenantId
      }
    })
  }

  componentDidCatch(error, info) {
    console.log("ui error", error)
  }

  render(){
    const { intl: {messages} } = this.props;
    let endpointCategory = this.props.endpointCategory;
    return(
      <div>
        { endpointCategory.id ?
          <Card bordered={false}>
            <DescriptionList size="large" title={messages['endpointCategory.endpointCategoryDetail']} style={{ marginBottom: 32 }}>
              <Description term="ID">{endpointCategory.id}</Description>
              <Description term="SKU">{endpointCategory.sku}</Description>
              <Description term={messages['common.name']}>{endpointCategory.name}</Description>
              <Description term={messages['common.createby']}>{endpointCategory.createdBy}</Description>
              <Description term={messages['common.createdtime']}><DateCell value={endpointCategory.createdTime} /></Description>
              <Description term={messages['common.updatedtime']}><DateCell value={endpointCategory.updateTime} /></Description>
            </DescriptionList>
            <Divider style={{ marginBottom: 32 }} />
            <Row>
              <Col span={3} offset={10}>
                <Button type="primary" className="mauto" onClick={this.props.history.goBack} block>{messages['common.return']}</Button>
              </Col>
            </Row>
          </Card> :
          <div className="global-spin">
            <Spin size="large" />
          </div>
        }
      </div>
    )
  }

}
