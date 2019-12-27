import React, { Component } from 'react'
import { findClassifyAdd, findClassifyEdit, findClassifyList, findClassifyDel } from '@/axios'
import { Table, Form, Input, Button, message, Modal } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm

// 添加分类弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props

      return (
        <Modal
          width="580px"
          title='添加分类'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="编号">
              {getFieldDecorator('classifyId', {
                rules: [
                  {required: true, message: '请输入编号'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="编号" />
              )}
            </Form.Item>
            <Form.Item label="分类标题">
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '请输入分类标题'},
                  {max: 30, message: '分类标题不能超过30字'},
                ]
              })(
                <Input placeholder="分类标题" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑分类弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, currentItem } = this.props
      let title = `编辑分类（ID：${currentItem.id}）`

      return (
        <Modal
          width="580px"
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="编号">
              {getFieldDecorator('classifyId', {
                initialValue: currentItem.classifyId || '',
                rules: [
                  {required: true, message: '请输入编号'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="编号" />
              )}
            </Form.Item>
            <Form.Item label="分类标题">
              {getFieldDecorator('name', {
                initialValue: currentItem.name || '',
                rules: [
                  {required: true, message: '请输入分类标题'},
                  {max: 30, message: '分类标题不能超过30字'},
                ]
              })(
                <Input placeholder="分类标题" />
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
  }

  // 获取列表
  getList = (page) => {
    let params = {...this.state.currentParams, page: page, pageSize: 10}
    this.setState({tableLoading: true, currentPage: page})
    findClassifyList(params).then(data => {
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

  // 删除分类
  del = item => {
    confirm({
      title: `确定删除ID为${item.id}的分类吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          findClassifyDel(item.id).then(() => {
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

  // 整理列表项
  getColumns() {
    let list = [
      {
        title: 'ID',
        dataIndex: 'id',
        render: (text) => (text || '-')
      },
      {
        title: '编号',
        dataIndex: 'classifyId',
        render: (text) => (text || '-')
      }, {
        title: '分类标题',
        dataIndex: 'name',
        render: (text) => {
          if (text && text.length) {
            let val = text
            if (text.length > 20) {
              val = text.slice(0, 20) + '...'
            }
            return <span title={text}>{val}</span>
          } else {
            return '-'
          }
        }
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 1221).length // 编辑分类权限
    const auth2 = !!authList.filter(v => +v === 1222).length // 删除分类权限
    if (auth1 || auth2) {
      list.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}
              {auth2 && <Button type="danger" size="small" onClick={() => this.del(item)}>删除</Button>}              
            </div>
          )
        }
      })
    }

    return list
  }

  // 编辑分类打开弹框
  edit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑分类确定
  onOkEdit = () => {
    const {tableList, currentItem} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, id: currentItem.id}
      this.setState({editLoading: true})
      findClassifyEdit(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.id === currentItem.id) {
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

  // 编辑分类取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 添加分类确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      findClassifyAdd(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加分类取消
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
        {
          !!authList.filter(v => +v === 1220).length &&
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

        {/* 添加分类弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 编辑分类弹框 */}
        <EditModal
          ref="editModal"
          currentItem={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />
      </div>
    );
  }
}