import React, { Component } from 'react'
import { Tabs} from 'antd'
import BaseCoinSet from './subPage/baseCoinSet'
import SmartCoinSet from './subPage/smartCoinSet'
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
    const auth1 = !!authList.filter(v => +v === 3020).length // 基础钱包设置权限
    const auth2 = !!authList.filter(v => +v === 3027).length // AI智能宝钱包设置权限

    // 渲染
    return <div>
      {
        (auth1 || auth2) &&
        <Tabs className="pageTab" onChange={this.changeTab}>
          {auth1 && <TabPane tab="基础钱包设置" key="1"><BaseCoinSet key={tabKey.tab1} /></TabPane>}
          {auth2 && <TabPane tab="AI智能宝钱包设置" key="2"><SmartCoinSet key={tabKey.tab2} /></TabPane>}
        </Tabs>        
      }
    </div>
  }
}