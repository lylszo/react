import React, { Component } from 'react'
import { getUserAsset, getReconciliation } from '@/axios'
import { Table, Button } from 'antd'
import { f_encodeId } from '@/tool/filter'
import MyContext from '@/tool/context'

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    this.state = {
      userId: props.location.state.userId, // 当前用户id（未加密）
      tableList: [], // 表格数据
      tableLoading: false, // 表格loading
    }
  }

  // 获取列表
  getList = () => {
    this.setState({tableLoading: true})
    getUserAsset(this.state.userId).then(data => {
      let result = data.data.items || []
      this.setState({tableList: result, tableLoading: false})
    }).catch(() => {
      this.setState({tableLoading: false})
    })
  }

  // 获取对账详情
  getDetail = item => {
    const {userId} = this.state
    let params = {
      userId,
      coinId: item.coinId
    }
    this.setItem(item, {loading: true})
    getReconciliation(params).then(data => {
      const result = data.data || {}
      this.setItem(item, {
        availableAsset: result.availableAsset,
        frozenAsset: result.frozenAsset,
        loading: false
      })
    }).catch(() => {
      this.setItem(item, {loading: false})
    })
  }

  // 跳转资金流水页面
  toDetail = item => {
    this.props.history.push({
      pathname: '/assetRecord',
      state: {
        userId: f_encodeId(this.state.userId),
        coinId: item.coinId
      }
    })
  }

  // 设置对应列表项的值
  setItem = (item, val) => {
    const {tableList} = this.state
    let newList = tableList.map(v => {
      if (+v.coinId === +item.coinId) {
        v = {...v, ...val}
      }
      return v
    })
    this.setState({tableList: newList})
  }

  // 列表项
  getColumns() {
    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 4004).length // 查看资金流水列表权限
    return [
      {
        title: '币种',
        dataIndex: 'coinCode'
      }, {
        title: '可用',
        dataIndex: 'balance',
        render: (text) => (text || '-')
      }, {
        title: '冻结',
        dataIndex: 'frozen',
        render: (text) => (text || '-')
      }, {
        title: '可用差额',
        dataIndex: 'availableAsset',
        render: (text) => (text || '-')
      }, {
        title: '冻结差额',
        dataIndex: 'frozenAsset',
        render: (text) => (text || '-')
      }, {
        title: '操作',
        width: auth1 ? 140 : 90,
        render: item => {
          return (
            <div>
              <Button size="small" onClick={() => this.getDetail(item)} loading={item.loading}>对账</Button>
              { auth1 && <Button size="small" onClick={() => this.toDetail(item)}>明细</Button> }
            </div>
          )
        }
      },
    ]
  }

  // 渲染前
  componentWillMount() {
    this.getList()
  }

  // 渲染
  render() {
    const {tableList, tableLoading, userId} = this.state

    return (
      <div>
        <div className="pageTitle">资产核对（用户ID：{f_encodeId(userId)}）</div>
        <div className="clearfix mb5">
          <Button className="fr" onClick={this.getList} loading={tableLoading}>刷新</Button>
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