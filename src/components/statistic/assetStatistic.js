import React, { Component } from 'react'
import { assetStatistic, ybtStatistic } from '@/axios'
import moment from 'moment'
import { Table } from 'antd'
import { f_eventType } from '@/tool/filter'

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: this.props.id, // 当前用户id
      assetList: [], // 资产数据
      assetLoading: false, // 资产loading
      assetUpdate: '-', // 资产统计截止时间
      ybtList: [], // ybt列表数据
      ybtLoading: false, // ybt列表loading
      ybtUpdate: '-', // ybt统计截止时间
    }
  }

  // 资产列表项
  getAssetColumns() {
    return [
      {
        title: '币种',
        dataIndex: 'coinSymbol'
      }, {
        title: '可用余额',
        dataIndex: 'balance',
        render: (text) => (text || '-')
      }, {
        title: 'AI智能宝余额',
        dataIndex: 'smartBalance',
        render: (text) => (text || '-')
      }, {
        title: 'LARGE智能宝余额',
        dataIndex: 'largeSmartBalance',
        render: (text) => (text || '-')
      }, {
        title: '交易中金额',
        dataIndex: 'frozen',
        render: (text) => (text || '-')
      }, {
        title: '冻结USD',
        render: (item) => {
          if (item.coinSymbol === 'YBT') {
            return (item.locked || '0')
          } else {
            return '-'
          }
        }
      }, {
        title: '冻结YBT',
        render: (item) => {
          if (item.coinSymbol === 'YBT') {
            return (item.frozenEarnings || '0')
          } else {
            return '-'
          }
        }
      }
    ]
  }

  // ybt列表项
  getYbtColumns() {
    return [
      {
        title: '类型',
        dataIndex: 'event',
        render: (text) => (f_eventType[text] || text || '-')
      }, {
        title: '总计',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }
    ]
  }

  // 渲染前
  componentWillMount() {
    // 获取资产列表
    this.setState({assetLoading: true})
    assetStatistic().then(data => {
      let result = data.data.items || []
      let time = result.length ? moment(result[0].updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'
      this.setState({assetList: result, assetUpdate: time, assetLoading: false})
    }).catch(() => {
      this.setState({assetLoading: false})
    })
    // 获取ybt列表
    this.setState({ybtLoading: true})
    ybtStatistic().then(data => {
      let result = data.data.items || []
      let time = result.length ? moment(result[0].updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'
      this.setState({ybtList: result, ybtUpdate: time, ybtLoading: false})
    }).catch(() => {
      this.setState({ybtLoading: false})
    })
  }

  // 渲染
  render() {
    const {assetList, assetLoading, ybtLoading, ybtList, assetUpdate, ybtUpdate} = this.state

    return (
      <div>
        <div className="pageTitle">资产统计</div>
        <div>截止时间：{assetUpdate}</div>      
        <Table
          loading={assetLoading}
          rowKey={(record, i) => i}
          dataSource={assetList}
          pagination={false}
          columns={this.getAssetColumns()} />

        <div className="pageTitle mt40">YBT释放统计</div>
        <div>截止时间：{ybtUpdate}</div>      
        <Table
          loading={ybtLoading}
          rowKey={(record, i) => i}
          dataSource={ybtList}
          pagination={false}
          columns={this.getYbtColumns()} />
      </div>
    );
  }
}