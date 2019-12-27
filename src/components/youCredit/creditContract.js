import React, { Component } from 'react'
import { Tabs } from 'antd'
import CreditCoinSet from './subPage/creditCoinSet'
import CreditManage from './subPage/creditManage'
import MyContext from '@/tool/context'

const TabPane = Tabs.TabPane;

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
    const auth1 = !!authList.filter(v => +v === 1104).length // 合约管理权限
    const auth2 = !!authList.filter(v => +v === 1110).length // 币种配置权限

    // 渲染
    return <div>
      {
        (auth1 || auth2) &&
        <Tabs className="pageTab" onChange={this.changeTab}>
          {auth1 && <TabPane tab="合约管理" key="1"><CreditManage key={tabKey.tab1} /></TabPane>}
          {auth2 && <TabPane tab="币种配置" key="2"><CreditCoinSet key={tabKey.tab2} /></TabPane>}
        </Tabs>        
      }
    </div>
  }
}