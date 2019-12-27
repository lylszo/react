import React, { Component } from 'react'
import { getUserList, lockUser, unlockUser, getVipData, editUserRemark } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, Modal, message } from 'antd'
import { f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
const confirm = Modal.confirm
const Option = Select.Option
const { TextArea } = Input

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
            params.createdStartAt = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.createdEndAt = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
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
            {getFieldDecorator('id', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="手机号">
            {getFieldDecorator('phoneNumber', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号" />
            )}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('emailAddress')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="备注">
            {getFieldDecorator('remark')(
              <Input placeholder="请输入备注" />
            )}
          </Form.Item>
          <Form.Item label="上级手机号">
            {getFieldDecorator('parentPhone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入上级手机号" />
            )}
          </Form.Item>
          <Form.Item label="邀请码">
            {getFieldDecorator('promotionCode')(
              <Input allowClear placeholder="请输入邀请码" />
            )}
          </Form.Item>
          <Form.Item label="注册时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="节点等级">
            {getFieldDecorator('nodeLevel', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="0">非节点</Option>
                <Option value="1">普通节点</Option>
                <Option value="2">超级节点</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="会员等级">
            {getFieldDecorator('grade', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="0">V0</Option>
                <Option value="1">V1</Option>
                <Option value="2">V2</Option>
                <Option value="3">V3</Option>
                <Option value="4">V4</Option>
                <Option value="5">V5</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="锁定状态">
            {getFieldDecorator('isBlocked', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="0">正常</Option>
                <Option value="1">锁定</Option>
              </Select>
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

// 锁定用户表单弹框
const LockFormModal = Form.create({ name: 'LockFormModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = `锁定用户（ 用户ID：${f_encodeId(item.accountId)} ）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="锁定备注">
              {getFieldDecorator('blockedReason', {
                rules: [
                  { required: true, message: '请填写锁定备注' },
                  { max: 32, message: '备注应在32字以内' }
                ]
              })(
                <TextArea rows={4}  placeholder="32字以内" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 修改用户备注弹框
const RemarkFormModal = Form.create({ name: 'remarkFormModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = `修改备注（ 用户ID：${f_encodeId(item.accountId)} ）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="备注">
              {getFieldDecorator('remark', {
                initialValue: item.account && item.account.mark ? item.account.mark : '',
                rules: [
                  { required: true, message: '请填写备注' },
                  { max: 32, message: '备注应在50字以内' }
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
    pageSize: 10, // 每页条数
    tableLoading: false, // 列表请求loading
    currentItem: {}, // 当前操作项
    showLock: false, // 是否显示锁定弹框
    lockLoading: false, // 锁定用户弹框确定loading
    vipStatistic: {}, // 用户会员统计数据
    currentParams: {}, // 当前查询参数
    showRemark: false, // 是否显示修改备注弹框
    remarkLoading: false, // 修改备注弹框确定loading
  }

  // 获取用户列表
  getList = (pageOrSearch, pageSize2) => {
    const {pageSize} = this.state
    let searchParams
    let currentPage = 1
    if (pageOrSearch.id) {
      let code = f_decodeId(pageOrSearch.id)[0]
      if (code) {
        pageOrSearch.id = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['isBlocked', 'grade', 'nodeLevel'] // 下拉选择的参数
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
                   {...searchParams, page: currentPage, pageSize: pageSize2 || pageSize} : 
                   {...this.state.currentParams, page: currentPage, pageSize: pageSize2 || pageSize}
    this.setState({tableLoading: true, currentPage: currentPage})
    getUserList(params).then(data => {
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

  // 锁定/解锁弹框
  handleLock = (item, isBlocked) => {
    this.setState({currentItem: item}, () => {
      if (isBlocked) {
        confirm({
          title: `确定解锁ID为${f_encodeId(item.accountId)}的用户吗？`,
          onOk:() => {
            return new Promise((resolve, reject) => {
              unlockUser(item.accountId, {isBlocked: true}).then(() => {
                let tableList2 = this.state.tableList.concat()
                tableList2.forEach(v => {
                  if (v.accountId === item.accountId) {
                    v.account.blocked = false
                  }
                })
                this.getStatistic()
                this.setState({tableList: tableList2})
                message.success('已解锁！')
                resolve()
              }).catch(() => {
                reject()
              })       
            })

          }
        })      
      } else {
        this.setState({showLock: true})
      }      
    })
  }

  // 锁定弹框确认
  onOkLock = () => {
    this.refs.lockFormModal.validateFields((err, values) => {
      if (err) {
        return
      }
      this.setState({lockLoading: true})
      const id = this.state.currentItem.accountId
      let params = {...values}
      params.isBlocked = true
      lockUser(id, params).then(() => {
        let tableList2 = this.state.tableList.concat()
        tableList2.forEach(v => {
          if (v.accountId === id) {
            v.account.blocked = true
            v.account.blockedReason = params.blockedReason
          }
        })
        this.getStatistic()
        this.onCancelLock()
        this.setState({tableList: tableList2, lockLoading: false})
        message.success('已锁定！')
      }).catch(() => {
        this.setState({lockLoading: false})
      })
    })
  }

  // 锁定弹框取消
  onCancelLock = () => {
    this.setState({showLock: false})
    this.refs.lockFormModal.resetFields()
  }

  // 修改备注弹框
  editRemark = (item) => {
    this.setState({currentItem: item}, () => {
      this.setState({showRemark: true})   
    })
  }

  // 修改备注弹框确认
  onOkRemark = () => {
    this.refs.remarkFormModal.validateFields((err, values) => {
      if (err) {
        return
      }
      this.setState({remarkLoading: true})
      const id = this.state.currentItem.accountId
      let params = {...values}
      editUserRemark(id, params).then(() => {
        let tableList2 = this.state.tableList.concat()
        tableList2.forEach(v => {
          if (v.accountId === id) {
            v.account.mark = params.remark
          }
        })
        this.onCancelRemark()
        this.setState({tableList: tableList2, remarkLoading: false})
        message.success('已修改！')
      }).catch(() => {
        this.setState({remarkLoading: false})
      })
    })
  }

  // 修改备注弹框取消
  onCancelRemark = () => {
    this.setState({showRemark: false})
    this.refs.remarkFormModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '用户ID',
        dataIndex: 'accountId',
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
        title: '注册时间',
        dataIndex: 'accountRegisteredAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '上级账号',
        render: item => (item.parentPhone || item.parentEmailAddress || '-')
      }, {
        title: '会员等级',
        dataIndex: 'account.grade',
        render: (text) => (`V${text}` || 'V0')
      }, {
        title: '节点等级',
        dataIndex: 'account.nodeLevel',
        render: (text) => {
          const o = {
            '0': '非节点',
            '1': '普通节点',
            '2': '超级节点'            
          }
          return o[text || 0] 
        }
      }, {
        title: '状态',
        render: (item => {
          return (item.account && item.account.blocked) ? '锁定' : '正常'
        })
      }, {
        title: '是否有效',
        dataIndex: 'account.effective',
        render: (text) => (text ? '是' : '否')
      }, {
        title: '备注',
        dataIndex: 'account.mark',
        render: (text) => {
          if (text && text.length && text.length > 10) {
            let val = text.slice(0, 10) + '...'
            return <span title={val}>{val}</span>
          } else {
            return text || '-'
          }
        }
      }
    ]
    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 2005).length // 查看详情权限
    let auth2 = !!authList.filter(v => +v === 2008).length // 锁定解锁用户权限
    let auth3 = !!authList.filter(v => +v === 2016).length // 修改用户备注权限
    if (auth1 || auth2 || auth3) {
      const authArr = [auth1, auth2, auth3].filter(v => v)
      let width = 210
      if (authArr.length === 1) {
        width = 80
      } else if (authArr.length === 2) {
        width = 150
      }
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width,
        render: (item) => {
          const txt = (item.account && item.account.blockedReason) || '-' 
          const title = `锁定原因：${txt}`
          let isBlocked = item.account && item.account.blocked
          return (
            <div>
              {
                auth1 &&
                <Button size="small" onClick={() => {this.props.history.push({pathname: '/userDetail', state:{id: item.accountId}})}}>查看</Button>
              }
              {
                auth2 &&
                <Button
                  size="small"
                  title={isBlocked ? title : ''}
                  onClick={this.handleLock.bind(this, item, isBlocked)}>
                  {isBlocked ? '解锁' : '锁定'}
                </Button>
              }
              {
                auth3 &&
                <Button size="small" onClick={this.editRemark.bind(this, item)}>修改备注</Button>
              }
            </div>
          )
        }
      })      
    }
    return columns
  }

  // 获取统计数据
  getStatistic = () => {
    getVipData().then(data => {
      this.setState({vipStatistic: data.data})
    })
  }

  // 改变每页条数
  onShowSizeChange = (current, pageSize) => {
    this.setState({pageSize})
    this.getList(1, pageSize)
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    this.getStatistic()
  }

  // 渲染
  render() {
    const {
      tableList,
       meta,
      tableLoading,
      currentPage,
      showLock,
      lockLoading,
      currentItem,
      vipStatistic,
      showRemark,
      remarkLoading,
    } = this.state
    const pageSet = {
      showQuickJumper: true,
      defaultCurrent: 1,
      total: meta.totalCount,
      onChange: this.getList,
      current: currentPage,
      showTotal: total => `共${total}条`,
      size: 'small',
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '50', '80', '100'],
      onShowSizeChange: this.onShowSizeChange
    }

    return (
    	<div>
	      <div className="pageTitle">用户列表</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <div className="clearfix">
          <div className="fr">
            <span>锁定会员： {vipStatistic.lockUsersSum || 0}个</span>
            <span className="ml20">正常会员： {vipStatistic.normalUsersSum || 0}个</span>
          </div>          
        </div>
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 锁定弹框 */}
        <LockFormModal
          onOk={this.onOkLock}
          onCancel={this.onCancelLock}
          visible={showLock}
          item={currentItem}
          confirmLoading={lockLoading}
          ref="lockFormModal"/>

        {/* 锁定弹框 */}
        <RemarkFormModal
          onOk={this.onOkRemark}
          onCancel={this.onCancelRemark}
          visible={showRemark}
          item={currentItem}
          confirmLoading={remarkLoading}
          ref="remarkFormModal"/>
    	</div>
    );
  }
}