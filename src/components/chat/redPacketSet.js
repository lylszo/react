import React, { Component } from 'react'
import { testApi, getAllCoinList } from '@/axios'
import { Table, Form, Input, Button, message, Modal, Select } from 'antd'
import MyContext from '@/tool/context'

const {Option} = Select

// 添加红包配置弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, coinList } = this.props
      return (
        <Modal
          width="580px"
          title='添加红包配置'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="币种">
              {getFieldDecorator('coinId', {
                rules: [
                  {required: true, message: '请选择币种'}
                ]
              })(
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {
                    coinList.map(item => {
                      return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="最大红包数量">
              {getFieldDecorator('maxNum', {
                initialValue: '',
                rules: [
                  {required: true, message: '请输入最大红包数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="最大红包数量" />
              )}
            </Form.Item>
            <Form.Item label="最小红包数量">
              {getFieldDecorator('minNum', {
                initialValue: '',
                rules: [
                  {required: true, message: '请输入最小红包数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="最小红包数量" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑红包配置弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, coinList, currentItem } = this.props
      return (
        <Modal
          width="580px"
          title="编辑红包配置"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="币种">
              {getFieldDecorator('coinId', {
                initialValue: currentItem.coinId || '',
                rules: [
                  {required: true, message: '请选择币种'}
                ]
              })(
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  disabled
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {
                    coinList.map(item => {
                      return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>

            <Form.Item label="最大红包数量">
              {getFieldDecorator('maxNum', {
                initialValue: currentItem.maxNum || '',
                rules: [
                  {required: true, message: '请输入最大红包数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="最大红包数量" />
              )}
            </Form.Item>
            <Form.Item label="最小红包数量">
              {getFieldDecorator('minNum', {
                initialValue: currentItem.minNum || '',
                rules: [
                  {required: true, message: '请输入最小红包数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="最小红包数量" />
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

  // 状态
  state = {
    tableList: [], // 列表数据
    meta: {}, // 请求列表信息
    currentPage: 1, // 当前页码
    tableLoading: false, // 列表请求loading
    currentParams: {}, // 当前查询参数
    addVisible: false, // 是否显示添加弹框
    addLoading: false, // 添加弹框确定loading
    editVisible: false, // 是否显示编辑弹框
    editLoading: false, // 编辑弹框确定loading
    currentItem: {}, // 当前操作项
    coinList: [], // 币种列表
  }

  // 获取列表
  getList = (page) => {
    const params = {
      ...this.state.currentParams,
      page,
      pageSize: 10
    }
    this.setState({tableLoading: true, currentPage: page})
    // 测试数据
    params.data = {
      items: [
        {
          coinId: '1',
          coinName: 'YBT',
          minNum: '23',
          maxNum: '666',
        }
      ]
    }
    testApi(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 整理列表项
  getColumns() {
    let list = [
      {
        title: '币种ID',
        dataIndex: 'coinId',
        render: (text) => (text || '-')
      }, {
        title: '币种名称',
        dataIndex: 'coinName',
        render: (text) => (text || '-')
      }, {
        title: '最小数量',
        dataIndex: 'minNum',
        render: (text) => (text || '-')
      }, {
        title: '最大数量',
        dataIndex: 'maxNum',
        render: (text) => (text || '-')
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 6020).length // 编辑红包配置权限
    if (auth1) {
      list.push({
        title: '操作',
        width: 100,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}              
            </div>
          )
        }
      })
    }

    return list
  }

  // 编辑红包配置打开弹框
  edit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑红包配置确定
  onOkEdit = () => {
    const {tableList, currentItem} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.maxNum < +values.minNum) {
        message.warning('最大红包数量应大于最小红包数量！')
        return
      }
      let params = {...values}
      this.setState({editLoading: true})
      testApi(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.memberId === currentItem.memberId) {
            for(let i in values) {
              v[i] = values[i]
            }
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

  // 编辑红包配置取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 添加红包配置确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.maxNum < +values.minNum) {
        message.warning('最大红包数量应大于最小红包数量！')
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      testApi(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加红包配置取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    getAllCoinList().then(data => {
      this.setState({coinList: data.data || []})
    })
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      addVisible,
      addLoading,
      coinList,
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
    const {authList} = this.context

    return (
      <div>
        <div className="pageTitle">红包配置</div>
        {
          !!authList.filter(v => +v === 6018).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          </div>          
        }
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加红包配置弹框 */}
        <AddModal
          ref="addModal"
          coinList={coinList}
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 编辑红包配置弹框 */}
        <EditModal
          ref="editModal"
          currentItem={currentItem}
          coinList={coinList}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />
      </div>
    );
  }
}