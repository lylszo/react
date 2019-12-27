import React, { Component } from 'react'
import { Tabs } from 'antd'
import AllRecord from './allRecord'
import PicRecord from './picRecord'
import { f_encodeId } from '@/tool/filter'
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
        <div className="pageTitle">个人聊天记录（{`ID：${f_encodeId(info.info.id)}，好友ID：${f_encodeId(info.id)}`}）</div>
        <Tabs tabPosition="left">
          <TabPane tab="全部" key="1"><AllRecord type="personal" info={info}/></TabPane>
          <TabPane tab="图片" key="2"><PicRecord type="personal" info={info}/></TabPane>
        </Tabs>
      </div>
    )
  }
}