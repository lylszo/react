import React, { Component } from 'react'
import { getCoinMarket, editCoinMarket } from '@/axios'
import { Table, Form, Input, Button, Modal, message } from 'antd'
import MyContext from '@/tool/context'

// 编辑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = `编辑行情（币种：${item.coinSymbol}）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="兑换价格">
              {getFieldDecorator('latestPrice', {
                initialValue: item.latestPrice || '',
                rules: [
                  { required: true, message: '请输入当前兑换USDT价格' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="当前兑换USDT价格" />
              )}
            </Form.Item>
            <Form.Item label="24H涨跌幅">
              {getFieldDecorator('chg', {
                initialValue: item.chg || '',
                rules: [
                  { required: true, message: '请输入24H涨跌幅' },
                  { pattern: /^[0-9]*(\.[0-9]{0,6})?$/, message: '请输入数字，支持6位小数' }
                ]
              })(
                <Input placeholder="24H涨跌幅" addonAfter="%"/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

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
      currentParams: {}, // 当前查询参数
      editVisible: false, // 是否显示编辑弹框
      editLoading: false, // 编辑弹框确认loading
      currentItem: {}, // 当前编辑项
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['operation', 'event', 'currencyId'] // 下拉选择的参数
      for (let key in pageOrSearch) {
        if (!pageOrSearch[key] || (selectKeys.filter(v => v === key).length && pageOrSearch[key] === '-1')) {
          delete pageOrSearch[key]
        }
      }
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? {...searchParams, page: currentPage} : {...this.state.currentParams, page: currentPage}
    this.setState({tableLoading: true, currentPage: currentPage})
    getCoinMarket(params).then(data => {
      let list = data.data.items || []
      list.forEach(v => {
        v.chg = v.chg.slice(0, -2)
      })
      this.setState({
        currentParams: params,
        tableList: list,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 打开编辑弹框
  edit = (item) => {
    this.setState({editVisible: true, currentItem: item})
  }

  // 编辑确定
  onOkEdit = () => {
    const { currentItem } = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ...values,
        coinId: currentItem.id,
        coinSymbol: currentItem.coinSymbol
      }
      let showNum = params.chg
      if (+showNum) {
        let pointNum = /\./.test(showNum) ? `${showNum}00000000` : `${showNum}.00000000`
        // 保留8位小数传给后台
        let num = (+pointNum/100).toFixed(16)
        let matchArr8 = /^(\d*)\.(\d*)$/.exec(num)
        let pointBefore8 = matchArr8[1]
        let pointAfter8 = matchArr8[2] ? `${matchArr8[2]}00000000`.slice(0, 8) : '00000000'
        params.chg = pointBefore8 + '.' + pointAfter8
        // 保留6位小数修改已编辑数据
        let matchArr6 = /^(\d*)\.(\d*)$/.exec(pointNum)
        let pointBefore6 = matchArr6[1]
        let pointAfter6 = matchArr6[2] ? `${matchArr6[2]}000000`.slice(0, 6) : '000000'
        showNum = pointBefore6 + '.' + pointAfter6
      }
      this.setState({editLoading: true})
      editCoinMarket(params).then(() => {
        let list = [...this.state.tableList]
        list.forEach(v => {
          if (v.id === currentItem.id) {
            v.latestPrice = params.latestPrice
            v.chg = showNum
          }
        })
        this.setState({tableList: list, editLoading: false})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '币种ID',
        dataIndex: 'id'
      }, {
        title: '币种标识',
        dataIndex: 'coinSymbol',
        render: (text) => (text || '-')
      }, {
        title: '当前兑换USDT价格',
        dataIndex: 'latestPrice',
        render: (text) => (text || '-')
      }, {
        title: '24小时涨跌幅',
        dataIndex: 'chg',
        render: (text) => (`${text}%` || '-')
      }
    ]
    const {authList} = this.context
    if (authList.filter(v => +v === 3017).length) {
      columns.push({
        title: '操作',
        dataIndex: '',
        width: 120,
        render: item => {
          if (+item.id === 1) {
            return <Button size="small" onClick={() => this.edit(item)}>编辑</Button>
          } else {
            return '-'
          }
        }
      })
    }
    return columns
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {tableList, meta, tableLoading, currentPage, editVisible, editLoading, currentItem} = this.state
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
        <div className="pageTitle">币种行情</div>
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 编辑弹框 */}
        <EditModal
          ref="editModal"
          item={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />

      </div>
    );
  }
}