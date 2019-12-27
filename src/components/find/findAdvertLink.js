import React, { Component } from 'react'
import { Tabs } from 'antd'
import FindLinkSet from './subPage/findLinkSet'
import FindAdvertSet from './subPage/findAdvertSet'
import FindTypeManage from './subPage/findTypeManage'
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
    const auth1 = !!authList.filter(v => +v === 1204).length // 广告图权限
    const auth2 = !!authList.filter(v => +v === 1211).length // 链接权限
    const auth3 = !!authList.filter(v => +v === 1218).length // 分类管理权限

    // 渲染
    return <div>
      {
        (auth1 || auth2 || auth3) &&
        <Tabs className="pageTab" onChange={this.changeTab}>
          {auth1 && <TabPane tab="广告图设置" key="1"><FindAdvertSet key={tabKey.tab1} /></TabPane>}
          {auth3 && <TabPane tab="分类设置" key="3"><FindTypeManage key={tabKey.tab3} /></TabPane>}
          {auth2 && <TabPane tab="链接设置" key="2"><FindLinkSet key={tabKey.tab2} /></TabPane>}
        </Tabs>        
      }
    </div>
  }
}