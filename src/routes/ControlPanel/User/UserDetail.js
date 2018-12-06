import React, {Component} from 'react';
import {Badge, Button, Card, Col, Divider, Row, Spin,} from "antd";
import {Fm, injectIntl} from "acom/Intl";
import {queryUsersById} from "services/userApi";
import {log} from 'utils'
import DescriptionList from "acom/DescriptionList";
import {Title} from "acom";
import {LevelFilter} from "routes/ControlPanel/Role/roleUtils";
import DateCell from "acom/Cell/DateCell";

const { Description } = DescriptionList;

@injectIntl()
class UserDetail extends Component {

  state = {
    user: undefined
  }

  msg = this.props.intl.messages

  componentDidMount () {

    queryUsersById(this.props.match.params.username)
      .then(res => {
        log.info('queryUsersById', res.data)
        this.setState({user: res.data})
      })

  }

  render() {
    let user = this.state.user
    if(user){
      return (
        <Card>
          <DescriptionList size="large"
                           title={<Title><Fm id="user.viewuser.userdetail" defaultMessage="用户详情" /></Title>}
                           style={{ marginBottom: 12 }}>
            <Description term={this.msg['common.tenantid']} className={user.level === 1 && "hide"}>{user.tenantId}</Description>
            <Description term={this.msg['user.common.belongsToProject']} className={user.level !== 3 && "hide"}>{user.projectName}</Description>
            <Description term={this.msg['user.common.userlevel']}><LevelFilter level={user.level} /></Description>
            <Description term={this.msg['user.common.username']}>{user.username}</Description>
            <Description term={this.msg['user.common.userrole']}>{user.roleDtos.map(role => role.name)}</Description>
            <Description term={this.msg['user.common.userstatus']}>
              {user.status === 1 ?
                <Badge status="processing" /> :
                <Badge status="warning" />
              }
            </Description>
            <Description term={this.msg['common.createby']}>{user.createdBy}</Description>
            <Description term={this.msg['user.common.lastname']}>{user.lastName}</Description>
            <Description term={this.msg['user.common.firstname']} >{user.firstMame}</Description>
            <Description term={this.msg['user.common.email']}>{user.email}</Description>
            <Description term={this.msg['user.common.phone']}>{user.phone}</Description>
            <Description term={this.msg['user.common.address']}>{user.address}</Description>
            <Description term={this.msg['user.common.zipcode']}>{user.zipCode}</Description>
            <Description term={this.msg['common.metadata']} className={user.metaData === "{}" && "hide"}>{user.metaData}</Description>
            <Description term={this.msg['common.createdtime']}><DateCell value={user.createdTime} /></Description>
            <Description term={this.msg['common.updatedtime']}><DateCell value={user.updateTime} /></Description>
            <Description term={this.msg['user.viewuser.lastlogin']}><DateCell value={user.lastLogin} /></Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <Row>
            <Col span={3} offset={10} className="text-center">
              <Button type="default" onClick={this.props.history.goBack} block>
                <Fm id="common.goBack" defaultMessage="返回" />
              </Button>
            </Col>
          </Row>
        </Card>
      );
    }else{
      return (
        <div className="global-spin">
          <Spin size="large" />
        </div>
      )
    }

  }
}

export default UserDetail;
