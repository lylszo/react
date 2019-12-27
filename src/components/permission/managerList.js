import React, { Component } from 'react'
import { getStaffList, addStaff, editStaffStatus, resetStaffPwd, setStaffRole, getRoleList } from '@/axios'
import { Table, Form, Input, Button, Select, Modal, message } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm
const Option = Select.Option

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
          this.props.getList(params)
        })      
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form;
      const { loading, roleList } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="职员ID">
            {getFieldDecorator('id', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入职员ID" />
            )}
          </Form.Item>
          <Form.Item label="手机号码">
            {getFieldDecorator('phoneNumber', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="邮箱地址">
            {getFieldDecorator('emailAddress', {
              rules: [
                { type: 'email', message: '请输入正确的邮箱地址' }
              ]
            })(
              <Input allowClear placeholder="请输入邮箱地址" />
            )}
          </Form.Item>
          <Form.Item label="角色">
            {getFieldDecorator('roleId', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  roleList.map(v => {
                    return <Option value={v.id} key={v.id}>{v.name}</Option>
                  })
                }
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

// 添加职员弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='添加职员'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="用户名">
              {getFieldDecorator('account', {
                rules: [
                  {required: true, message: '请输入用户名'}
                ]
              })(
                <Input placeholder="用户名" />
              )}
            </Form.Item>
            <Form.Item label="真实姓名">
              {getFieldDecorator('realName', {
                rules: [
                  {required: true, message: '请输入真实姓名'}
                ]
              })(
                <Input placeholder="真实姓名" />
              )}
            </Form.Item>
            <Form.Item label="手机号">
              {getFieldDecorator('phoneNumber', {
                rules: [
                  {required: true, message: '请输入手机号'},
                  { pattern: /^[+\d]*$/, message: '请输入正确的手机号' }
                ]
              })(
                <Input placeholder="手机号" />
              )}
            </Form.Item>
            <Form.Item label="邮箱地址">
              {getFieldDecorator('emailAddress', {
                rules: [
                  {required: true, message: '请输入邮箱地址'},
                  {type: 'email', message: '请输入正确的邮箱地址'}
                ]
              })(
                <Input placeholder="邮箱地址" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 修改角色弹框
const RoleModal = Form.create({ name: 'roleModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, roleList } = this.props
      const roleId = (item.roles && item.roles[0] && item.roles[0].roleId) || ''
      const title = `修改角色（${item.account}）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="角色">
              {getFieldDecorator('roleId', {
                initialValue: roleId,
                rules: [
                  {required: true, message: '请选择角色'}
                ]
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  <Option value=''>请选择</Option>
                  {
                    roleList.map(v => {
                      return <Option value={v.id} key={v.id}>{v.name}</Option>
                    })
                  }
                </Select>
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
    roleList: [], // 角色列表
    currentItem: {}, // 当前处理对象
    addVisible: false, // 是否显示添加职员弹框
    addLoading: false, // 添加职员弹框确认loading
    roleVisible: false, // 是否显示设置角色弹框
    roleLoading: false, // 设置角色弹框确认loading
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['roleId'] // 下拉选择的参数
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
                   {...searchParams, page: currentPage} : 
                   {...this.state.currentParams, page: currentPage}
    this.setState({tableLoading: true, currentPage: currentPage})
    getStaffList(params).then(data => {
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

  // 锁定/解锁用户
  lock = (item, txt) => {
    confirm({
      title: `确定${txt}用户“${item.account}”吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          let params = {
            id: item.id,
            status: !item.status
          }
          editStaffStatus(params).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach(v => {
              if (v.id === item.id) {
                v.status = params.status
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`已${txt}！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })    
  }

  // 重置密码弹框
  resetPwd = (item) => {
    confirm({
      title: `确定重置用户“${item.account}”的密码吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          resetStaffPwd(item.id).then(() => {
            resolve()
            message.success(`重置密码成功！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })    
  }

  // 添加职员确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      addStaff(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加职员取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
  }

  // 打开修改角色弹框
  setRole = (item) => {
    this.setState({currentItem: item, roleVisible: true})
  }

  // 修改角色确定
  onOkRole = () => {
    const {currentItem} = this.state
    this.refs.roleModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ids: [values.roleId],
        staffId: currentItem.id
      }
      this.setState({roleLoading: true})
      setStaffRole(params).then(() => {
        this.getList()
        this.setState({roleLoading: false})
        this.onCancelRole()
        message.success('修改角色成功！')
      }).catch(() => {
        this.setState({roleLoading: false})
      })
    })
  }

  // 修改角色取消
  onCancelRole = () => {
    this.setState({roleVisible: false})
    this.refs.roleModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '职员ID',
        dataIndex: 'id'
      }, {
        title: '账号',
        dataIndex: 'account',
        render: (text) => (text || '-')
      }, {
        title: '实际名称',
        dataIndex: 'realName',
        render: (text) => (text || '-')
      }, {
        title: '手机号码',
        dataIndex: 'phoneNumber',
        render: (text) => (text || '-')
      }, {
        title: '邮箱地址',
        dataIndex: 'emailAddress',
        render: (text) => (text || '-')
      }, {
        title: '所属角色',
        dataIndex: 'roles',
        render: (text) => (text[0] ? text[0].roleName : '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (text ? '启用' : '禁用')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 8007).length // 重置密码权限
    let auth2 = !!authList.filter(v => +v === 8008).length // 修改角色权限
    let auth3 = !!authList.filter(v => +v === 8009).length // 锁定解锁权限

    if (auth1 || auth2 || auth3) {
      let width = 180
      if (auth1 && auth2 && auth3) {
        width = 220
      }
      if ([auth1, auth2, auth3].filter(v => v).length === 1) {
        width = 100
      }
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width: width,
        render: (item) => {
          let lockTxt = item.status ? '锁定' : '解锁'
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.resetPwd(item)}>重置密码</Button>}
              {auth2 && <Button size="small" onClick={() => this.setRole(item)}>修改角色</Button>}
              {auth3 && <Button size="small" onClick={() => this.lock(item, lockTxt)}>{lockTxt}</Button>}
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
    getRoleList().then(data => {
      this.setState({roleList: data.data})
    })
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      roleList,
      addVisible,
      addLoading,
      roleVisible,
      roleLoading,
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
        <div className="pageTitle">管理员列表</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} roleList={roleList}/>
        {
          !!authList.filter(v => +v === 8006).length &&
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

        {/* 添加职员弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 修改角色弹框 */}
        <RoleModal
          ref="roleModal"
          onOk={this.onOkRole}
          onCancel={this.onCancelRole}
          visible={roleVisible}
          item={currentItem}
          roleList={roleList}
          confirmLoading={roleLoading} />
      </div>
    );
  }
}