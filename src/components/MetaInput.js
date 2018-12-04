import {Component} from "react";
import {Button, Input, Col, Form, Icon, Row} from "antd";
import React from "react";
import once from 'lodash/once'
import {Fm, injectIntl} from "acom/Intl";

/**
 * TODO 继承 rc-form 原生组件，获取原生 submit 事件
 * @defaultValue 数据格式二维数组，可以延迟输入
 * @setDefaultValue 通过setDefaultValue 方法输入 defaultValue 格式同上
 *
 * @return 通过 validator 函数获取
 */
@injectIntl()
@Form.create()
export default class MetaInput extends Component{
  constructor(props) {
    super(props);

    this.initValue = props.value || [];
  }

  msg = this.props.intl.messages

  validator = (cb) => {
    const { form } = this.props;
    // console.log("form", form)
    form.validateFields((err, values) => {
      if(err){
        // cb(`${this.msg['common.pleaseInput']} Meta Data`)
        cb('请输入')
        return
      }

      if(form.getFieldsValue().meta){
        let metaData = form.getFieldValue('meta')
        this.triggerChange({meta:metaData})
        cb(null, metaData)
      }
    })
  }

  setDefaultValue = (defV) => {
    const { setFieldsValue } = this.props.form
    setFieldsValue({metaKeys: defV,})
    setTimeout(function () {
      setFieldsValue({meta: defV})
    }, 200)
  }

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.initValue, changedValue));
    }
  }

  // TODO change uuid 算法，考虑方案获取 meta data 的 length 为初始ID
  // TODO 增加动画效果
  uuid = 1000
  addMeta = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    const nextKeys = keys.concat(this.uuid);
    this.uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      metaKeys: nextKeys,
    });
  }

  removeMeta = (k) => {
    const { form } = this.props;
    const { setFieldsValue, getFieldValue } = this.props.form;
    // can use data-binding to get
    const keys = form.getFieldValue('metaKeys');
    // We need at least one passenger
    if (keys.length === 1 && this.props.atLeastOne) {
      return;
    }
    for(let i = k; i < keys.length - 1; i++){
      setFieldsValue({
        [`meta[${i}][0]`]: getFieldValue(`meta[${i + 1}][0]`),
        [`meta[${i}][1]`]: getFieldValue(`meta[${i + 1}][1]`),
      })
    }
    keys.splice(k, 1)
    // can use data-binding to set
    form.setFieldsValue({
      metaKeys: keys,
    });
  }

  /**
   * TODO meta input 的 metaKey 生成行数， meta 绑定具体数据，结构上本应同源，但是由于 meta 对应 field 依赖于 metaKeys 生成，且 rc-form 没有对应的初始化 field 方法。考虑中的解决方案，将 html 部分的生成放在单独的函数当中来处理，将 defaultValue 作为参数传入生成函数当中
   *
   */
  setDefValue = () => {
    const { setFieldsValue } = this.props.form
    setFieldsValue({
      metaKeys: this.defV,
    })
    let thiz = this
    setTimeout(function () {
      setFieldsValue({
        meta: thiz.defV
      })
    }, 200)
  }
  defV = []
  setOnce = once(this.setDefValue)

  UNSAFE_componentWillReceiveProps(nextProps){
    let defV = nextProps.defaultValue
    if(defV && defV.length > 0){
      this.defV = defV
      this.setOnce()
    }


  }

  render () {
    const { getFieldDecorator, getFieldValue } = this.props.form

    getFieldDecorator('metaKeys', {initialValue: this.initValue || []})
    const metaData = getFieldValue('metaKeys');
    const formMetas = metaData.map((k, i) => {
      return (
        <Row gutter={8} key={i} type="flex">
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][0]`, {
                validateTrigger: ['onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: this.msg['common.inputName'],
                }],
              })(
                <Input placeholder={this.msg['common.inputName']} />
              )}
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              style={{marginBottom: "0"}}
            >
              {getFieldDecorator(`meta[${i}][1]`, {
                validateTrigger: ['onBlur'],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: this.msg['common.inputValue'],
                }],
              })(
                <Input placeholder={this.msg['common.inputValue']} />
              )}
            </Form.Item>
          </Col>
          {metaData.length === 1 && this.props.atLeastOne ? null :
            <Col span={2} style={{lineHeight: "36px"}}>
              <Icon
                style={{"fontSize":"20px"}}
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={metaData.length === 1 && this.props.atLeastOne}
                onClick={() => this.removeMeta(i)}
              />
            </Col>}

        </Row>
      )
    })
    return (
      <div>
        <div className="ant-form-item-label">
          <label className="" title={this.msg['common.metadata']}>
            <Fm id="common.metadata" defaultMessage="元数据" />
          </label>
        </div>
        {formMetas}
        <Row>
          <Col span={22}>
            <Button type="dashed" onClick={this.addMeta} style={{width:"100%", margin: "10px 0 24px"}}>
              <Icon type="plus" /><Fm id="common.addOne" defaultMessage="增加一项" />
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}
