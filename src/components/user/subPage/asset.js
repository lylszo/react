import React, { Component } from 'react'
import { getUserAsset } from '@/axios'
import { Table } from 'antd'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      tableList: [], // 表格数据
      tableLoading: false, // 表格loading
      statistic: {}, // 统计数据
    }
  }

  // 获取列表
  getList() {
    this.setState({tableLoading: true})
    getUserAsset(this.state.id).then(data => {
      let result = data.data.items || []
      if (result.length) {
        result.forEach(v => {
          if (v.coinCode === 'YBT') {
            let o = {
              locked: v.locked,
              frozenEarnings: v.frozenEarnings
            }
            this.setState({statistic: o})
          }
        })
      }
      this.setState({tableList: result, tableLoading: false})
    })
  }

  // 列表项
  getColumns() {
    return [
      {
        title: '币种',
        dataIndex: 'coinCode'
      }, {
        title: '余额',
        dataIndex: 'assets',
        render: (text) => (text || '-')
      }, {
        title: '可用余额',
        dataIndex: 'balance',
        render: (text) => (text || '-')
      }, {
        title: '交易中',
        dataIndex: 'frozen',
        render: (text) => (text || '-')
      }, {
        title: '充币地址',
        dataIndex: 'address',
        render: (text) => (text || '-')
      }, {
        title: '地址标签',
        dataIndex: 'addressTag',
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
    const {tableList, tableLoading, statistic} = this.state

    return (
      <div>
        <div>
          <span className="mr25">冻结USD：{statistic.locked}</span>
          <span className="mr25">冻结YBT：{statistic.frozenEarnings}</span>
        </div>      
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={false}
          columns={this.getColumns()} />
      </div>
    );
  }
}