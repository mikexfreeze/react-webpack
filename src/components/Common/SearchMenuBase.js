import React, {Component} from 'react';
import {Button, Form, Row} from "antd";
import {ACInput as Input} from "acom/Form";

const FormItem = Form.Item;

class SearchMenuBase extends Component {

  msg = this.props.intl.messages

  size = "small"

  hdlSubmit = (e) => {
    if(e){
      e.preventDefault();
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSearch(values)
      }
    });
  }

  hdlClear = () => {
    this.props.form.resetFields()
    this.props.onIdChange()
    this.hdlSubmit()
  }

  hdlIdChange = (e) => {
    this.props.onIdChange(e.target.value)
  }

  searchId = ""

  defaultProp = "id"

  componentDidMount(){
    const { setFieldsValue } = this.props.form;
    this.searchId = this.props.searchId
    setFieldsValue({[this.defaultProp] : this.searchId})
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    const { setFieldsValue } = this.props.form;
    if(nextProps.searchId !== this.searchId){
      setFieldsValue({[this.defaultProp]: nextProps.searchId})
      this.searchId = nextProps.searchId
    }
  }
  
  render() {

    const { getFieldDecorator } = this.props.form;

    const size = this.size

    let defaultSearch
    if(this.defaultSearch){
      defaultSearch = this.defaultSearch()
    }else{
      defaultSearch = (
        <FormItem label={`ID`}>
          {getFieldDecorator('id')(
            <Input onChange={this.hdlIdChange} size={size}
                   placeholder={`${this.msg['common.pleaseInput']}`}  />
          )}
        </FormItem>
      )
    }

    return (
      <Form className='search-form' onSubmit={this.hdlSubmit}>
        {defaultSearch}
        {this.FormItemsFactory()}
        <Row>
          <Button type="primary" htmlType="submit" size={size} loading={this.props.onXHR} style={{ marginRight: 8 }}>{this.msg['common.search']}</Button>
          <Button type="default" size={size} onClick={this.hdlClear} loading={this.props.onXHR}>{this.msg['common.clearSearch']}</Button>
        </Row>
      </Form>
    );
  }
}

export default SearchMenuBase;
