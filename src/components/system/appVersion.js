import React, { Component } from 'react'
import { Tabs, Form, Input, Button, message, Switch } from 'antd'
import { getAppVersion, editAppVersion } from '@/axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'

const TabPane = Tabs.TabPane;

// 版本配置表单
const AppForm = Form.create({ name: 'appForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前版本详情
    }

    // 提交表单
    handleSubmit = () => {
      const {type} = this.props
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {
            ...values,
            equipmentType: type,
            appType: 'MAIN'
          }
          this.setState({submitLoading: true})
          editAppVersion(params).then(() => {
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
      const { type } = this.props
      getAppVersion({equipmentType: type, appType: 'MAIN'}).then(data => {
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
          <Form.Item label="版本号">
            {getFieldDecorator('versionNumber', {
              initialValue: info.versionNumber || ''
            })(
              <Input placeholder="版本号" />
            )}
          </Form.Item>
          <Form.Item label="版本名">
            {getFieldDecorator('versionName', {
              initialValue: info.versionName || ''
            })(
              <Input placeholder="版本名" />
            )}
          </Form.Item>
          <Form.Item label="下载链接">
            {getFieldDecorator('downloadUrl', {
              initialValue: info.downloadUrl || ''
            })(
              <Input placeholder="下载链接" />
            )}
          </Form.Item>
          <Form.Item label="软件大小">
            {getFieldDecorator('appSize', {
              initialValue: info.appSize || ''
            })(
              <Input placeholder="软件大小" />
            )}
          </Form.Item>
          <Form.Item label="是否强制更新">
            {getFieldDecorator('forcedUpdate', {
              initialValue: info.forcedUpdate || false,
              valuePropName: 'checked'
            })(
              <Switch
                disabled={!authList.filter(v => +v === 7013).length}
                checkedChildren="开"
                unCheckedChildren="关" />
            )}
          </Form.Item>
          <Form.Item label="中文更新日志">
            {getFieldDecorator('logCh', {
              initialValue: info.logCh || ''
            })(
              <Input placeholder="中文更新日志" />
            )}
          </Form.Item>
          <Form.Item label="英文更新日志">
            {getFieldDecorator('logEn', {
              initialValue: info.logEn || ''
            })(
              <Input placeholder="英文更新日志" />
            )}
          </Form.Item>
          {
            !!authList.filter(v => +v === 7013).length &&
            <div className="btnBox">
              <Button size="large" onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>            
          }
        </Form>
      );
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

    // 渲染
    return (
      <Tabs className="pageTab pro-appVersion" onChange={this.changeTab}>
        <TabPane tab="IOS" key="1"><AppForm key={tabKey.tab1} type="IOS" authList={authList} /></TabPane>
        <TabPane tab="ANDROID" key="2"><AppForm key={tabKey.tab2} type="ANDROID" authList={authList} /></TabPane>
      </Tabs>
    );
  }
}