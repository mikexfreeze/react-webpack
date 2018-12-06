import {DatePicker, Form,} from "antd";
import {ACInput as Input, ACSelect as Select} from "acom/Form";
import {Fm, injectIntl} from 'acom/Intl'
import { SearchMenuBase } from 'components'
import React from "react";
import {connect} from "dva";

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker, } = DatePicker;

@injectIntl()
@Form.create()
@connect(({ global, tenants, user,}) => ({
  onXHR: global.onXHR,
  tenants,
  user,
}))
export default class SearchMenu extends SearchMenuBase {

  defaultProp = "endpointId"

  componentDidMount () {
    const { dispatch } = this.props;
    if(this.props.user.level === 1){
      dispatch({type: 'tenants/fetch'});
    }
  }

  defaultSearch = () => {
    return (null)
  }

  FormItemsFactory = () => {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        {(this.props.user.level === 1) &&
        <FormItem label={<Fm id="tenant.common.tenantname" defaultMessage="租户名称" />}>
          {getFieldDecorator('tenantId', {
          })(
            <Select placeholder={this.msg['common.pleaseChoose']}
                    size={this.size}
                    onSelect={this.hdlTenantSelect}>
              {this.props.tenants.map(tenant => {
                return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
              })}
            </Select>
          )}
        </FormItem>
        }
        <FormItem label={<Fm id="common.endpointId" defaultMessage="终端ID" />}>
          {getFieldDecorator('endpointId')(
            <Input onChange={this.hdlIdChange} size={this.size}
                   placeholder={`${this.msg['common.pleaseInput']}`}  />
          )}
        </FormItem>
        <FormItem label={<Fm id="assignment.common.assetId" defaultMessage="资产ID" />}>
          {getFieldDecorator('assetId')(
            <Input onChange={this.hdlIdChange} size={this.size}
                   placeholder={`${this.msg['common.pleaseInput']}`}  />
          )}
        </FormItem>
        <FormItem label={<Fm id="project.projectToken" defaultMessage="项目token" />}>
          {getFieldDecorator('projectToken', {
          })(
            <Input placeholder={this.msg['common.pleaseInput']} size={this.size}/>
          )}
        </FormItem>
        <FormItem label={<Fm id="common.level" defaultMessage="级别" />}>
          {getFieldDecorator('level', {
          })(
            <Select placeholder={this.msg['common.pleaseChoose']}
                    size={this.size}>
              <Option value="Info" >{<Fm id="trigger.triggerRule.info" defaultMessage="通知" />}</Option>
              <Option value="Warning" >{<Fm id="trigger.triggerRule.warning" defaultMessage="警告" />}</Option>
              <Option value="Error" >{<Fm id="trigger.triggerRule.error" defaultMessage="严重" />}</Option>
              <Option value="Critical" >{<Fm id="trigger.triggerRule.critical" defaultMessage="致命" />}</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label={<Fm id="assignment.common.source" defaultMessage="来源" />}>
          {getFieldDecorator('source', {
          })(
            <Select placeholder={this.msg['common.pleaseChoose']}
                    size={this.size}>
              <Option value="Endpoint" >{<Fm id="alertMgt.fromEndpoint" defaultMessage="终端上报" />}</Option>
              <Option value="System" >{<Fm id="alertMgt.fromSystem" defaultMessage="系统生成" />}</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label={<Fm id="common.eventdate" defaultMessage="事件日期" />}>
          {getFieldDecorator('timeRange')(
            <RangePicker size={this.size} style={{width: "324px"}} showTime/>
          )}
        </FormItem>

      </div>

    )
  }
}
