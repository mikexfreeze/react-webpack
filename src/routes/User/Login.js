import {Form, Input, Button, Checkbox, Row} from 'antd';
import {connect} from 'dva';
import React from 'react'
import styles from './Login.less';

const FormItem = Form.Item;

@connect(({login, user, loading}) => ({
  login,
  user,
  logining: loading.effects['login/login']
}))
class NormalLoginForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      varifCodehttp: ''
    }
  }

  handleSubmit = (e) => {
    const {dispatch} = this.props;

    e.preventDefault();
    if(this.props.logining){
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'login/login',
          payload: {
            ...values,
          },
        });
      }
    });
  }

  UNSAFE_componentWillMount () {
    this.generateVerifCode()
  }

  componentDidMount () {

  }

  generateVerifCode = () => {
    this.setState({
      varifCodehttp: process.env.BASE_API + '/code/image?rand_number=' + Math.random()
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {getFieldDecorator('userName', {
              rules: [{required: true, message: 'Please input your username!'}],
            })(
              <Input placeholder="Username"/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{required: true, message: 'Please input your Password!'}],
            })(
              <Input type="password"
                     placeholder="Password"/>
            )}
          </FormItem>

          <Row type="flex" >
            <FormItem className="grow1 mr20" style={{marginRight: "20px"}}>
              {getFieldDecorator('verifCode', {
                rules: [{required: true, message: 'Please input your Password!'}],
              })(
                <Input placeholder="验证码"/>
              )}
            </FormItem>
            <div className={styles.verifCon} style={{backgroundImage: `url(${this.state.varifCodehttp})`}}>

            </div>
          </Row>

          <FormItem>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>Remember me</Checkbox>
            )}
            <a className="login-form-forgot" href="">Forgot password</a>
            <Button htmlType="submit" loading={this.props.logining} type="primary" className="login-form-button" style={{width: "100%"}}>
              登录
            </Button>

          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm
