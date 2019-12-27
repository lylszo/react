import React, { Component } from 'react'
import { Tabs, Form, Input, Button, message } from 'antd'
import SendCode from '@/components/common/sendCode'
import { resetPassword } from '@/axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'
import './index.scss'

const TabPane = Tabs.TabPane;

// 修改密码表单
class Form1 extends Component {
  // 状态
  state = {
    submitLoading: false, // 按钮loading
    sendStatus: false // 是否发送验证码
  }

  // 发送修改密码时发送验证码所需参数
  passwordReq() {
    return new Promise((resolve, reject) => {
      if (this.props.info) {
        const info = {
          uri: this.props.info.phoneNumber,
          type: 'edit_login_pwd'
        }
        resolve(info)
      } else {
        reject()
      }
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
        this.setState({submitLoading: true})
        resetPassword(values).then(() => {
          this.setState({submitLoading: false})
          sessionStorage.clear();
          message.success('修改密码成功，请重新登录！')
          this.props.history.push('/login')
        }).catch(() => {
          this.setState({submitLoading: false})
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
    const { submitLoading } = this.state
    return (
      <Form className="passwordForm" labelCol={{span: 5}} wrapperCol={{span: 16}}>
        <Form.Item label="旧密码">
          {getFieldDecorator('oldPassword', {
            rules: [
              { required: true, message: '请输入旧密码!' },
              {
                pattern: /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,16}$/,
                message: '密码为8-16位,必须包含字母、数字、特殊字符的两种'
              }
            ]
          })(
            <Input size="large" type="password" placeholder="旧密码" />
          )}
        </Form.Item>
        <Form.Item label="新密码">
          {getFieldDecorator('newPassword', {
            rules: [
              { required: true, message: '请输入新密码!' },
              {
                pattern: /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,16}$/,
                message: '密码为8-16位,必须包含字母、数字、特殊字符的两种'
              }
            ]
          })(
            <Input size="large" type="password" placeholder="新密码" />
          )}
        </Form.Item>
        <Form.Item label="验证码">
          {getFieldDecorator('verifyCode', {
            rules: [
              { required: true, message: '请输入验证码!' },
              { pattern: /^\d*$/, message: '验证码为数字' }
            ],
          })(
            <div>
              <div className="fr">
                <SendCode changeSendStatus={this.changeSendStatus.bind(this)} promise={this.passwordReq.bind(this)} />
              </div>
              <Input size="large" className="codeInput" placeholder="验证码" />
            </div>
          )}
        </Form.Item>
        <div className="btnBox">
          <Button size="large" onClick={this.handleSubmit} type="primary" loading={submitLoading}>提交</Button>
        </div>
      </Form>
    );
  }
}
const PasswordForm = Form.create({ name: 'login' })(withRouter(Form1));

// 个人信息
class Person extends Component {
  // 渲染
  render() {
    const {info} = this.props
    return (
      <div className="person">
        <table>
          <tbody>
            <tr>
              <td align="right">账号：</td>
              <td>{info.account}</td>
            </tr>
            <tr>
              <td align="right">真实姓名：</td>
              <td>{info.realName}</td>
            </tr>
            <tr>
              <td align="right">手机号：</td>
              <td>{info.phoneNumber}</td>
            </tr>
            <tr>
              <td align="right">邮箱：</td>
              <td>{info.emailAddress}</td>
            </tr>
          </tbody>
        </table>        
      </div>
    )
  }
}

export default class extends Component {
  static contextType = MyContext

  // 渲染
  render() {
    const {userInfo} = this.context
    return (
      <Tabs className="pageTab pro-account">
        <TabPane tab="个人信息" key="1"><Person info={userInfo} /></TabPane>
        <TabPane tab="修改密码" key="2"><PasswordForm info={userInfo} /></TabPane>
      </Tabs>
    );
  }
}