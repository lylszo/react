import React, { Component } from 'react'
import { Form, Input, Button, message, Switch } from 'antd'
import { getSmartFeeSet, saveSmartFeeSet } from '../../axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'

// 智能宝配置表单
const SmartForm = Form.create({ name: 'smartForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前版本详情
    }

    // 提交表单
    handleSubmit = () => {
      const {info:{id}} = this.state
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {...values, id}
          if (!params.maxAmount) {
            delete params.maxAmount
          }
          this.setState({submitLoading: true})
          saveSmartFeeSet(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getSmartFeeSet().then(data => {
        this.setState({info: data.data})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form className="centerForm" labelCol={{span: 5}} wrapperCol={{span: 16}}>
          <Form.Item label="违约天数">
            {getFieldDecorator('validityDay', {
              initialValue: info.validityDay === 0 ? '0' : (info.validityDay || ''),
              rules: [
                {pattern: /^\d*$/, message: '请输入数字'}
              ]
            })(
              <Input placeholder="违约天数" />
            )}
          </Form.Item>
          <Form.Item label="转出手续费率">
            {getFieldDecorator('outAllocation', {
              initialValue: info.outAllocation || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="转出手续费率" addonAfter="%" />
            )}
          </Form.Item>
          <Form.Item label="服务手续费率">
            {getFieldDecorator('serviceAllocation', {
              initialValue: info.serviceAllocaion || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="服务手续费率" addonAfter="%" />
            )}
          </Form.Item>
          <Form.Item label="违反手续费率">
            {getFieldDecorator('violationAllocation', {
              initialValue: info.violationAllocation || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="违反手续费率" addonAfter="%" />
            )}
          </Form.Item>
          <Form.Item label="智能宝最大存入限额">
            {getFieldDecorator('maxAmount', {
              initialValue: info.maxAmount || '',
              rules: [
                {required: true, message: '请输入最大存入限额'},
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="最大存入限额" addonAfter="USDT" />
            )}
          </Form.Item>
          <Form.Item label="是否开启">
            {getFieldDecorator('isOpen', {
              initialValue: info.isOpen || false,
              valuePropName: 'checked'
            })(
              <Switch
                disabled={!authList.filter(v => +v === 5019).length}
                checkedChildren="开"
                unCheckedChildren="关" />
            )}
          </Form.Item>
          {
            !!authList.filter(v => +v === 5019).length &&
            <div className="btnBox">
              <Button size="large" onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>            
          }
        </Form>
      )
    }
  }
))

export default class extends Component {
  static contextType = MyContext

  // 渲染
  render() {
    const {authList} = this.context

    return (
      <div>
        <div className="pageTitle">AI智能宝配置</div>
        <SmartForm authList={authList} />
      </div>
    );
  }
}