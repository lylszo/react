import React, { Component } from 'react'
import { cancelChatRoom, getChatRoom, getRoomLimit, ceateRoomLimit, sendAllMessage, sendGroupMessage, groupBanned, groupAddFriend } from '@/axios'
import { Table, Form, Input, Button, Select, Modal, message, Row, Col, Checkbox, DatePicker, Switch } from 'antd'
import MyContext from '@/tool/context'
import { f_groupStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import moment from 'moment'

const Option = Select.Option
const { TextArea } = Input
const confirm = Modal.confirm
const { RangePicker } = DatePicker

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
          <Form.Item label="群ID">
            {getFieldDecorator('roomId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入群ID" />
            )}
          </Form.Item>
          <Form.Item label="群名称">
            {getFieldDecorator('roomName')(
              <Input allowClear placeholder="请输入群名称" />
            )}
          </Form.Item>
          <Form.Item label="群状态">
            {getFieldDecorator('status', {
              initialValue: 'all'
            })(
              <Select>
                <Option value="all">全部</Option>
                {
                  ObjToArr(f_groupStatus).map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="建群时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="群主ID">
            {getFieldDecorator('groupOwnerId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入群主ID" />
            )}
          </Form.Item>
          <Form.Item label="群主手机号">
            {getFieldDecorator('groupOwnerPhone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="群主邮箱">
            {getFieldDecorator('groupOwnerEmail')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="通过群聊添加好友">
            {getFieldDecorator('isAddFriend', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="true">允许</Option>
                <Option value="false">禁止</Option>
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

// 建群限制弹框
const LimitModal = Form.create({ name: 'limitModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, limitArr, changeLimitArr } = this.props

      return (
        <Modal
          title='建群限制'
          visible={visible}
          confirmLoading={confirmLoading}
          width="450px"
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span:3}} wrapperCol={{span: 18}} onSubmit={this.handleSubmit} >
            <span className="red fs12">注： 勾选用户可建群，未勾选则不可建群</span>
            <Form.Item className="mb0" label=" " colon={false}>
              {getFieldDecorator('limitArr', {
                initialValue: limitArr || [],
                getValueFromEvent: val => {
                  let hasNow = val.filter(v => v === 'allUser').length
                  let hasBefore = limitArr.filter(v => v === 'allUser').length
                  let arr = val
                  if (hasNow && hasBefore) {
                    arr = val.filter(v => v !== 'allUser')
                  } else if (hasNow) {
                    arr = ['allUser']
                  } else if (hasBefore) {
                    arr = val.filter(v => v !== 'allUser')
                  }
                  changeLimitArr(arr)
                  return arr
                }
              })(
                <Checkbox.Group style={{marginTop: '10px'}}>
                  <Row>
                    <Col span={12}>
                      <Checkbox className="mb5 lh26" value="allUser" style={{marginLeft: '8px'}}>所有用户</Checkbox>
                      <Checkbox className="mb5 lh26" value="leader">团队长</Checkbox>
                      <Checkbox className="mb5 lh26" value="node">普通节点</Checkbox>
                      <Checkbox className="mb5 lh26" value="superNode">超级节点</Checkbox>
                    </Col>
                    <Col span={12}>
                      <Checkbox className="mb5 lh26" value="v1" style={{marginLeft: '8px'}}>V1社区</Checkbox>
                      <Checkbox className="mb5 lh26" value="v2">V2社区</Checkbox>
                      <Checkbox className="mb5 lh26" value="v3">V3社区</Checkbox>
                      <Checkbox className="mb5 lh26" value="v4">V4社区</Checkbox>
                      <Checkbox className="mb5 lh26" value="v5">V5社区</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 发送所有管理员消息弹框
const AllManageModal = Form.create({ name: 'allManageModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='发送管理员消息'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Row className="mb15">
            <Col span={5}><div className="tar babelColor">发布范围：</div></Col>
            <Col span={16}><div className="">所有群聊</div></Col>
          </Row>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="内容" className="mb0">
              {getFieldDecorator('message', {
                rules: [
                  {required: true, message: '消息内容不能为空'},
                  {max: 150, message: '字数不能超过150字'}
                ]
              })(
                <TextArea rows={4}  placeholder="150字以内" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 发送群管理员消息弹框
const GroupManageModal = Form.create({ name: 'groupManageModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title='发送管理员消息'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Row className="mb15">
            <Col span={5}><div className="tar babelColor">群名称：</div></Col>
            <Col span={16}><div className="">{item.roomName}</div></Col>
          </Row>
          <Row className="mb15">
            <Col span={5}><div className="tar babelColor">群ID：</div></Col>
            <Col span={16}><div className="">{item.roomId}</div></Col>
          </Row>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="内容" className="mb0">
              {getFieldDecorator('message', {
                rules: [
                  {required: true, message: '消息内容不能为空'},
                  {max: 150, message: '字数不能超过150字'}
                ]
              })(
                <TextArea rows={4}  placeholder="150字以内" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 禁言弹框
const BannedModal = Form.create({ name: 'bannedModal' })(
  class extends Component {
    // 渲染
    render() {
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title={item.isBanned ? '解除禁言' : '全员禁言'}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Row className="mb15">
            <Col span={5}><div className="tar babelColor">群ID：</div></Col>
            <Col span={16}><div className="">{item.roomId}</div></Col>
          </Row>
          <Row className="mb15">
            <Col span={5}><div className="tar babelColor">群名称：</div></Col>
            <Col span={16}><div className="">{item.roomName}</div></Col>
          </Row>
        </Modal>
      )
    }
  }
)

// 解散群弹框
const DelModal = Form.create({ name: 'delModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title="解散群"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">群ID：</div></Col>
              <Col span={16}><div className="">{item.roomId || '-'}</div></Col>
            </Row>
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">群名称：</div></Col>
              <Col span={16}><div className="">{item.roomName || '-'}</div></Col>
            </Row>
            <Form.Item label="解散原因">
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
    limitVisible: false, // 是否显示建群限制弹框
    limitLoading: false, // 建群限制弹框确认loading
    allManageVisible: false, // 是否显示发送所有管理员消息弹框
    allManageLoading: false, // 发送所有管理员消息弹框确认loading
    groupManageVisible: false, // 是否显示发送群管理员消息弹框
    groupManageLoading: false, // 发送群管理员消息弹框确认loading
    bannedVisible: false, // 是否显示禁言弹框
    bannedLoading: false, // 禁言弹框确认loading
    delVisible: false, // 是否显示解散群弹框
    delLoading: false, // 解散群弹框确认loading
    limitArr: [], // 建群限制信息
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.groupOwnerId) {
      let code = f_decodeId(pageOrSearch.groupOwnerId)[0]
      if (code) {
        pageOrSearch.groupOwnerId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['isAddFriend'] // 下拉选择的参数
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
                   {status: 'all', ...searchParams, page: currentPage, pageSize: 10} : 
                   {status: 'all', ...this.state.currentParams, page: currentPage, pageSize: 10}
    this.setState({tableLoading: true, currentPage: currentPage})
    getChatRoom(params).then(data => {
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

  // 跳转到群聊记录
  toRecord = (item) => {
    this.props.history.push({
      pathname: '/groupRecord',
      state: {item}
    })    
  }

  // 跳转到群成员列表
  toMember = (item) => {
    this.props.history.push({
      pathname: '/groupMember',
      state: {item}
    })    
  }

  // 打开解散群弹框
  delGroup = (item) => {
    this.setState({currentItem: item, delVisible: true})
  }

  // 解散群确定
  onOkDel = () => {
    const {currentItem, tableList} = this.state
    this.refs.delModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({delLoading: true})
      cancelChatRoom(currentItem.roomId, params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (+v.roomId === +currentItem.roomId) {
            v.status = 'dissolve'
            v.count = '0'
            v.reason = params.reason
          }
        })
        this.setState({delLoading: false, tableList: tableList2})
        this.onCancelDel()
        message.success('解散群成功！')
      }).catch(() => {
        this.setState({delLoading: false})
      })
    })
  }

  // 解散群取消
  onCancelDel = () => {
    this.setState({delVisible: false})
    this.refs.delModal.resetFields()
  }

  // 设置是否可以通过群聊添加好友
  addFriendSwitch = item => {
    const {authList} = this.context
    if (!authList.filter(v => +v === 1434).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    let txt = item.isAddFriend ? '禁止' : '允许'
    confirm({
      title: `是否${txt}ID为${item.roomId}的群聊中的成员通过群聊添加好友？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          groupAddFriend(item.roomId, {isAddFriend: !item.isAddFriend}).then(() => {
            let list = [...this.state.tableList]
            list.forEach(v => {
              if (v.roomId === item.roomId) {
                v.isAddFriend = !item.isAddFriend
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

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '群ID',
        dataIndex: 'roomId'
      }, {
        title: '群名称',
        dataIndex: 'roomName',
        render: (text) => (text || '-')
      }, {
        title: '群主ID',
        dataIndex: 'groupOwnerId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '群主手机号',
        dataIndex: 'groupOwnerPhone',
        render: (text) => (text || '-')
      }, {
        title: '群主邮箱',
        dataIndex: 'groupOwnerEmail',
        render: (text) => (text || '-')
      }, {
        title: '通过群聊添加好友',
        render: item => {
          return <Switch 
                  checkedChildren="允许"
                  unCheckedChildren="禁止"
                  onClick={() => this.addFriendSwitch(item, 1)}
                  checked={item.isAddFriend} />
        }
      }, {
        title: '当前人数',
        dataIndex: 'count',
        render: (text) => (text || '-')
      }, {
        title: '群状态',
        render: item => <span title={item.status === 'dissolve' ? `解散原因：${item.reason}` : ''}>{f_groupStatus[item.status] || '-'}</span>
      }, {
        title: '建群时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1412).length // 解散群权限
    let auth2 = !!authList.filter(v => +v === 1405).length // 查看群成员权限
    let auth3 = !!authList.filter(v => +v === 1406).length // 查看群聊记录权限
    let auth4 = !!authList.filter(v => +v === 1413).length // 禁言/解禁 权限
    let auth5 = !!authList.filter(v => +v === 1411).length // 发送群管理员消息

    let width = 220
    let authLength = [auth1, auth2, auth3, auth4, auth5].filter(v => v).length
    if (authLength) {
      if (authLength === 1) {
        width = 130
      }
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width: width,
        render: (item) => {
          return (
            <div className="lh30">
              {auth1 && item.status === 'running' && <Button size="small" onClick={() => this.delGroup(item)}>解散</Button>}
              {auth2 && !!+item.count && <Button size="small" onClick={() => this.toMember(item)}>群成员</Button>}
              {auth3 && <Button size="small" onClick={() => this.toRecord(item)}>群聊记录</Button>}
              {auth4 && item.status === 'running' && <Button size="small" onClick={() => this.openBanned(item)}>{item.isBanned ? '解除禁言' : '全员禁言'}</Button>}
              {auth5 && item.status === 'running' && <Button size="small" onClick={() => this.openGroupManage(item)}>发送管理员消息</Button>}
            </div>
          )
        }
      })
    }

    return columns
  }

  // 打开建群限制弹框
  openLimit = () => {
    this.setState({limitVisible: true})
    getRoomLimit().then(data => {
      let obj = data.data || {}
      let arr = []
      for (let i in obj) {
        if (obj[i]) {
          arr.push(i)
        }
      }
      this.setState({limitArr: arr})
    })
  }

  // 修改建群信息
  changeLimitArr = limitArr => {
    this.setState({limitArr})
  }

  // 建群限制确定
  onOkLimit = () => {
    this.refs.limitModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (!values.limitArr.filter(v => v).length) {
        message.warning('请至少选择一个建群限制对象')
        return
      }
      let params = {
        allUser: false,
        leader: false,
        node: false,
        superNode: false,
        v1: false,
        v2: false,
        v3: false,
        v4: false,
        v5: false
      }
      values.limitArr.forEach(v => {
        params[v] = true
      })
      this.setState({limitLoading: true})
      ceateRoomLimit(params).then(() => {
        this.setState({limitLoading: false})
        this.onCancelLimit()
        message.success('修改成功！')
      }).catch(() => {
        this.setState({limitLoading: false})
      })
    })
  }

  // 建群限制取消
  onCancelLimit = () => {
    this.setState({limitVisible: false})
    this.refs.limitModal.resetFields()
  }

  // 打开发送所有管理员消息弹框
  openAllManage = () => {
    this.setState({allManageVisible: true})
  }

  // 发送所有管理员消息确定
  onOkAllManage = () => {
    this.refs.allManageModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({allManageLoading: true})
      sendAllMessage(params).then(() => {
        this.setState({allManageLoading: false})
        this.onCancelAllManage()
        message.success('发送成功！')
      }).catch(() => {
        this.setState({allManageLoading: false})
      })
    })
  }

  // 发送所有管理员消息取消
  onCancelAllManage = () => {
    this.setState({allManageVisible: false})
    this.refs.allManageModal.resetFields()
  }

  // 打开发送群管理员消息弹框
  openGroupManage = (currentItem) => {
    this.setState({groupManageVisible: true, currentItem})
  }

  // 发送群管理员消息确定
  onOkGroupManage = () => {
    const {currentItem} = this.state
    this.refs.groupManageModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({groupManageLoading: true})
      sendGroupMessage(currentItem.roomId, params).then(() => {
        this.setState({groupManageLoading: false})
        this.onCancelGroupManage()
        message.success('发送成功！')
      }).catch(() => {
        this.setState({groupManageLoading: false})
      })
    })
  }

  // 发送群管理员消息取消
  onCancelGroupManage = () => {
    this.setState({groupManageVisible: false})
    this.refs.groupManageModal.resetFields()
  }

  // 打开禁言弹框
  openBanned = (currentItem) => {
    this.setState({bannedVisible: true, currentItem})
  }

  // 禁言确定
  onOkBanned = () => {
    const {currentItem, tableList} = this.state
    let txt = currentItem.isBanned ? '解除禁言' : '全员禁言'
    this.refs.bannedModal.validateFields((err, values) => {
      if (err) {
        return
      }
      this.setState({bannedLoading: true})
      groupBanned(currentItem.roomId).then(() => {
        this.onCancelBanned()
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (+v.roomId === +currentItem.roomId) {
            v.isBanned = !v.isBanned
          }
        })
        this.setState({bannedLoading: false, tableList: tableList2})
        message.success(`${txt}成功！`)
      }).catch(() => {
        this.setState({bannedLoading: false})
      })
    })
  }

  // 禁言取消
  onCancelBanned = () => {
    this.setState({bannedVisible: false})
    this.refs.bannedModal.resetFields()
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
      limitVisible,
      limitLoading,
      delVisible,
      delLoading,
      currentItem,
      limitArr,
      allManageVisible,
      allManageLoading,
      groupManageVisible,
      groupManageLoading,
      bannedVisible,
      bannedLoading,
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
    let auth1 = !!authList.filter(v => +v === 1409).length // 建群限制权限
    let auth2 = !!authList.filter(v => +v === 1410).length // 发送管理员消息

    return (
      <div>
        <div className="pageTitle">群聊管理</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        {
          (auth1 || auth2) &&
          <div className="clearfix">
            <div className="fr mb5">
              {auth1 && <Button onClick={this.openLimit}>建群限制</Button>}
              {auth2 && <Button onClick={this.openAllManage} className="ml10">发送管理员消息</Button>}
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

        {/* 建群限制弹框 */}
        <LimitModal
          changeLimitArr={this.changeLimitArr.bind(this)}
          limitArr={limitArr}
          ref="limitModal"
          onOk={this.onOkLimit}
          onCancel={this.onCancelLimit}
          visible={limitVisible}
          confirmLoading={limitLoading} />

        {/* 解散群弹框 */}
        <DelModal
          ref="delModal"
          onOk={this.onOkDel}
          onCancel={this.onCancelDel}
          visible={delVisible}
          item={currentItem}
          confirmLoading={delLoading} />

        {/* 禁言弹框 */}
        <BannedModal
          ref="bannedModal"
          onOk={this.onOkBanned}
          onCancel={this.onCancelBanned}
          item={currentItem}
          visible={bannedVisible}
          confirmLoading={bannedLoading} />

        {/* 发送所有管理员消息弹框 */}
        <AllManageModal
          ref="allManageModal"
          onOk={this.onOkAllManage}
          onCancel={this.onCancelAllManage}
          visible={allManageVisible}
          confirmLoading={allManageLoading} />

        {/* 发送群管理员弹框 */}
        <GroupManageModal
          ref="groupManageModal"
          onOk={this.onOkGroupManage}
          onCancel={this.onCancelGroupManage}
          item={currentItem}
          visible={groupManageVisible}
          confirmLoading={groupManageLoading} />
      </div>
    );
  }
}