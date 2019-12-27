import React, { Component } from 'react'
import { getFriendsList } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Select } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'
import { f_encodeId, f_decodeId, f_addFriendType, ObjToArr } from '@/tool/filter'

const { RangePicker } = DatePicker
const { Option } = Select

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
          <Form.Item label="好友ID">
            {getFieldDecorator('friendId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入好友ID" />
            )}
          </Form.Item>
          <Form.Item label="好友手机号">
            {getFieldDecorator('phone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="好友邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="添加时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="添加方式">
            {getFieldDecorator('addingMethod', {
              initialValue: '-1'
            })(
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => 
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_addFriendType).map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
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

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    const info = this.props.location.state ? this.props.location.state.item : {}

    // 状态
    this.state = {
      info, // 通过路由传来的用户信息
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    const {info} = this.state
    let searchParams
    let currentPage = 1
    if (pageOrSearch.friendId) {
      let code = f_decodeId(pageOrSearch.friendId)[0]
      if (code) {
        pageOrSearch.friendId = code
      } else {
        message.info('好友ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['addingMethod'] // 下拉选择的参数
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
    getFriendsList(info.id, params).then(data => {
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
    item.info = this.state.info
    this.props.history.push({
      pathname: '/personalRecord',
      state: {item}
    })    
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '好友ID',
        dataIndex: 'id',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '好友手机号',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '好友邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '添加方式',
        dataIndex: 'addingMethod',
        render: (text) => (f_addFriendType[text] || '-')
      }, {
        title: '添加时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1426).length // 聊天记录

    if (auth1) {
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width: 100,
        render: (item) => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.toRecord(item)}>聊天记录</Button>}
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
        <div className="pageTitle">好友列表（ID：{f_encodeId(info.id)}）</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt10"
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}