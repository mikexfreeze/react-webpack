import {Component} from 'react';
import {Card, Tabs, Icon, Form, Button, DatePicker, Select} from 'antd'
import { injectIntl } from "acom/Intl";
import ACSelect from "acom/Form/ACSelect";
import moment from 'moment'
import styles from './TracingMenu.less'

const TabPane = Tabs.TabPane;
const Option = ACSelect.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item

@injectIntl()
@Form.create()
class TracingMenu extends Component {

  constructor(props, context){
    super(props);

    let endTime = new Date().getTime()
    let startTime = endTime - 3600*24*180*1000
    this.timeFrame = {
      start: startTime,
      end: endTime
    }
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        // console.log(values)
        this.props.onPlayback({
          timeFrame: this.timeFrame,
          ...values
        })
      }
    });
  }

  msg = this.props.intl.messages

  hdlTabChange = () => {
    this.props.onTabChange()
  }

  render() {

    const { getFieldDecorator } = this.props.form

    return (
      <Card bodyStyle={{padding: 12}} className={styles.Menu} style={{minWidth: 350}}>
        <Tabs type="card" onChange={this.hdlTabChange}>
          <TabPane tab={<span><Icon type="environment" theme="outlined" />{this.msg['endpoint.common.monitor']}</span>} key="1">
            <MonitorForm onTracing={this.props.onTracing} onStopTracing={this.props.onStopTracing} />
          </TabPane>
          <TabPane tab={<span><Icon type="car" theme="outlined" />{this.msg['endpoint.common.track']}</span>} key="2">
            <Form onSubmit={this.hdlSubmit} className='search-form'>
              <FormItem label={this.msg['datamanagement.common.timeframe']}>
                <RangePicker showTime={{ format: 'HH:mm' }}
                             format="YYYY-MM-DD HH:mm"
                             placeholder={['Start Time', 'End Time']}
                             size="small"
                             defaultValue={[moment(this.timeFrame.start), moment(this.timeFrame.end)]}
                             onChange={this.hdlTRChange} />
              </FormItem>

              <FormItem label={this.msg['endpoint.common.animationTime']}>
                {getFieldDecorator('speed', {initialValue: "normal"})(
                  <ACSelect placeholder={this.msg['common.pleaseChoose']} size="small">
                    <Option value="slow">{this.msg['common.slowSpeed']}</Option>
                    <Option value="normal">{this.msg['common.normalSpeed']}</Option>
                    <Option value="fast">{this.msg['common.fastSpeed']}</Option>
                  </ACSelect>
                )}
              </FormItem>

              <div className={`mt10`}>
                <Button type="primary" size="small" block htmlType="submit">{this.msg['common.play']}</Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    );
  }
}

@injectIntl()
@Form.create()
class MonitorForm extends Component {

  state = {
    tracing: false
  }

  hdlSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err){
        if(this.state.tracing){
          this.props.onStopTracing()
        }else{
          this.props.onTracing(+values.countTime)
        }
        this.setState({tracing:!this.state.tracing})

      }
    });
  }

  msg = this.props.intl.messages

  render () {

    const Option = Select.Option
    const { getFieldDecorator } = this.props.form
    let tracing = this.state.tracing

    return (
      <Form onSubmit={this.hdlSubmit} className='search-form'>
        <FormItem label={this.msg['endpoint.common.refreshInterval']}>
          {getFieldDecorator('countTime', {initialValue: "5"})(
            <Select placeholder={this.msg['common.pleaseChoose']} size="small"
                    suffixIcon={this.msg['common.seconds']}>
              <Option value="5">5</Option>
              <Option value="10">10</Option>
              <Option value="30">30</Option>
            </Select>
          )}
        </FormItem>

        <div className={`mt10`}>
          <Button type={tracing ? 'danger' : 'primary'} size="small" block htmlType="submit">
            {tracing ? this.msg['common.stop'] : this.msg['common.start']}
          </Button>
        </div>
      </Form>
    )
  }
}

export default TracingMenu;
