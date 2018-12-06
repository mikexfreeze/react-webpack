/* create by Micheal Xiao 2018/11/20 17:45 */
import React, {Component} from 'react';
import DescriptionList from "acom/DescriptionList";
import {Fm, injectIntl} from "acom/Intl";
import {log} from "utils";
import {Button, Card, Col, Divider, Drawer, message, Modal, Row, Spin} from "antd";
import {Title} from "acom";
import DateCell from "acom/Cell/DateCell";
import {addEPToEPGroup, deleteEPFromEPGroup, queryEPGroupById} from "services/endpointGroupApi";
import {EndpointList, Status} from "routes/EndpointManage/EndpointGroup/Components";
import {AlertStatus, EndpointSelectList, LinkStatus} from "routes/Endpoint/Endpoint/Components";
import {connect} from "dva";

const { Description } = DescriptionList;
const confirm = Modal.confirm

@injectIntl()
@connect(({global}) => ({
  onXHR: global.onXHR,
}))
export default class EndpointGroupDetail extends Component {

  msg = this.props.intl.messages

  constructor(props){
    super(props);
    this.id = this.props.match.params.id
    this.tenantId = this.props.match.params.tenantId

    this.state = {
      data: {},
      ePsDrawShow: false,
      optEndpoints: [],
      ListKey: 0,
    }
  }

  hdlAddEnpoint = (asset) => {
    this.setState({
      ePsDrawShow: true,
    })
  }

  hdlEPListChange = (endpoints) => {
    this.setState({optEndpoints: endpoints})
  }

  closeEPsDraw = () => {
    this.setState({ePsDrawShow: false})
  }

  addEndpoint = () => {
    let endpointIds = this.state.optEndpoints.map(endpoint => endpoint.id)
    addEPToEPGroup({
      endpointIdSet: endpointIds,
      tenantId: this.tenantId,
      groupId: this.id,
    })
      .then(res => {
        log.info("添加终端至终端组：", res)
        if(res.status === 200){
          message.success(this.msg['alert.editSuccess'])
          this.closeEPsDraw()
          this.setState({
            ListKey: this.state.ListKey + 1
          })
        }
      })
  }

  hdlDeleteEP = (data) => {
    let endpointIds = [data.id]
    let thiz = this
    confirm({
      title: this.msg['alert.delete'],
      okText: this.msg['common.confirm'],
      okType: 'danger',
      cancelText: this.msg['common.cancel'],
      onOk() {
        deleteEPFromEPGroup({
          endpointIdSet: endpointIds,
          tenantId: thiz.tenantId,
          groupId: thiz.id,
        })
          .then(res => {
            log.info("从终端组删除终端：", res)
            message.success(thiz.msg["alert.deleteSuccess"])
            thiz.setState({
              ListKey: thiz.state.ListKey + 1
            })
          })
      },
    });
  }

  componentDidMount () {
    queryEPGroupById(this.id, this.tenantId)
      .then(res => {
        log.info(`${queryEPGroupById.name}:`, res.data)
        this.setState({data: res.data})
      })
  }

  render() {
    let data = this.state.data
    let badgeOffset = [0, -5]
    if(data.id){
      return (
        <Card bordered={false}>
          <Title className={`title mb24`}><Fm id="endpointGroup.endpointgroupDetail" defaultMessage="终端组详情" /></Title>
          <DescriptionList size="large" col={3}
                           style={{ marginBottom: 32 }}>
            <Description term={<Fm id="common.tenantid" defaultMessage="租户ID" />}>{data.tenantId}</Description>
            <Description term={<Fm id="endpointGroup.endpointGroupId" defaultMessage="终端组ID" />}>{data.id}</Description>
            <Description term={<Fm id="endpointGroup.endpointGroupName" defaultMessage="终端组名称" />}>{data.groupName}</Description>
            <Description term={<Fm id="endpointGroup.endpointgroupType" defaultMessage="终端组类型" />}><Status value={data.type} /></Description>
            {data.type === 'DYNAMIC' ?
              [
                <Description key={1} term={<Fm id="common.project" defaultMessage="项目" />}>{data.endpointFilter.projectToken}</Description>,
                <Description key={2} term={<Fm id="endpoint.common.endpointSpec" defaultMessage="终端规格" />}>{data.endpointFilter.specToken}</Description>,
                <Description key={3} term={<Fm id="common.endpointId" defaultMessage="终端ID" />}>{data.endpointFilter.id}</Description>,
                <Description key={4} term={<Fm id="common.connectStatus" defaultMessage="连接状态" />}><LinkStatus offset={badgeOffset} value={data.endpointFilter.status} /></Description>,
                <Description key={5} term={<Fm id="common.alertStatus" defaultMessage="告警状态" />}><AlertStatus offset={badgeOffset} value={data.endpointFilter.alertStatus} /></Description>,
                <Description key={6} term={<Fm id="home.startTime" defaultMessage="开始时间" />}><DateCell value={data.endpointFilter.startDate} /></Description>,
                <Description key={7} term={<Fm id="trigger.triggerRule.endDate" defaultMessage="结束时间" />}><DateCell value={data.endpointFilter.endDate} /></Description>,
                <Description key={8} term={<Fm id="common.metadata" defaultMessage="元数据" />}>{data.endpointFilter.metaData}</Description>,
              ]
              : null}
            <Description term={<Fm id="common.description" defaultMessage="描述" />}>{data.description}</Description>
          </DescriptionList>
          <Title className={`title mb24`}><Fm id="endpointGroup.endpointGroupEndpointList" defaultMessage="终端组终端列表" /></Title>
          {data.type === 'STATIC' ?
            <Row>
              <Col span={12}>
                <Button type="primary" icon="plus" size="small" className={"mr10 mb20"} onClick={this.hdlAddEnpoint}>
                  <Fm id="common.addNew" tagName="span" defaultMessage="新增" />
                </Button>
              </Col>
            </Row>
            : null}
          <EndpointList id={data.id} tenantId={data.tenantId}
                        type={data.type} key={this.state.ListKey}
                        onDelete={this.hdlDeleteEP} />
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={10}>
              <Button type="default" className="mauto" onClick={this.props.history.goBack} block><Fm id="common.goBack" /></Button>
            </Col>
          </Row>

          <Drawer
            title={<Title><Fm id="endpoint.common.addendpoint" defaultMessage="添加终端" /></Title>}
            placement="bottom"
            closable={false}
            onClose={this.closeEPsDraw}
            visible={this.state.ePsDrawShow}
            style={{height: "calc(100% - 55px)"}}
            destroyOnClose={true}
            height={700}
          >
            <EndpointSelectList tenantId={this.tenantId} onChange={this.hdlEPListChange} />
            <Divider style={{ marginBottom: 32 }} />
            <Row>
              <Col span={2} offset={10} className="text-center">
                <Button type="default" className="mauto" onClick={this.closeEPsDraw}>
                  <Fm id="common.goBack" />
                </Button>
              </Col>
              <Col span={2} className="text-center">
                <Button type="primary" disabled={this.state.optEndpoints.length === 0}
                        loading={this.props.onXHR} onClick={this.addEndpoint}>
                  <Fm id="common.submit" defaultMessage="提交"/>
                </Button>
              </Col>
            </Row>
          </Drawer>
        </Card>
      )
    }else{
      return (
        <div className="global-spin">
          <Spin size="large" />
        </div>
      )
    }

  }
}

