import React, { Component } from 'react'
import { Form, Input, Button, message, Tabs } from 'antd'
import { gcSetInfo, gcSetEdit } from '../../axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'
import GlobalCardAdvertSet from './subPage/globalCardAdvertSet'
import GlobalCardCoinSet from './subPage/globalCardCoinSet'

const TabPane = Tabs.TabPane;

// 基础配置表单
const BaseForm = Form.create({ name: 'baseForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 配置详情信息
      tabKey: {}, // 标签key
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {
            openAccountFee: values.openFee,
            singleChargeMinAmount: values.minFee,
            globalpayChargeFeePercent: values.rate,
            openAccountFeeId: 11,
            singleChargeMinAmountId: 12,
            globalpayChargeFeePercentId: 13
          }
          this.setState({submitLoading: true})
          gcSetEdit(params).then(() => {
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
      gcSetInfo().then(data => {
        let arr = data.data || []
        let info = {}
        arr.forEach(v => {
          if (+v.id === 11) {
            info.openFee = v.configValue
          } else if (+v.id === 12) {
            info.minFee = v.configValue
          } else if (+v.id === 13) {
            info.rate = v.configValue
          }
        })
        this.setState({
          info: {...info}
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
          <Form.Item label="开户费">
            {getFieldDecorator('openFee', {
              initialValue: info.openFee || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="开户费" addonAfter="美元"/>
            )}
          </Form.Item>
          <Form.Item label="单笔充值最低限额">
            {getFieldDecorator('minFee', {
              initialValue: info.minFee || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="单笔充值最低限额" addonAfter="美元"/>
            )}
          </Form.Item>
          <Form.Item label="充值手续费率">
            {getFieldDecorator('rate', {
              initialValue: info.rate || '',
              rules: [
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="充值手续费率" addonAfter="%"/>
            )}
          </Form.Item>
          {
            !!authList.filter(v => +v === 1312).length &&
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
        {!!authList.filter(v => +v === 1310).length && <TabPane tab="基础设置" key="1"><BaseForm key={tabKey.tab1} authList={authList} /></TabPane>}
        {!!authList.filter(v => +v === 1315).length && <TabPane tab="广告图设置" key="2"><GlobalCardAdvertSet key={tabKey.tab2} /></TabPane>}
        {!!authList.filter(v => +v === 1322).length && <TabPane tab="币种配置" key="3"><GlobalCardCoinSet key={tabKey.tab3} /></TabPane>}
      </Tabs>
    );
  }
}