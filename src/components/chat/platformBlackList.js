import React, { Component } from 'react'
import { getPlatformBlackList, platformOutBlack } from '@/axios'
import { Table, Form, Input, Button, message, Modal, Row, Col } from 'antd'
import MyContext from '@/tool/context'
import { f_encodeId, f_decodeId } from '@/tool/filter'
import moment from 'moment'

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
          <Form.Item label="手机号">
            {getFieldDecorator('phone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="请输入邮箱" />
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

// 移出平台黑名单弹框
const BlackModal = Form.create({ name: 'blackModal' })(
  class extends Component {
    // 渲染
    render() {
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      return (
        <Modal
          title="移出平台黑名单"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          width="400px"
          maskClosable={false}
          onCancel={onCancel}>
          <Row className="mb15">
            <Col span={8}><div className="tar babelColor">成员昵称：</div></Col>
            <Col span={12}><div className="">{item.nickName || '-'}</div></Col>
          </Row>
          <Row className="mb15">
            <Col span={8}><div className="tar babelColor">成员ID：</div></Col>
            <Col span={12}><div className="">{f_encodeId(item.id) || '-'}</div></Col>
          </Row>
          <Row className="mb15">
            <Col span={8}><div className="tar babelColor">账号：</div></Col>
            <Col span={12}><div className="">{item.phone || item.email || '-'}</div></Col>
          </Row>              
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
    blackVisible: false, // 是否显示移出平台黑名单弹框 
    blackLoading: false, // 移出平台黑名单弹框确定loading
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
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? 
                   {...searchParams, page: currentPage, pageSize: 10} : 
                   {...this.state.currentParams, page: currentPage, pageSize: 10}
    this.setState({tableLoading: true, currentPage: currentPage})
    getPlatformBlackList(params).then(data => {
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

  // 添加群成员到平台黑名单，打开弹框
  outBlackList = (item) => {
    this.setState({currentItem: item, blackVisible: true})  
  }

  // 添加平台黑名单确认
  onOkBlack = () => {
    const {currentItem} = this.state
    this.setState({blackLoading: true})
    platformOutBlack(currentItem.id).then(() => {
      let tableList2 = this.state.tableList.concat()
      tableList2.forEach((v, i, a) => {
        if (v.id === currentItem.id) {
          a.splice(i, 1)
        }
      })
      this.setState({blackLoading: false, tableList: tableList2})
      this.onCancelBlack()
      message.success('移出成功！')
    }).catch(() => {
      this.setState({blackLoading: false})
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
        dataIndex: 'nickName',
        render: (text) => (text || '-')
      }, {
        title: '手机号',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '操作人',
        dataIndex: 'operator',
        render: (text) => (text || '-')
      }, {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }, {
        title: '原因',
        dataIndex: 'reason',
        render: (text) => {
          if (text && text.length > 10) {
            return <span title={text}>{text.slice(0, 10) + '...'}</span>
          } else {
            return text || '-'
          }
        }
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1433).length // 查看好友列表权限

    if (auth1) {
      columns.push({
        title: '操作',
        fixed: 'right',
        width: 140,
        render: (item) => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.outBlackList(item)}>移出平台黑名单</Button>}
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
      currentItem,
      blackLoading,
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
        <div className="pageTitle">平台黑名单</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt10"
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 移出平台黑名单弹框 */}
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