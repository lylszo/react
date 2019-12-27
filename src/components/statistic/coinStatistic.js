import React, { Component } from 'react'
import { getCoinList, coinStatistic } from '@/axios'
import { Table, Button } from 'antd'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      coinList: [], // 币种列表
      coinLoading: false, // 币种列表loading
      searchLoading: false, // 查询loading
    }
  }

  // 查询币种统计
  handleSearch = (item) => {
    this.setState({searchLoading: true})
    coinStatistic(item.id).then(data => {
      let info = data.data
      let newList = this.state.coinList.concat()
      newList.forEach(v => {
        if(v.id === item.id) {
          v = Object.assign(v, info)
        }
      })
      this.setState({coinList: newList, searchLoading: false})
    }).catch(() => {
      this.setState({searchLoading: false})
    })
  }

  // 列表项
  getColumns() {
    return [
      {
        title: '币种',
        dataIndex: 'coinSymbol'
      }, {
        title: '充币总计',
        dataIndex: 'recharge',
        render: (text) => (text || '-')
      }, {
        title: '提币总计',
        dataIndex: 'withdraw',
        render: (text) => (text || '-')
      }, {
        title: '手续费总计',
        dataIndex: 'fee',
        render: (text) => (text || '-')
      }, {
        title: '操作',
        width: 150,
        dataIndex: '',
        render: (item) => {
          return <Button size="small" onClick={this.handleSearch.bind(this, item)} loading={this.state.searchLoading}>查询</Button>
        }
      }
    ]
  }

  // 获取币种列表
  getList = page => {
    const params = {page: page || 1}
    this.setState({coinLoading: true, currentPage: page})
    getCoinList(params).then(data => {
      let result = data.data.items || []
      this.setState({
        coinList: result,
        coinLoading: false,
        meta: data.data.meta || {}
      })
    }).catch(() => {
      this.setState({coinLoading: false})
    })    
  }

  // 渲染前
  componentWillMount() {
    // 获取币种列表
    this.getList(1)
  }

  // 渲染
  render() {
    const {coinList, coinLoading, meta, currentPage} = this.state
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
        <div className="pageTitle">充提币统计</div>
        <Table
          loading={coinLoading}
          rowKey={(record, i) => i}
          dataSource={coinList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}