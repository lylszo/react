import React, { Component } from 'react'
import { Form, Input, Button, message, Tabs, Radio } from 'antd'
import { lsBaseSetDetail, lsBaseSetSave } from '../../axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'
import LargeSmartCoinSet from './subPage/largeSmartCoinSet'
import LargeSmartRevenueSet from './subPage/largeSmartRevenueSet'

const TabPane = Tabs.TabPane;

// 基础配置表单
const BaseForm = Form.create({ name: 'baseForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {isQuota: '0'}, // 配置详情信息
      originInfo: {}, // 记录原来的基础配置详情信息
      tabKey: {}, // 标签key
    }

    // 提交表单
    handleSubmit = () => {
      const {originInfo} = this.state
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {
            ...values,
            id: originInfo.id,
            isQuota: +values.isQuota === 1 ? true : false
          }
          if (!params.isQuota) {
            params.maxAmount = originInfo.maxAmount
          }
          this.setState({submitLoading: true})
          lsBaseSetSave(params).then(() => {
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
      lsBaseSetDetail().then(data => {
        let info = data.data ? {...data.data} : {}
        if (!info.isQuota) {
          info.maxAmount = ''
        }
        this.setState({
          info: {...info, isQuota: info.isQuota ? '1' : '0'},
          originInfo: data.data || {}
        })
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form className="centerForm" labelCol={{span: 5}} wrapperCol={{span: 16}}>
          <Form.Item label="转出手续费率">
            {getFieldDecorator('outFee', {
              initialValue: info.outFee || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="转出手续费率" addonAfter="%" />
            )}
          </Form.Item>
          <Form.Item label="服务费率">
            {getFieldDecorator('serviceFee', {
              initialValue: info.serviceFee || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="服务费率" addonAfter="%" />
            )}
          </Form.Item>
          <Form.Item label="最大存入是否限额">
            {getFieldDecorator('isQuota', {
              initialValue: info.isQuota || '1',
              getValueFromEvent: event => {
                const val = event.target.value || '1'
                this.setState({info: {...info, isQuota: val}})
                return val
              },
              rules: [
                {required: true, message: '请选择是否限额'}
              ]
            })(
              <Radio.Group>
                <Radio value="1">限额</Radio>
                <Radio value="0" className="ml30">不限额</Radio>
              </Radio.Group>
            )}
          </Form.Item>
          {
            +info.isQuota === 1 && 
            <Form.Item label="最大存入限额">
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
          }
          {
            !!authList.filter(v => +v === 9006).length &&
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

  state = {
    tabKey: {}
  }

  // 切换标签
  changeTab = (activeKey) => {
    let o = {...this.state.tabKey}
    o[`tab${activeKey}`] = (o[`tab${activeKey}`] || 0) + 1
    this.setState({tabKey: o})
  }

  // 渲染
  render() {
    const {tabKey} = this.state
    const {authList} = this.context

    return (
      <Tabs className="pageTab" onChange={this.changeTab}>
        {!!authList.filter(v => +v === 9004).length && <TabPane tab="基础设置" key="1"><BaseForm key={tabKey.tab1} authList={authList} /></TabPane>}
        {!!authList.filter(v => +v === 9009).length && <TabPane tab="收益类型设置" key="2"><LargeSmartRevenueSet key={tabKey.tab2} /></TabPane>}
        {!!authList.filter(v => +v === 9015).length && <TabPane tab="币种配置" key="3"><LargeSmartCoinSet key={tabKey.tab3} /></TabPane>}
      </Tabs>
    );
  }
}