import React, { Component } from 'react'
import { userStatistic } from '@/axios'
import { Table } from 'antd'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [], // 用户统计数据
      loading: true, // 表格loading
    }
  }

  // 用户统计列表项
  getColumns() {
    return [
      {
        title: '用户人数',
        dataIndex: 'allUsersSum',
        render: (text) => (text || 0)
      }, {
        title: '有效用户人数',
        dataIndex: 'effectedUsersSum',
        render: (text) => (text || 0)
      }, {
        title: '普通节点人数',
        dataIndex: 'ordinalNodeSum',
        render: (text) => (text || 0)
      }, {
        title: '超级节点人数',
        dataIndex: 'superNodeSum',
        render: (text) => (text || 0)
      }
    ]
  }

  // 社区用户统计列表项
  getVipColumns() {
    return [
      {
        title: 'V1社区',
        dataIndex: 'v1CommunitySum',
        render: (text) => (text || 0)
      }, {
        title: 'V2社区',
        dataIndex: 'v2CommunitySum',
        render: (text) => (text || 0)
      }, {
        title: 'V3社区',
        dataIndex: 'v3CommunitySum',
        render: (text) => (text || 0)
      }, {
        title: 'V4社区',
        dataIndex: 'v4CommunitySum',
        render: (text) => (text || 0)
      }, {
        title: 'V5社区',
        dataIndex: 'v5CommunitySum',
        render: (text) => (text || 0)
      }
    ]
  }

  // 新增用户统计列表项
  getAddColumns() {
    return [
      {
        title: '今日新增',
        dataIndex: 'todayNewUser',
        render: (text) => (text || 0)
      }, {
        title: '昨日新增',
        dataIndex: 'yesterdayNewUser',
        render: (text) => (text || 0)
      }, {
        title: '前日新增',
        dataIndex: 'beforeYesterdayNewUser',
        render: (text) => (text || 0)
      }, {
        title: '本周新增',
        dataIndex: 'thisWeekNewUser',
        render: (text) => (text || 0)
      }, {
        title: '上周新增',
        dataIndex: 'lastWeekNewUser',
        render: (text) => (text || 0)
      }, {
        title: '本月新增',
        dataIndex: 'thisMonthNewUser',
        render: (text) => (text || 0)
      }, {
        title: '上月新增',
        dataIndex: 'lastMonthNewUser',
        render: (text) => (text || 0)
      }
    ]
  }

  // 渲染前
  componentWillMount() {
    // 获取资产列表
    userStatistic().then(data => {
      let result = data.data || {}
      this.setState({list: [result], loading: false})
    }).catch(() => {
      this.setState({loading: false})
    })
  }

  // 渲染
  render() {
    const {loading, list} = this.state

    return (
      <div>
        <div className="pageTitle">用户概述</div>
        <Table
          loading={loading}
          rowKey={(record, i) => i}
          dataSource={list}
          pagination={false}
          columns={this.getColumns()} />

        <div className="pageTitle mt40">社区用户概述</div>
        <Table
          loading={loading}
          rowKey={(record, i) => i}
          dataSource={list}
          pagination={false}
          columns={this.getVipColumns()} />

        <div className="pageTitle mt40">用户新增概述</div>
        <Table
          loading={loading}
          rowKey={(record, i) => i}
          dataSource={list}
          pagination={false}
          columns={this.getAddColumns()} />
      </div>
    );
  }
}