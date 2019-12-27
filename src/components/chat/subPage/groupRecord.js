import React, { Component } from 'react'
import { Tabs } from 'antd'
import AllRecord from './allRecord'
import PicRecord from './picRecord'
import './record.scss'

const TabPane = Tabs.TabPane;

export default class extends Component {
  constructor(props) {
    super(props)

    const info = this.props.location.state ? this.props.location.state.item : {}

    this.state = {
      info
    }
  }

  // 渲染
  render() {
    const {info} = this.state

    return (
      <div>
        <div className="pageTitle">群聊记录（群ID：{info.roomId}）</div>
        <Tabs tabPosition="left">
          <TabPane tab="全部" key="1"><AllRecord info={info} type="group" /></TabPane>
          <TabPane tab="图片" key="2"><PicRecord info={info} type="group" /></TabPane>
        </Tabs>
      </div>
    )
  }
}