import React, { Component } from 'react'
import { getBackMoneyList, getValidCoinList } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Select } from 'antd'
import MyContext from '@/tool/context'
import moment from 'moment'
import { f_encodeId, f_decodeId } from '@/tool/filter'

const { RangePicker } = DatePicker
const Option = Select.Option

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
      const { loading, validList } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('uid', {
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
          <Form.Item label="时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="合约编号">
            {getFieldDecorator('contractId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入合约编号" />
            )}
          </Form.Item>
          <Form.Item label="订单编号">
            {getFieldDecorator('orderId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入订单编号" />
            )}
          </Form.Item>
          <Form.Item label="借贷币种">
            {getFieldDecorator('lendCoinId', {
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
                  validList.map(item => {
                    return <Option value={item.id} key={item.id}>{item.coinName}</Option>
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
      validList: [], // 可以借贷的币种列表
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.uid) {
      let code = f_decodeId(pageOrSearch.uid)[0]
      if (code) {
        pageOrSearch.uid = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['lendCoinId'] // 下拉选择的参数
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
    getBackMoneyList(params).then(data => {
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
        dataIndex: 'uid',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '手机',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '合约编号',
        dataIndex: 'contractId',
        render: (text) => (text || '-')
      }, {
        title: '订单编号',
        dataIndex: 'orderId',
        render: (text) => (text || '-')
      }, {
        title: '借贷币种',
        dataIndex: 'lendCoinName',
        render: (text) => (text || '-')
      }, {
        title: '还款金额',
        dataIndex: 'backAmount',
        render: (text) => (text || '-')
      }, {
        title: '还款时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '-')
      }
    ]
    return columns
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    getValidCoinList().then(data => {
      this.setState({validList: data.data.items || []})
    })
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      validList, 
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
        <div className="pageTitle">还款记录</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} validList={validList}/>
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