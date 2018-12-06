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

  defaultProp = "name"

  componentDidMount () {
    const { dispatch } = this.props;
    if(this.props.user.level === 1){
      dispatch({type: 'tenants/fetch'});
    }
  }

  defaultSearch = () => {
    const { getFieldDecorator } = this.props.form;

    return (
      <FormItem label={<Fm id="common.name" defaultMessage="名称" />}>
        {getFieldDecorator('name')(
          <Input onChange={this.hdlIdChange} size={this.size}
                 placeholder={`${this.msg['common.pleaseInput']}`}  />
        )}
      </FormItem>
    )
  }

  FormItemsFactory = () => {
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        {(this.props.user.level === 1) &&
        <FormItem label={<Fm id="tenant.common.tenantname" defaultMessage="租户名称" />}>
          {getFieldDecorator('tenantId', {
          })(
            <Select placeholder={this.msg['alert.common.pleaseChoose']}
                    size={this.size}
                    onSelect={this.hdlTenantSelect}>
              {this.props.tenants.map(tenant => {
                return (<Option value={tenant.id} key={tenant.id}>{tenant.name}</Option>)
              })}
            </Select>
          )}
        </FormItem>
        }
        <FormItem label="token">
          {getFieldDecorator('token', {
          })(
            <Input placeholder={this.msg['common.pleaseInput']} size={this.size}/>
          )}
        </FormItem>
        <FormItem label={<Fm id="common.createdtime" defaultMessage="创建时间" />}>
          {getFieldDecorator('timeRange')(
            <RangePicker size={this.size} style={{width: "324px"}} showTime/>
          )}
        </FormItem>

      </div>

    )
  }
}
