import React, { Component } from 'react'
import { lsReleaseList } from '@/axios'
import { Table } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'
import { f_eventType, f_encodeId, f_largeSmartStatus } from '@/tool/filter'

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    const info = this.props.location.state ? this.props.location.state.item : {}
    
    this.state = {
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      info, // 当前用户信息
      currentTotal: 0, // 已产生收益
    }
  }

  // 列表项
  getColumns() {
    return [
      {
        title: '用户ID',
        dataIndex: 'accountId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '手机号码',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '币种',
        dataIndex: 'coinCode',
        render: (text) => (text || '-')
      }, {
        title: '收益类型',
        dataIndex: 'revenueType',
        render: (text) => (f_eventType[text] || '-')
      }, {
        title: '金额',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '发放时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }
    ]
  }

  // 获取智能宝列表
  getList = (page) => {
    const {info} = this.state
    const params ={page, pageSize: 10, traceId: info.id}
    this.setState({tableLoading: true, currentPage: page})
    lsReleaseList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
        currentTotal: data.data.totalCount
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {
      info,
      meta,
      currentPage,
      tableLoading,
      tableList,
      currentTotal,
    } = this.state
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
      <div className="pro-userDetail">
        <div className="pageTitle">LARGE智能宝详情</div>
        <div style={{border: '1px dashed gray', borderRadius: '5px', padding: '20px 20px 5px'}}>
          <table style={{width: '80%', marginLeft: '1%'}}>
            <tbody>
              <tr>
                <td>
                  <p>用户ID： {+info.accountId ? f_encodeId(info.accountId) : '-'}</p>
                  <p>姓名： {info.realName || '-'}</p>
                  <p>手机号码： {info.phone || '-'}</p>
                  <p>邮箱： {info.email || '-'}</p>
                  <p>存入时间： {info.depositDate ? moment(info.depositDate).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
                  <p>到期时间： {info.expirationDate ? moment(info.expirationDate).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
                </td>
                <td>
                  <p>币种： {info.coinCode || '-'}</p>
                  <p>存入金额： {info.amount || '-'}</p>
                  <p>收益率： {info.rate ? `${info.rate}%` : '-'}</p>
                  <p>合约时间： {info.days ? `${info.days}天` : '-'}</p>
                  <p>状态： {f_largeSmartStatus[info.status] || '-'}</p>
                  <p>已产生收益： {currentTotal || 0} YBT</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="fs16 bold mt30 mb10">收益明细</div>
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}