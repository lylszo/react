import React, { Component } from 'react'
import { getRoles, delRole, AddRole } from '@/axios'
import { Table, Button, message, Modal, Form, Input } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm
const { TextArea } = Input

// 添加角色弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='添加角色'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="名称">
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '请输入名称'},
                  {max: 20, message: '名称不能超过20字'}
                ]
              })(
                <Input placeholder="名称" />
              )}
            </Form.Item>
            <Form.Item label="描述">
              {getFieldDecorator('description', {
                rules: [
                  {required: true, message: '请输入描述'},
                  {max: 200, message: '描述不能超过200字'}
                ]
              })(
                <TextArea rows={4}  placeholder="200字以内" />
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
    addVisible: false, // 是否显示添加角色弹框
    addLoading: false, // 添加角色弹框确认loading
  }

  // 获取列表
  getList = (page) => {
    let currentPage = page || 1
    const params = {...this.state.currentParams, page: currentPage}
    this.setState({tableLoading: true, currentPage: currentPage})
    getRoles(params).then(data => {
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
    let columns = [
      {
        title: '角色ID',
        dataIndex: 'id'
      }, {
        title: '角色名称',
        dataIndex: 'name',
        render: (text) => (text || '-')
      }, {
        title: '角色描述',
        dataIndex: 'description',
        render: (text) => (text || '-')
      }
    ]

    const {authList} = this.context
    
    let auth1 = !!authList.filter(v => +v === 8015).length // 删除权限
    let auth2 = !!authList.filter(v => +v === 8016).length // 修改角色权限

    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        width: (auth1 && auth2) ? 145 : 100,
        render: item => {
          return (
            <div>
              {auth2 && <Button size="small" onClick={() => this.edit(item)}>修改权限</Button>}
              {auth1 && <Button size="small" type="danger" onClick={() => this.del(item)}>删除</Button>}
            </div>
          )
        }
      })
    }

    return columns
  }

  edit = (item) => {
    this.props.history.push({
      pathname: '/editRole',
      state: {
        id: item.id,
        name: item.name
      }
    })
  }

  // 删除当前角色
  del = (item) => {
    confirm({
      title: `确定删除角色“${item.name}”吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          delRole(item.id).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach((v, i, a) => {
              if (v.id === item.id) {
                a.splice(i, 1)
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`已删除！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })    
  }

  // 添加角色确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      AddRole(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加角色取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
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
      addVisible,
      addLoading,
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
        <div className="pageTitle">角色列表</div>
        {
          !!authList.filter(v => +v === 8014).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          </div>          
        }
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加角色弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />
      </div>
    );
  }
}