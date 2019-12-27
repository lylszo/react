import React, { Component } from 'react'
import { gcBalance } from '@/axios'
import { Table, Form, Input, Button, DatePicker, Select } from 'antd'
import MyContext from '@/tool/context'
import { f_globalCardTradeType, ObjToArr} from '@/tool/filter'
import moment from 'moment'

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
          // 查询全球付卡注意传的时间一定是北京时间
          if (values.time && values.time.length) {
            params.beginTime = moment(params.time[0].startOf('day')).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
            params.endTime = moment(params.time[1].endOf('day')).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
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
          <Form.Item label="平台交易号">
            {getFieldDecorator('tradNo', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入平台交易号" />
            )}
          </Form.Item>
          <Form.Item label="商户名称">
            {getFieldDecorator('merchantName')(
              <Input allowClear placeholder="请输入商户名称" />
            )}
          </Form.Item>
          <Form.Item label="交易时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="交易类型">
            {getFieldDecorator('transType', {
              initialValue: '0'
            })(
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => 
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }>
                <Option value="0">全部</Option>
                {
                  ObjToArr(f_globalCardTradeType).map(v => (
                    <Option value={v.id} key={v.id}>{v.name}</Option>
                  ))
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
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    const { info } = this.props
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    let params = searchParams ? 
                   {...searchParams, page: currentPage, cardNo: info.cardNo} : 
                   {...this.state.currentParams, page: currentPage, cardNo: info.cardNo}
    this.setState({tableLoading: true, currentPage: currentPage})
    gcBalance(params).then(data => {
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
        title: '平台交易号',
        dataIndex: 'tradeNo',
        render: (text) => (text || '-')
      }, {
        title: '商户名称',
        dataIndex: 'merchantName',
        render: (text) => (text || '-')
      }, {
        title: '交易类型',
        dataIndex: 'transType',
        render: (text) => (f_globalCardTradeType[text] || '-')
      }, {
        title: '交易时间（北京时间）',
        dataIndex: 'transLocalTime',
        render: (text) => (text || '-')
      }, {
        title: '交易币种',
        dataIndex: 'settleCurrencyType',
        render: (text) => (text || '-')
      }, {
        title: '交易金额',
        dataIndex: 'payAmount',
        render: (text) => (text || '-')
      }
    ]
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
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt10"
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}