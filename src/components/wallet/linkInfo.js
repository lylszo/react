import React, { Component } from 'react'
import { getLinkList, getLinkDetail, editLink } from '@/axios'
import { Table, Form, Input, Button, Modal, message, Switch } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'

// 编辑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = `编辑（钱包类型：${item.chainSymbol}）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 7}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="充币确认次数">
              {getFieldDecorator('rcTimes', {
                initialValue: item.rcTimes || '',
                rules: [
                  { required: true, message: '请输入充币确认次数' },
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="充币确认次数" />
              )}
            </Form.Item>
            <Form.Item label="提币确认次数">
              {getFieldDecorator('wcTimes', {
                initialValue: item.wcTimes || '',
                rules: [
                  { required: true, message: '请输入提币确认次数' },
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="提币确认次数" />
              )}
            </Form.Item>
            <Form.Item label="哈希url">
              {getFieldDecorator('txidUrl', {
                initialValue: item.txidUrl || ''
              })(
                <Input placeholder="哈希url" />
              )}
            </Form.Item>
            <Form.Item label="地址url">
              {getFieldDecorator('addressUrl', {
                initialValue: item.addressUrl || ''
              })(
                <Input placeholder="地址url" />
              )}
            </Form.Item>
            <Form.Item label="地址正则">
              {getFieldDecorator('addressRegular', {
                initialValue: item.addressRegular || ''
              })(
                <Input placeholder="地址正则" />
              )}
            </Form.Item>
            <Form.Item label="地址标签开关">
              {getFieldDecorator('addressTag', {
                initialValue: item.addressTag || false,
                valuePropName: 'checked'
              })(
                <Switch 
                  checkedChildren="开"
                  unCheckedChildren="关" />
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
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? {...searchParams, page: currentPage} : {...this.state.currentParams, page: currentPage}
    this.setState({tableLoading: true, currentPage: currentPage})
    getLinkList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 打开编辑弹框
  edit = (item) => {
    getLinkDetail(item.id).then(data => {
      this.setState({currentItem: data.data})
    })
    this.setState({editVisible: true})
  }

  // 编辑确定
  onOkEdit = () => {
    const { currentItem } = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({editLoading: true})
      editLink(currentItem.id, params).then(() => {
        this.setState({editLoading: false})
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
        title: '钱包类型',
        dataIndex: 'chainSymbol',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '是否初始化',
        dataIndex: 'initialized',
        render: (text) => (text ? '是' : '否')
      }
    ]

    const {authList} = this.context
    if (authList.filter(v => +v === 3034).length) {
      columns.push({
        title: '操作',
        dataIndex: '',
        width: 120,
        render: item => {
          return <Button size="small" onClick={() => this.edit(item)}>编辑</Button>
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
        <div className="pageTitle">链信息</div>
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