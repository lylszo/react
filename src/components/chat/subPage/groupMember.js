import React, { Component } from 'react'
import { getRoomMemberList, groupSendLimit, groupMemberToBlack, delRoomMember } from '@/axios'
import { Table, Form, Input, Button, Modal, message, Row, Col, DatePicker } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'
import { f_encodeId, f_decodeId } from '@/tool/filter'

const { TextArea } = Input
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
          <Form.Item label="成员ID">
            {getFieldDecorator('memberId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输成员ID" />
            )}
          </Form.Item>
          <Form.Item label="成员手机号">
            {getFieldDecorator('memberPhone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="成员邮箱">
            {getFieldDecorator('memberEmail')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="入群时间">
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

// 综合弹框
const MyModal = Form.create({ name: 'myModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, modalTitle, modalType } = this.props
      return (
        <Modal
          title={modalTitle}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">成员昵称：</div></Col>
              <Col span={16}><div className="">{item.nickName || '-'}</div></Col>
            </Row>
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">成员ID：</div></Col>
              <Col span={16}><div className="">{item.memberId || '-'}</div></Col>
            </Row>
            <Row className="mb15">
              <Col span={5}><div className="tar babelColor">成员账号：</div></Col>
              <Col span={16}><div className="">{item.memberPhone || item.memberEmail || '-'}</div></Col>
            </Row>
            {
              modalType === 2 && false &&
              <Form.Item label="禁言原因">
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
            }
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

    const info = this.props.location.state ? this.props.location.state.item : {}

    // 状态
    this.state = {
      info, // 通过路由传来的群聊信息
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
      currentItem: {}, // 当前处理对象
      myVisible: false, // 是否显示解散群弹框
      myLoading: false, // 解散群弹框确认loading
      modalType: 1, // 打开的是哪个弹框
      modalTitle: '' // 弹框标题
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    const {info} = this.state
    let searchParams
    let currentPage = 1
    if (pageOrSearch.memberId) {
      let code = f_decodeId(pageOrSearch.memberId)[0]
      if (code) {
        pageOrSearch.memberId = code
      } else {
        message.info('成员ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? 
                   {...searchParams, page: currentPage, pageSize: 10, roomId: info.roomId} : 
                   {...this.state.currentParams, page: currentPage, pageSize: 10, roomId: info.roomId}
    this.setState({tableLoading: true, currentPage: currentPage})
    // 模拟数据
    getRoomMemberList(params).then(data => {
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

  // 跳转到用户详情
  toDetail = (item) => {
    this.props.history.push({
      pathname: '/userDetail',
      state: {
        id: item.memberId
      }
    })    
  }

  // 打开弹框
  openModal = (item, modalType) => {
    let typeToTitle = {
      '1': '群成员解禁',
      '2': '群成员禁言',
      '4': '添加到群黑名单',
      '5': '踢除群成员'
    }
    this.setState({modalType, modalTitle: typeToTitle[modalType], currentItem: item, myVisible: true})
  }

  // 弹框确定
  onOkMy = () => {
    const {currentItem, tableList, modalType, info} = this.state
    if (modalType === 1 || modalType === 2) { // 1 解禁 / 2 禁言
      this.refs.myModal.validateFields((err, values) => {
        if (err) {
          return
        }
        let params = {
          roomId: info.roomId
        }
        this.setState({myLoading: true})
        groupSendLimit(currentItem.memberId, params).then(() => {
          let tableList2 = [...tableList]
          tableList2.forEach(v => {
            if (+v.memberId === +currentItem.memberId) {
              v.isBanned = v.isBanned === 'no_open' ? 'admin_banned' : 'no_open'
            }
          })
          this.setState({myLoading: false, tableList: tableList2})
          this.onCancelMy()
          message.success(`${modalType === 1 ? '解禁' : '禁言'}成功`)
        }).catch(() => {
          this.setState({myLoading: false})
        })
      })      
    } else if (modalType === 4) { // 4 添加群黑名单
      let params = {
        roomId: info.roomId
      }
      this.setState({myLoading: true})
      groupMemberToBlack(currentItem.memberId, params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach((v, i, a) => {
          if (+v.memberId === +currentItem.memberId) {
            a.splice(i, 1)
          }
        })
        this.setState({myLoading: false, tableList: tableList2})
        this.onCancelMy()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({myLoading: false})
      })
    } else if (modalType === 5) { // 踢除
      let params = {
        memberId: currentItem.memberId
      }
      this.setState({myLoading: true})
      delRoomMember(info.roomId, params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach((v, i, a) => {
          if (+v.memberId === +currentItem.memberId) {
            a.splice(i, 1)
          }
        })
        this.setState({myLoading: false, tableList: tableList2})
        this.onCancelMy()
        message.success('踢除成功！')
      }).catch(() => {
        this.setState({myLoading: false})
      })
    }
  }

  // 弹框取消
  onCancelMy = () => {
    this.setState({myVisible: false})
    this.refs.myModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '成员ID',
        dataIndex: 'memberId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '成员昵称',
        dataIndex: 'nickName',
        render: (text) => (text || '-')
      }, {
        title: '成员手机号',
        dataIndex: 'memberPhone',
        render: (text) => (text || '-')
      }, {
        title: '成员邮箱',
        dataIndex: 'memberEmail',
        render: (text) => (text || '-')
      }, {
        title: '入群时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1414).length // 禁言/解禁 权限
    let auth2 = !!authList.filter(v => +v === 1415).length // 踢除权限
    let auth3 = !!authList.filter(v => +v === 1416).length // 添加黑名单
    let auth4 = !!authList.filter(v => +v === 1407).length // 查看用户信息

    if (auth1 || auth2 || auth3 || auth4) {
      let len = [auth1, auth2, auth3, auth4].filter(v => v).length
      let width = 300
      if (len === 3) {
        width = 250
      } else if (len === 2) {
        width = 200
      } else if (len === 1) {
        width = 110
      }
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width: width,
        render: (item) => {
          return (
            <div>
              {auth1 && item.isBanned !== 'no_open' && <Button size="small" onClick={() => this.openModal(item, 1)}>解禁</Button>}
              {auth1 && item.isBanned === 'no_open' && <Button size="small" onClick={() => this.openModal(item, 2)}>禁言</Button>}
              {auth3 && !item.isBlacklist && <Button size="small" onClick={() => this.openModal(item, 4)}>添加群黑名单</Button>}
              {auth2 && <Button size="small" onClick={() => this.openModal(item, 5)}>踢除</Button>}
              {auth4 && <Button size="small" onClick={() => this.toDetail(item)}>用户信息</Button>}
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
      myVisible,
      myLoading,
      currentItem,
      modalTitle,
      modalType,
      info,
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
        <div className="pageTitle">群成员列表（群ID：{info.roomId}）</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt10"
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 禁言等操作弹框 */}
        <MyModal
          modalTitle={modalTitle}
          modalType={modalType}
          ref="myModal"
          onOk={this.onOkMy}
          onCancel={this.onCancelMy}
          visible={myVisible}
          item={currentItem}
          confirmLoading={myLoading} />
      </div>
    );
  }
}