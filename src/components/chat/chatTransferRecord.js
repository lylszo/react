import React, { Component } from 'react'
import { testApi, getAllCoinList } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Select } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'
import { f_encodeId, f_decodeId } from '@/tool/filter'

const Option = Select.Option
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
          if (params.sendToId && params.sendToType === 'all') {
            message.warning('请选择发送对象')
            return
          }
          if (params.sendToId && params.sendToType === 'single') {
            let code = f_decodeId(params.sendToId)[0]
            if (code) {
              params.sendToId = code
            } else {
              message.info('好友ID不存在！')
              return     
            }
          }
          if (params.time && params.time.length) {
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
      const { loading, coinList } = this.props
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
          <Form.Item label="转账时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="转账对象ID">
            {getFieldDecorator('sendToId')(
              <Input allowClear placeholder="请输入发送对象ID" />
            )}
          </Form.Item>
          <Form.Item label="币种">
            {getFieldDecorator('coinId', {
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
                  coinList.map(item => {
                    return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
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

    // 状态
    this.state = {
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
      coinList: [], // 币种列表
    }
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
      let selectKeys = ['coinId'] // 下拉选择的参数
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
    // 测试数据
    params.data = {
      items: [
        {
          userId: '3',
          phone: '+8617688889999',
          email: 'liren@qq.com',
          coinName: 'YBT',
          amount: '234',
          transferUserId: '333',
          createdAt: '2019-06-27T02:14:21Z',
        }
      ]
    }
    testApi(params).then(data => {
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
      pathname: '/personalRecord',
      state: {item}
    })    
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '用户ID',
        dataIndex: 'userId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '用户手机',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '用户邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '币种',
        dataIndex: 'coinName',
        render: (text) => (text || '-')
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '转账对象ID',
        dataIndex: 'transferUserId',
        render: (text) => (text || '-')
      }, {
        title: '转账时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]
    return columns
  }

  // 渲染前
  componentWillMount() {
    getAllCoinList().then(data => {
      this.setState({coinList: data.data || []})
    })
    this.getList(1)
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      coinList,
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
        <div className="pageTitle">转账记录</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList}/>
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