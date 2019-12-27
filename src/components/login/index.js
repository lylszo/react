import React, { Component } from 'react'
import { Form, Icon, Input, Button, message } from 'antd'
import SendCode from '@/components/common/sendCode'
import { login, verifyCode } from '@/axios'
import initCaptchat from '@/tool/initGeet'
import { withRouter } from "react-router-dom"
import './index.scss'

// 登录表单
class Form1 extends Component {
  // 状态
  state = {
    loginLoading: false, // 登录按钮loading
    sendStatus: false, // 是否发送验证码
    loginData: {} // 登录接口获取的信息
  }

  // 发送登录请求
  loginReq() {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields(['account', 'password'], (err, values) => {
        if (err) {
          message.info('请先输入账号和密码！')
          reject()
        } else {
          login(values).then(data => {
            const info = {
              uri: `number:${data.data.phone}`,
              type: 'login'
            }
            this.setState({loginData: data.data})
            resolve(info)
          }).catch(() => {
            reject()
          })
        }
      });      
    })
  }

  // 提交表单
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.info('请按提示输入正确的数据！')
      } else if (!this.state.sendStatus) {
        message.info('请先发送验证码！')
      } else {
        this.setState({loginLoading: true})
        initCaptchat().then(data => {
          let params = {
            account: `number:${this.state.loginData.phone}`,
            code: values.code,
            baseToken: this.state.loginData.token,
            challenge: data.geetest_challenge,
            seccode: data.geetest_seccode,
            validate: data.geetest_validate
          }
          verifyCode(params).then(data => {
            sessionStorage.setItem('token', data.data.token)
            this.props.history.push('/')
            message.success('登录成功！')
          })
          this.setState({loginLoading: false})
        }).catch(() => {
          this.setState({loginLoading: false})
        })
      }
    });
  }

  // 子组件发送验证码以后改变sendStatus
  changeSendStatus () {
    this.setState({sendStatus: true})
  }

  // 渲染
  render() {
    const { getFieldDecorator } = this.props.form;
    const { loginLoading } = this.state
    return (
      <Form className="loginForm">
        <Form.Item>
          {getFieldDecorator('account', {
            rules: [{ required: true, message: '请输入账号!' }],
          })(
            <Input size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码!' }],
          })(
            <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: '请输入验证码!' },
              { pattern: /^\d*$/, message: '验证码为数字' }
            ],
          })(
            <div>
              <div className="fr">
                <SendCode changeSendStatus={this.changeSendStatus.bind(this)} promise={this.loginReq.bind(this)} />
              </div>
              <Input size="large" className="codeInput" prefix={<Icon type="code" style={{ color: 'rgba(0,0,0,.25)' }} />} type="code" placeholder="验证码" />
            </div>
          )}
        </Form.Item>
        <Form.Item>
          <Button size="large" onClick={this.handleSubmit} type="primary" htmlType="submit" className="btn" loading={loginLoading}>登录</Button>
        </Form.Item>
      </Form>
    );
  }
}
const LoginForm = Form.create({ name: 'login' })(withRouter(Form1));

class Login extends Component {
  // 渲染
  render() {
    const token = sessionStorage.getItem('token')
    if (token) {
      this.props.history.push('/')
      return null     
    } else {
      return (
        <div className="login wholePage">
          <div className="box">
            <h1>YBT 管理后台</h1>
            <LoginForm />
          </div>
        </div>
      )
    }
  }
}

export default Login