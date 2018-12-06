import { Form,} from "antd";
import {ACInput as Input, ACSelect as Select} from "acom/Form";
import {Fm, injectIntl} from 'acom/Intl'
import { SearchMenuBase } from 'components'
import React from "react";

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl()
@Form.create()
export default class SearchMenu extends SearchMenuBase {
  FormItemsFactory = () => {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <FormItem label={<Fm id="tenant.common.tenantname" defaultMessage="租户名称" />}>
          {getFieldDecorator('name', {
          })(
            <Input placeholder={this.msg['common.pleaseInput']} size="small" />
          )}
        </FormItem>
        <FormItem label={<Fm id="common.status" defaultMessage="状态" />}>
          {getFieldDecorator('status', {
          })(
            <Select placeholder={this.msg['common.pleaseChoose']} size="small" allowClear>
              <Option value={"Activated"}><Fm id="common.activated" defaultMessage="激活" /></Option>
              <Option value={"Alarm"}><Fm id="common.alerts" defaultMessage="告警" /></Option>
              <Option value={"Forbidden"}><Fm id="common.forbidden" defaultMessage="禁止" /></Option>
            </Select>
          )}
        </FormItem>
        <FormItem label={<Fm id="tenant.common.companyname" defaultMessage="公司名称" />}>
          {getFieldDecorator('companyName', {
          })(
            <Input placeholder={this.msg['common.pleaseInput']} size="small"/>
          )}
        </FormItem>
        <FormItem label={<Fm id="tenant.common.industry" defaultMessage="所属行业" />}>
          {getFieldDecorator('companyIndustry', {
          })(
            <Input placeholder={this.msg['common.pleaseInput']} size="small"/>
          )}
        </FormItem>
      </div>

    )
  }
}
