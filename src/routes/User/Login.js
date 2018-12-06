import {Form, Icon, Input, Button, Checkbox, Row, Card, Col} from 'antd';
import {connect} from 'dva';
import React, {Fragment} from 'react'
import styles from './Login.less';
import ReactCanvasNest from 'react-canvas-nest'
import {injectIntl} from "acom/Intl";
import GlobalFooter from "acom/GlobalFooter";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: '/iconfont.js',
});
const FormItem = Form.Item;

@injectIntl()
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

  msg = this.props.intl.message

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
      <div className={styles.layout}>
        <ReactCanvasNest
          config = {{
            pointColor: '255,255,255',
            lineColor: '255, 255, 255',
            count: '88',
            pointR: '4',
            lineWidth: '5',
            mouseDist: '23333',
            dist: '16666'
          }}
          style={{
            zIndex: '0',
          }}
        />
        <div className={styles.main}>
          <Card>
            <p className={styles.title}>
              <IconFont className={styles.logoIcon} type="icon-logo" />
              <IconFont className={`${styles.logoText} ml10`} type="icon-Aconn" />
            </p>
            <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
              <FormItem style={{marginBottom: 30}}>
                {getFieldDecorator('userName', {
                  rules: [{required: true, message: 'Please input your username!'}],
                })(
                  <Input size="large"
                         addonAfter={
                           <Button shape="circle" size="small" type="primary">
                            <Icon type="user" style={{color: '#fff'}}/>
                           </Button>
                         }
                         placeholder="Username"/>
                )}
              </FormItem>
              <FormItem style={{marginBottom: 30}}>
                {getFieldDecorator('password', {
                  rules: [{required: true, message: 'Please input your Password!'}],
                })(
                  <Input size="large"
                         addonAfter={
                           <Button shape="circle" size="small" type="primary">
                             <Icon type="lock" theme="filled" style={{color: '#fff'}}/>
                           </Button>
                         }
                         type="password"
                         placeholder="Password"/>
                )}
              </FormItem>

              <Row type="flex" className="mb30" >
                <FormItem className="grow1 mr20" style={{marginRight: "20px"}}>
                  {getFieldDecorator('verifCode', {
                    rules: [{required: true, message: 'Please input your Password!'}],
                  })(
                    <Input size="large" placeholder="验证码"/>
                  )}
                </FormItem>
                <div className={styles.verifCon} style={{backgroundImage: `url(${this.state.varifCodehttp})`}}>

                </div>
                <Icon type="reload" className={styles.reload} onClick={this.generateVerifCode} />
              </Row>

              <Row>
                <Col span={16}>
                  <FormItem>
                    {getFieldDecorator('remember', {
                      valuePropName: 'checked',
                      initialValue: true,
                    })(
                      <Checkbox size="large">记住我</Checkbox>
                    )}
                    <a className="login-form-forgot" href="">忘记密码</a>


                  </FormItem>
                </Col>
                <Col span={8}>
                  <Button size="large" htmlType="submit" loading={this.props.logining} type="primary" className="login-form-button">
                    登录
                  </Button>
                </Col>
              </Row>


            </Form>

          </Card>
        </div>
        <GlobalFooter
          style={{color: '#fff', fontSize: 16}}
          copyright={
            <Fragment>
              <span>Copyright <Icon type="copyright" /> 2018 </span>
            </Fragment>
          }
        />
      </div>

    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm
