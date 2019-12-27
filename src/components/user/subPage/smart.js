import React, { Component } from 'react'
import { getUserSmartAsset, getUserLargeAsset } from '@/axios'
import { Table } from 'antd'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      tableList: [], // 表格数据
      tableLoading: false // 表格loading
    }
  }

  // 获取列表
  getList() {
    const {id} = this.state
    this.setState({tableLoading: true})

    Promise.all([getUserSmartAsset(id), getUserLargeAsset(id)]).then(result => {
      const list1 = result[0] ? result[0].data.items : []
      const list2 = result[1] ? result[1].data.items : []
      list1.forEach(v => {
        list2.forEach(w => {
          if (w.coinCode === v.coinCode) {
            v.largeSmartAssets = w.smartAssets
          }
        })
      })
      this.setState({tableList: list1, tableLoading: false})
    })
  }

  // 列表项
  getColumns() {
    return [
      {
        title: '币种',
        dataIndex: 'coinCode'
      }, {
        title: 'AI智能宝余额',
        dataIndex: 'smartAssets',
        render: (text) => (text || '-')
      }, {
        title: 'LARGE智能宝余额',
        dataIndex: 'largeSmartAssets',
        render: (text) => (text || '-')
      }
    ]
  }

  // 渲染前
  componentWillMount() {
    this.getList()
  }

  // 渲染
  render() {
    const {tableList, tableLoading} = this.state

    return (
      <Table
        loading={tableLoading}
        rowKey={(record, i) => i}
        dataSource={tableList}
        pagination={false}
        columns={this.getColumns()} />
    );
  }
}