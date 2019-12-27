import React, { Component } from 'react'
import { Button, message } from 'antd'
import initCaptchat from '@/tool/initGeet'
import { sendCode } from '@/axios'

// 获取验证码
export default class extends Component {
  // 状态
  state = {
    text: '获取验证码',
    loading: false,
    num: 60,
    disabled: false,
    timer: null
  }

  // 点击获取验证码
  getCode = () => {
    this.setState({loading: true, text: '获取中...'})
    /*
      通过外部promise传入包含uri和type的对象，用于发送验证码的参数
      例如：promise return {uri: '+8613988886666', type: 'login'}
    */
    this.props.promise().then(info => {
      this.geetAndSend(info)
    }).catch(() => {
      this.setState({loading: false, text: '获取验证码'})
    })
  }


  // 极验+发送验证码
  geetAndSend(info) {
    initCaptchat().then(data => {
      let params = {
        uri: info.uri,
        type: info.type,
        challenge: data.geetest_challenge,
        seccode: data.geetest_seccode,
        validate: data.geetest_validate
      }
      sendCode(params).then(() => {
        this.setState({loading: false, disabled: true, text: `${this.state.num} 秒`})
        this.countDown()
        this.props.changeSendStatus && this.props.changeSendStatus() // 如果有需要发送成功后就通知父组件一声
        message.success('已发送!')         
      }).catch(() => {
        this.setState({loading: false, text: '获取验证码'})
      })
    }).catch(() => {
      this.setState({loading: false, text: '获取验证码'})
    })
  }

  // 倒计时
  countDown = () => {
    const timer = setInterval(() => {
      if (this.state.num !== 1) {
        let next = this.state.num - 1
        this.setState({num: next, text: `${next} 秒`})
      } else {
        this.setState({num: 60, text: '重新获取', disabled: false})
        clearInterval(timer)
      }
    }, 1000)
    this.setState({timer: timer})
  }
  
  // 取消定时器
  componentWillUnmount() {
    clearInterval(this.state.timer)
  }

  // 渲染
  render() {
    const { text, loading, disabled } = this.state
    return (
      <Button
        size="large"
        style={{width:'112px',textAlign: 'center'}}
        disabled={disabled}
        onClick={this.getCode}
        loading={loading}>
        {text}
      </Button>
    );
  }
}