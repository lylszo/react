import React, { Component } from 'react'
import { getChatUserList, platformToBlack } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Modal, Row, Col } from 'antd'
import MyContext from '@/tool/context'
import { f_chatNodeLevel, f_encodeId, f_decodeId } from '@/tool/filter'
import moment from 'moment'

const { RangePicker } = DatePicker
const { TextArea } = Input

// 搜索表单
const SearchForm = Form.create({ name: 'groupSearch' })(
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
            params.startAt = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.endAt = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
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
            {getFieldDecorator('userId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="用户手机号">
            {getFieldDecorator('phone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="用户邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="注册时间">
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

// 添加平台黑名单弹框
const BlackModal = Form.create({ name: 'blackModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title="添加到平台黑名单"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">成员昵称：</div></Col>
              <Col span={16}><div className="">{item.name || '-'}</div></Col>
            </Row>
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">成员ID：</div></Col>
              <Col span={16}><div className="">{f_encodeId(item.id) || '-'}</div></Col>
            </Row>
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">账号：</div></Col>
              <Col span={16}><div className="">{item.phone || item.email || '-'}</div></Col>
            </Row>
            <Form.Item label="原因">
              {getFieldDecorator('reason', {
                rules: [
                  {required: true, message: '原因不能为空'},
                  {min: 2, message: '字数不能少于2个字'},
                  {max: 50, message: '字数不能超过50字'}
                ]
              })(
                <TextArea rows={4}  placeholder="50字以内" />
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
    currentItem: {}, // 当前处理对象
    blackVisible: false, // 是否显示添加黑名单弹框
    blackLoading: false, // 添加黑名单弹框确认loading
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.userId) {
      let code = f_decodeId(pageOrSearch.userId)[0]
      if (code) {
        pageOrSearch.userId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['status'] // 下拉选择的参数
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
    getChatUserList(params).then(data => {
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

  // 跳转到群成员列表
  toMember = (item) => {
    this.props.history.push({
      pathname: '/personalMember',
      state: {item}
    })    
  }

  // 添加群成员到平台黑名单，打开弹框
  addBlackList = (item) => {
    this.setState({currentItem: item, blackVisible: true})  
  }

  // 添加平台黑名单确认
  onOkBlack = () => {
    const {currentItem, tableList} = this.state
    this.refs.blackModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({blackLoading: true})
      platformToBlack(currentItem.id, params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (+v.id === +currentItem.id) {
            v.platformBlacklist = true
          }
        })
        this.setState({blackLoading: false, tableList: tableList2})
        this.onCancelBlack()
        message.success('已添加！')
      }).catch(() => {
        this.setState({blackLoading: false})
      })
    })
  }

  // 添加平台黑名单取消
  onCancelBlack = () => {
    this.setState({blackVisible: false})
    this.refs.blackModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '用户ID',
        dataIndex: 'id',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '昵称',
        dataIndex: 'name',
        render: (text) => (text || '-')
      }, {
        title: '用户手机号',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '用户邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '是否团队长',
        dataIndex: 'leader',
        render: (text) => (+text === '1' ? '是' : '否')
      }, {
        title: '节点等级',
        dataIndex: 'node',
        render: (text) => (f_chatNodeLevel[text] || '-')
      }, {
        title: '注册时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1425).length // 查看好友列表权限
    let auth2 = !!authList.filter(v => +v === 1428).length // 添加平台黑名单
    let width = 110
    if (auth1 && auth2) {
      width = 220
    }
    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        fixed: 'right',
        width,
        render: (item) => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.toMember(item)}>好友列表</Button>}
              {auth2 && !item.platformBlacklist && <Button size="small" onClick={() => this.addBlackList(item)}>添加平台黑名单</Button>}
            </div>
          )
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
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      blackVisible,
      blackLoading,
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
        <div className="pageTitle">个人聊天管理</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt10"
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加平台黑名单弹框 */}
          <BlackModal
            ref="blackModal"
            onOk={this.onOkBlack}
            onCancel={this.onCancelBlack}
            visible={blackVisible}
            item={currentItem}
            confirmLoading={blackLoading} />

      </div>
    );
  }
}