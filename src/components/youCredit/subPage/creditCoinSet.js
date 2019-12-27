import React, { Component } from 'react'
import { getYouCoinList, setYouCoin, setYouCoinAmount, setYouCoinLend } from '@/axios'
import { Table, Modal, message, Switch, Button, Input, Form } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm

// 编辑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title="编辑"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 8}} wrapperCol={{span: 14}}>
            <Form.Item label="贷款本金最小值">
              {getFieldDecorator('minLoan', {
                initialValue: item.minLoan || '',
                rules: [
                  {required: true, message: '请输入贷款本金最小值'},
                  {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                ]
              })(
                <Input placeholder="贷款本金最小值" addonAfter="USDT" />
              )}
            </Form.Item>
            <Form.Item label="贷款本金最大值">
              {getFieldDecorator('maxLoan', {
                initialValue: item.maxLoan || '',
                rules: [
                  {required: true, message: '请输入贷款本金最大值'},
                  {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                ]
              })(
                <Input placeholder="贷款本金最大值" addonAfter="USDT" />
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
      editVisible: false, // 是否显示编辑弹框
      editLoading: false, // 编辑弹框确定按钮loading
      currentItem: {}, // 当前编辑列表项
    }
  }

  // 获取列表
  getList = (page) => {
    const params = {page: page || 1}
    this.setState({tableLoading: true, currentPage: page})
    getYouCoinList(params).then(data => {
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
    if (!authList.filter(v => +v === 1112).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    if (type === 1) { // 是否开启质押币种
      let txt = item.isLoan ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinName}的质押功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            setYouCoin({id: item.id, isLoan: !item.isLoan}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.isLoan = !item.isLoan
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
    } else if (type === 2) { // 是否开启借款币种
      let txt = item.isLend ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinName}的借款功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            setYouCoinLend({id: item.id, isLend: !item.isLend}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.isLend = !item.isLend
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
        dataIndex: 'coinName',
        render: (text) => (text || '-')
      }, {
        title: '是否开启质押币种',
        render: item => {
          return <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onClick={() => this.handleSwitch(item, 1)}
                  checked={item.isLoan} />
        }
      }, {
        title: '是否开启借款币种',
        render: item => {
          return <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onClick={() => this.handleSwitch(item, 2)}
                  checked={item.isLend} />
        }
      }, {
        title: '贷款本金最小值',
        dataIndex: 'minLoan',
        render: (text) => (text || '-')
      }, {
        title: '贷款本金最大值',
        dataIndex: 'maxLoan',
        render: (text) => (text || '-')
      }
    ]

    const {authList} = this.context
    if (authList.filter(v => +v === 1113).length) {
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

  // 打开编辑弹框
  edit = (item) => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑确定
  onOkEdit = () => {
    const { currentItem, tableList } = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.maxLoan < +values.minLoan) {
        message.warning('贷款本金最大值要大于贷款本金最小值')
        return
      }
      let params = {...values, id: currentItem.id}
      this.setState({editLoading: true})
      setYouCoinAmount(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.id === currentItem.id) {
            v.minLoan = params.minLoan
            v.maxLoan = params.maxLoan
          }
        })
        this.setState({tableList: tableList2, editLoading: false})
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
      editVisible,
      editLoading,
      currentItem,
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