import React, { Component } from 'react'
import { getCoinList, walletBalance } from '@/axios'
import { Table, Button } from 'antd'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      coinList: [], // 币种列表
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      coinLoading: false, // 币种列表loading
      searchLoading: false, // 查询loading
      addVisible: false, // 是否显示添加弹框
      addLoading: false, // 添加弹框确定loading
    }
  }

  // 查询币种对应钱包余额
  handleSearch = (item) => {
    this.setState({searchLoading: true})
    walletBalance(item.id).then(data => {
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
        title: '充币钱包余额',
        dataIndex: 'recharge',
        render: (text) => (text || '-')
      }, {
        title: '提币钱包余额',
        dataIndex: 'withdraw',
        render: (text) => (text || '-')
      }, {
        title: '冷钱包余额',
        dataIndex: 'cold',
        render: (text) => (text || '-')
      }, {
        title: '矿工费总额（提币与汇集）',
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
        <div className="pageTitle">平台钱包余额</div>
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