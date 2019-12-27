import React, { Component } from 'react'
import { getMsgList, addMsg, delMsg, editMsg } from '@/axios'
import { Table, Form, Input, Button, DatePicker, Select, Modal, message } from 'antd'
import MyContext from '@/tool/context'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { f_msgType, ObjToArr } from '@/tool/filter'
import moment from 'moment'

const { RangePicker } = DatePicker
const confirm = Modal.confirm
const Option = Select.Option
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean'] 
  ]
}

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
          <Form.Item label="标题">
            {getFieldDecorator('title')(
              <Input allowClear placeholder="请输入标题" />
            )}
          </Form.Item>
          <Form.Item label="类型">
            {getFieldDecorator('type', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_msgType).map(v => <Option value={v.id} key={v.id}>{v.name}</Option>)
                }
              </Select>
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

// 添加消息弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {

    state = {
      type: '1'
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      const { type } = this.state
      const title = `添加消息`
      return (
        <Modal
          title={title}
          visible={visible}
          width="800px"
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 3}} wrapperCol={{span: 20}} onSubmit={this.handleSubmit} >
            <Form.Item label="标题">
              {getFieldDecorator('title', {
                rules: [
                  {required: true, whitespace: true, message: '请输入标题'}
                ]
              })(
                <Input placeholder="标题" />
              )}
            </Form.Item>
            <Form.Item label="类型">
              {getFieldDecorator('type', {
                initialValue: type,
                getValueFromEvent: val => {
                  this.setState({type: val})
                  return val
                },
                rules: [
                  {required: true, message: '请选择类型'}
                ]
              })(
                <Select>
                  {
                    ObjToArr(f_msgType).map(v => <Option value={v.id} key={v.id}>{v.name}</Option>)
                  }
                </Select>
              )}
            </Form.Item>
            {
              type === '2' ?
              <Form.Item label="链接">
                {getFieldDecorator('url', {
                  initialValue: '',
                  rules: [
                    {required: true, whitespace: true, message: '请输入链接'}
                  ]
                })(
                  <Input placeholder="链接" />
                )}
              </Form.Item>
              :
              <Form.Item label="内容">
                {getFieldDecorator('content',{
                  initialValue: '',
                  getValueFromEvent: val => {
                    if (val === '<p><br></p>') {
                      return ''
                    } else {
                      return val
                    }
                  },
                  rules: [
                    {required: true, whitespace: true, message: '请输入内容'}
                  ]
                })(
                  <ReactQuill modules={quillModules}/>
                )}
              </Form.Item>
            }
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑消息弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {

    state = {
      type: this.props.item.type || '1'
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const { type } = this.state
      const title = `编辑消息（ID：${item.id}）`
      return (
        <Modal
          title={title}
          visible={visible}
          maskClosable={false}
          width="800px"
          confirmLoading={confirmLoading}
          onOk={onOk}
          onCancel={onCancel}>
          <Form labelCol={{span: 3}} wrapperCol={{span: 20}} onSubmit={this.handleSubmit} >
            <Form.Item label="标题">
              {getFieldDecorator('title', {
                initialValue: item.title || '',
                rules: [
                  {required: true, whitespace: true, message: '请输入标题'}
                ]
              })(
                <Input placeholder="标题" />
              )}
            </Form.Item>
            <Form.Item label="类型">
              {getFieldDecorator('type', {
                initialValue: type,
                getValueFromEvent: val => {
                  this.setState({type: val})
                  return val
                },
                rules: [
                  {required: true, message: '请选择类型'}
                ]
              })(
                <Select>
                  {
                    ObjToArr(f_msgType).map(v => <Option value={v.id} key={v.id}>{v.name}</Option>)
                  }
                </Select>
              )}
            </Form.Item>
            {
              type === '2' ?
              <Form.Item label="链接">
                {getFieldDecorator('url', {
                  initialValue: item.url || '',
                  rules: [
                    {required: true, whitespace: true, message: '请输入链接'}
                  ]
                })(
                  <Input placeholder="链接" />
                )}
              </Form.Item>
              :
              <Form.Item label="内容">
                {getFieldDecorator('content',{
                  initialValue: item.content || '',
                  getValueFromEvent: val => {
                    if (val === '<p><br></p>') {
                      return ''
                    } else {
                      return val
                    }
                  },
                  rules: [
                    {required: true, whitespace: true, message: '请输入内容'}
                  ]
                })(
                  <ReactQuill modules={quillModules}/>
                )}
              </Form.Item>              
            }
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
    currentItem: {}, // 当前编辑项
    addVisible: false, // 是否显示添加消息弹框
    addLoading: false, // 添加消息弹框确认loading
    editVisible: false, // 是否显示编辑消息弹框 
    editLoading: false, // 编辑消息弹框确认loading 
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['type'] // 下拉选择的参数
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
    getMsgList(params).then(data => {
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
        title: 'ID',
        dataIndex: 'id'
      }, {
        title: '标题',
        dataIndex: 'title',
        render: (text) => (text || '-')
      }, {
        title: '内容/链接',
        render: item => {
          if (+item.type === 2) { // 公告
            let txt = item.url || ''
            if (txt.length > 30) {
              return <a title={txt} href={txt} target="_blank" rel="noopener noreferrer">{txt.slice(0,30) + '...'}</a>
            } else {
              return txt ? <a href={txt} target="_blank" rel="noopener noreferrer">{txt}</a> : '-'
            }
          } else {
            let txt = item.content || ''
            if (txt.length > 30) {
              return <span title={txt}>{txt.slice(0,30) + '...'}</span>
            } else {
              return txt || '-'
            }
          }
        }
      }, {
        title: '消息类型',
        dataIndex: 'type',
        render: (text) => (f_msgType[text] || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 7008).length // 编辑权限
    let auth2 = !!authList.filter(v => +v === 7007).length // 删除权限

    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        render: item => {
          return (
            <div>
              {
                auth1 &&
                <Button size="small" onClick={() => this.openEdit(item)}>编辑</Button>
              }
              {
                auth2 &&
                <Button size="small" type="danger" onClick={() => this.del(item)}>删除</Button>
              }
            </div>
          )
        }
      })
    }

    return columns
  }

  // 打开编辑窗口
  openEdit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑消息确定
  onOkEdit = () => {
    const {currentItem, tableList} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (values.content && !/^<p>([\s\S]*)<\/p>$/.exec(values.content)[1].trim().length) {
        message.warning('消息内容不能全是空格！')
        return
      }
      let params = {...values, id: currentItem.id}
      this.setState({editLoading: true})
      editMsg(params).then(() => {
        const tableList2 = [...tableList]
        tableList2.forEach((v, i, a) => {
          if (v.id === currentItem.id) {
            let newItem = {...v, url: '', content: '', ...params}
            a[i] = newItem
            this.setState({currentItem: newItem})
          }
        })
        this.setState({editLoading: false, tableList: tableList2})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑消息取消
  onCancelEdit = () => {
    this.refs.editModal.resetFields()
    this.setState({editVisible: false})
  }

  // 打开添加窗口
  openAdd = () => {
    this.setState({addVisible: true})
    this.refs.addModal.resetFields()
  }

  // 添加消息确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (values.content && !/^<p>([\s\S]*)<\/p>$/.exec(values.content)[1].trim().length) {
        message.warning('消息内容不能全是空格！')
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      addMsg(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加消息取消
  onCancelAdd = () => {
    this.refs.addModal.resetFields()
    this.setState({addVisible: false})
  }

  // 删除消息
  del = item => {
    confirm({
      title: `确定删除ID为${item.id}的系统${+item.type === 1 ? '消息' : '公告'}吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          delMsg(item.id).then(() => {
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
        <div className="pageTitle">公告消息</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        {
          !!authList.filter(v => +v === 7006).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={this.openAdd}>添加</Button>
            </div>
          </div>          
        }
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加消息弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          item={currentItem}
          confirmLoading={addLoading} />

        {/* 编辑消息弹框 */}
        <EditModal
          ref="editModal"
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          item={currentItem}
          confirmLoading={editLoading} />
      </div>
    );
  }
}