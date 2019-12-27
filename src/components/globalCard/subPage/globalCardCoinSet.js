import React, { Component } from 'react'
import { getCoinList, gcOpenSwitch } from '@/axios'
import { Table, Modal, message, Switch } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    // 状态
    this.state = {
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      tableList: [], // 列表数据
    }
  }

  // 获取列表
  getList = (page) => {
    const params = {page: page || 1}
    this.setState({tableLoading: true, currentPage: page})
    getCoinList(params).then(data => {
      this.setState({
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 充提币开关、是否显示币种
  handleSwitch = (item, type) => {
    const {authList} = this.context
    if (!authList.filter(v => +v === 1324).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    if (type === 1) { // 是否开启LARGE智能宝
      let txt = item.isGlobalPay ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinSymbol}的充值全球卡功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            gcOpenSwitch(item.id, {isGlobalPay: !item.isGlobalPay}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.isGlobalPay = !item.isGlobalPay
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    }
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '币种ID',
        dataIndex: 'id'
      }, {
        title: '币种名称',
        dataIndex: 'coinSymbol',
        render: (text) => (text || '-')
      }, {
        title: '是否开启充值全球卡功能',
        render: item => {
          return <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onClick={() => this.handleSwitch(item, 1)}
                  checked={item.isGlobalPay} />
        }
      }
    ]
    return columns
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
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
      <div>
        <Table
          className="mt15"
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

      </div>
    );
  }
}