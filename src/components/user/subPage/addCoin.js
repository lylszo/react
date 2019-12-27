import React, { Component } from 'react'
import { getRechargeList } from '@/axios'
import { Table } from 'antd'
import moment from 'moment'
import { f_rechargeStatus } from '@/tool/filter'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      tableList: [], // 表格数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false // 表格loading
    }
  }

  // 获取列表
  getList = (page) => {
    page = page || 1
    this.setState({tableLoading: true, currentPage: page})
    getRechargeList({page: page, accountId: this.state.id}).then(data => {
      this.setState({
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false
      })
    })
  }

  // 列表项
  getColumns() {
    return [
      {
        title: '充值编号',
        dataIndex: 'id'
      },
      {
        title: '币种',
        dataIndex: 'shortName'
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '完成时间',
        dataIndex: 'completedAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_rechargeStatus[text] || '-')
      }, {
        title: '确认次数',
        dataIndex: 'confirmedTimes',
        render: (text) => (text || '-')
      }
    ]
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {tableList, tableLoading, currentPage, meta} = this.state
    const pageSet = {
      showQuickJumper: true,
      defaultCurrent: 1,
      total: meta.totalCount,
      onChange: this.getList,
      current: currentPage,
      showTotal: total => `共${total}条`,
      size: 'small'
    }

    return (
      <div>     
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          expandedRowRender={record => (
            <div className="tal pl30">
              <div>地址标签：{record.addressTag || '-'}</div>
              <div>来源地址：{record.address || '-'}</div>
              <div>交易哈希：{record.txid || '-'}</div>
            </div>
          )}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}