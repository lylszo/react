import React, { Component } from 'react'
import { arkAdd, arkDel, arkList, arkEdit } from '@/axios'
import { Table, Form, Input, Button, message, Modal, DatePicker } from 'antd'
import { f_encodeId, f_decodeId} from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
const confirm = Modal.confirm

// 搜索表单
const SearchForm = Form.create({ name: 'userListSearch' })(
  class extends Component {

    // 提交表单
    handleSubmit = (type) => {
      if (type === 'reset') {
        this.props.form.resetFields()
        this.props.getList({})
      } else {
        this.props.form.validateFields((err, values) => {
          if (err) {
            return
          }
          let params = {...values}
          if (values.time && values.time.length) {
            params.startTime = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.endTime = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
          }
          delete params.time
          this.props.getList(params)
        })      
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form;
      const { loading } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('memberId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="手机号">
            {getFieldDecorator('phone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号" />
            )}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="创建时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item>
            <Button onClick={this.handleSubmit} type="primary" loading={loading}>查询</Button>
            <Button onClick={this.handleSubmit.bind(this, 'reset')} loading={loading}>重置</Button>
          </Form.Item>
        </Form>
      );
    }
  }
)

// 添加诺亚方舟弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          width="580px"
          title='新增诺亚方舟用户'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="用户ID">
              {getFieldDecorator('memberId', {
                rules: [
                  { required: true, message: '用户ID不能为空' },
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input allowClear placeholder="请输入用户ID" />
              )}
            </Form.Item>
            <Form.Item label="释放比例">
              {getFieldDecorator('rateStr', {
                rules: [
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="释放比例，不填会取系统默认值" addonAfter="%" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑诺亚方舟弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      let title = `编辑诺亚方舟用户（用户ID：${f_encodeId(item.memberId)}）`
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
            <Form.Item label="释放比例">
              {getFieldDecorator('rateStr', {
                initialValue: item.level1Rate || '',
                rules: [
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="释放比例，不填会取系统默认值" addonAfter="%" />
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
    currentItem: {}, // 当前编辑项
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.memberId) {
      let code = f_decodeId(pageOrSearch.memberId)[0]
      if (code) {
        pageOrSearch.memberId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['srcFlag'] // 下拉选择的参数
      for (let key in pageOrSearch) {
        if (!pageOrSearch[key] || (selectKeys.filter(v => v === key).length && pageOrSearch[key] === '-1')) {
          delete pageOrSearch[key]
        }
      }
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? 
                   {...searchParams, page: currentPage, pageSize: 10} : 
                   {...this.state.currentParams, page: currentPage, pageSize: 10}
    this.setState({tableLoading: true, currentPage: currentPage})
    arkList(params).then(data => {
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

  // 解除限制
  del = item => {
    confirm({
      title: `确定把ID为${f_encodeId(item.memberId)}用户移除吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          arkDel(item.memberId).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach((v, i, a) => {
              if (v.memberId === item.memberId) {
                a.splice(i, 1)
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`移除成功！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })
  }

  // 打开编辑弹框
  edit = (currentItem) => {
    this.setState({currentItem}, () => {
      this.setState({editVisible: true})
    })
  }

  // 添加诺亚方舟确定
  onOkEdit = () => {
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      const {currentItem, tableList} = this.state
      let params = {...values, memberId: currentItem.memberId}
      this.setState({editLoading: true})
      arkEdit(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.memberId === currentItem.memberId) {
            v.level1Rate = values.rateStr || '默认值'
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

  // 添加诺亚方舟取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let list = [
      {
        title: '用户ID',
        dataIndex: 'memberId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '手机号',
        dataIndex: 'phoneNumber',
        render: (text) => (text || '-')
      }, {
        title: '邮箱',
        dataIndex: 'emailAddress',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '释放比例（%）',
        render: item => {
         let txt = item.level1Rate || ''
         if (txt && txt.length > 20) {
           return <span title={txt} >{txt.slice(0, 20) + '...'}</span>
         } else {
           return txt || '-'
         }
        }
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 2035).length // 移除权限
    const auth2 = !!authList.filter(v => +v === 2036).length // 编辑权限
    if (auth1 || auth2) {
      list.push({
        title: '操作',
        width: auth1 && auth2 ? 120 : 80,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth2 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}
              {auth1 && <Button size="small" onClick={() => this.del(item)}>移除</Button>}
            </div>
          )
        }
      })
    }

    return list
  }

  // 添加诺亚方舟确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      let code = f_decodeId(params.memberId)[0]
      if (code) {
        params.memberId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
      this.setState({addLoading: true})
      arkAdd(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加诺亚方舟取消
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
      currentItem
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
        <div className="pageTitle">诺亚方舟列表</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        {
          !!authList.filter(v => +v === 2034).length &&
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

        {/* 添加诺亚方舟弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 添加诺亚方舟弹框 */}
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