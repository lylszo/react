import React, { Component } from 'react'
import { balanceList, balanceTotal } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Modal, Select } from 'antd'
import { f_eventType, f_operation, f_encodeId, f_decodeId } from '@/tool/filter'
import moment from 'moment'

const { RangePicker } = DatePicker
const { Option } = Select

// 搜索表单
const SearchForm = Form.create({ name: 'assetRecordList' })(
  class extends Component {

    state = {
      disabledDate: () => false, // 禁止选择的日期
    }

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
            params.startTime = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.endTime = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
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
              <Input allowClear placeholder="请输入手机号" />
            )}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="时间">
            {getFieldDecorator('time', {
              initialValue: [moment().subtract(30, 'day'), moment()]
            })(
              <RangePicker allowClear={false} />
            )}
          </Form.Item>
          <Form.Item label="交易动作">
            {getFieldDecorator('operation', {
              initialValue: '5,6'
            })(
              <Select>
                <Option value="5,6">全部</Option>
                <Option value="5">转入</Option>
                <Option value="6">转出</Option>
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
  constructor(props) {
    super(props)

    // 状态
    this.state = {
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
      totalItems: [], // 当前搜索结果对应的统计数据
      totalVisible: false, // 是否显示统计弹框
      totalLoading: false, // 合计列表loading
    }
  }

  // 获取智能宝列表
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
      let selectKeys = ['coinId', 'status'] // 下拉选择的参数
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
                   {
                     startTime: moment(moment().subtract(15, 'day').format('YYYY-MM-DD') + ' 00:00:00').utc().format(),
                     endTime: moment(moment().format('YYYY-MM-DD') + ' 23:59:59').utc().format(),
                     operation: '5,6',
                     ...searchParams,
                     page: currentPage,
                     event: 36,
                     currencyId: 1,
                     pageSize: 10
                   }
                   : 
                   {
                     startTime: moment(moment().subtract(15, 'day').format('YYYY-MM-DD') + ' 00:00:00').utc().format(),
                     endTime: moment(moment().format('YYYY-MM-DD') + ' 23:59:59').utc().format(),
                     operation: '5,6',
                     ...this.state.currentParams,
                     page: currentPage,
                     event: 36,
                     currencyId: 1,
                     pageSize: 10
                   }
    this.setState({tableLoading: true, currentPage: currentPage})
    balanceList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 整理列表项
  getColumns() {
    return [
      {
        title: '用户ID',
        dataIndex: 'userId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '手机号码',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      }, {
        title: '邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '交易动作',
        dataIndex: 'operation',
        render: (text) => (f_operation[text] || '-')
      }, {
        title: '事件类型',
        dataIndex: 'event',
        render: (text) => (f_eventType[text] || '-')
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '操作人',
        dataIndex: 'createdBy',
        render: (text) => (text || '-')
      }, {
        title: '记录时间',
        dataIndex: 'createTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '备注',
        dataIndex: 'remarks',
        render: text => {
          if (text && text.length > 10) {
            return <span title={text}>{text.slice(0, 10) + '...'}</span>
          } else {
            return text || '-'
          }
        }
      }
    ]
  }

  // 打开/关闭 合计弹框
  totalModal = (open) => {
    if (open) {
      const {currentParams} = this.state
      let params = {
        ...currentParams,
        page: undefined, 
        pageSize: undefined,
        currencyId: 1
      }
      this.setState({totalLoading: true})
      balanceTotal(params).then(data => {
        this.setState({totalItems: data.data.balanceTotalItems, totalLoading: false})
      }).catch(() => {
        this.setState({totalLoading: false, totalItems: []})
      })
    }
    this.setState({
      totalVisible: open ? true : false
    })
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {tableList, meta, tableLoading, currentPage, totalItems, totalVisible, totalLoading} = this.state
    const pageSet = {
      showQuickJumper: true,
      defaultCurrent: 1,
      total: meta.totalCount,
      onChange: this.getList,
      current: currentPage,
      showTotal: total => `共${total}条`,
      size: 'small'
    }
    // 统计表格列配置
    const totalColumns = [
      {
        title: '币种',
        dataIndex: 'coinCode',
        render: (text) => (text || '-')
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }
    ]

    return (
      <div>
        <div className="pageTitle">充值YBT余额</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} />
        <div className="clearfix mb5">
          <div className="fr">
            <Button icon="unordered-list" className="vat" onClick={() => this.totalModal(1)} loading={tableLoading}>合计</Button>
          </div>
        </div>
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 统计数据弹框 */}
        <Modal
          title='合计'
          footer={null}
          onCancel={() => this.totalModal()}
          visible={totalVisible}
          maskClosable={false}>
            <Table
              className="smallTable"
              loading={totalLoading}
              rowKey={(record, i) => i}
              dataSource={totalItems}
              pagination={false}
              columns={totalColumns} />
        </Modal>

      </div>
    );
  }
}