import React, { Component } from 'react'
import { lsSmartList, getAllCoinList, lsTimeAndRateList, dlLargeSmart } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal } from 'antd'
import { f_encodeId, f_decodeId, ObjToArr, f_largeSmartStatus } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
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
      const { loading, coinList, timeList, revenueList } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('accountId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="手机号">
            {getFieldDecorator('phoneNum', {
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
            {getFieldDecorator('time')(
              <RangePicker />
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
          <Form.Item label="合约时长">
            {getFieldDecorator('days', {
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
                  timeList.map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="收益率">
            {getFieldDecorator('rate', {
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
                  revenueList.map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('status', {
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
                  ObjToArr(f_largeSmartStatus).map(item => {
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

    // 状态
    this.state = {
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      coinList: [], // 币种列表
      excelLoading: false, // 导出表格loading
      currentParams: {}, // 当前查询参数
      revenueList: [], // 收益率下拉列表
      timeList: [], // 合约时长下拉列表
      totalItems: [], // 当前搜索结果对应的统计数据
      totalVisible: false, // 是否显示统计弹框
      exportTime: 0, // 上次导出成功的时间
    }
  }

  // 获取智能宝列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.accountId) {
      let code = f_decodeId(pageOrSearch.accountId)[0]
      if (code) {
        pageOrSearch.accountId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['coinId', 'days', 'rate', 'status'] // 下拉选择的参数
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
    lsSmartList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        totalItems: data.data.largeTotalItems,
        meta: data.data.meta || {},
        tableLoading: false
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 整理列表项
  getColumns() {
    const {authList} = this.context

    let list = [
      {
        title: '用户ID',
        dataIndex: 'accountId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '手机号码',
        dataIndex: 'phone',
        render: (text) => (text || '-')
      },{
        title: '邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '币种',
        dataIndex: 'coinCode',
        render: (text) => (text || '-')
      }, {
        title: '合约时长（天）',
        dataIndex: 'days',
        render: (text) => (text || '-')
      }, {
        title: '收益率',
        dataIndex: 'rate',
        render: (text) => (text ? `${text}%` : '-')
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '转入时间',
        dataIndex: 'depositDate',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_largeSmartStatus[text] || '-')
      }
    ]

    let auth1 = !!authList.filter(v => +v === 9021).length // 查看详情权限

    if (auth1) {
      list.push({
        title: '操作',
        width: 90,
        fixed: 'right',
        render: item => <Button size="small"  onClick={() => {this.props.history.push({pathname: '/largeSmartDetail', state:{item: item}})}}>查看详情</Button>
      })
    }

    return list
  }

  // 导出表格
  outExcel = () => {
    const {currentParams, coinList, exportTime, tableList} = this.state
    if (new Date().getTime() - exportTime < 5000) {
      message.warning('操作过于频繁！')
      return
    }
    if (!tableList || !tableList.length) {
      message.warning('没有数据可以导出，请尝试其他查询条件！')
      return
    }
    const currentParams2 = {...currentParams}
    if (currentParams2.coinId) {
      currentParams2.coinId = coinList.filter(v => +v.coinId === +currentParams2.coinId)[0].shortName
    }
    if (currentParams2.days) {
      currentParams2.days = currentParams2.days + '天'
    }
    if (currentParams2.rate) {
      currentParams2.rate = currentParams2.rate + '%'
    }
    if (currentParams2.accountId) {
      currentParams2.accountId = f_encodeId(currentParams2.accountId)
    }
    if (currentParams2.startTime) {
      currentParams2.startTime = moment(currentParams2.startTime).format('YYYY-MM-DD HH:mm:ss')
    }
    if (currentParams2.endTime) {
      currentParams2.endTime = moment(currentParams2.endTime).format('YYYY-MM-DD HH:mm:ss')
    }
    const searchObj = {
      'accountId': '用户ID',
      'phoneNum': '手机号',
      'email': '邮箱',
      'coinId': '币种',
      'days': '合约时长',
      'rate': '收益率',
      'status': '状态',
      'startTime': '开始时间',
      'endTime': '结束时间',
    }
    let titleArr = []
    let params = {timeZone: moment().utcOffset()}
    for (let i in currentParams) {
      if (searchObj[i]) {
        params[i] = currentParams[i]
        titleArr.push(searchObj[i] + '：' + currentParams2[i])
      }
    }
    params.title = `LARGE智能宝资产列表（${titleArr.length ? titleArr.join('，') : '所有'}）`
    this.setState({excelLoading: true})
    dlLargeSmart(params).then(() => {
      message.success('请求成功，请在“个人中心-文件下载”页面查看文件！')
      this.setState({excelLoading: false, exportTime: new Date().getTime()})
    }).catch(() => {
      this.setState({excelLoading: false})
    })
  }

  // 打开合计弹框
  totalModal = (open) => {
    this.setState({totalVisible: open ? true : false})
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    // 币种列表
    getAllCoinList().then(data => {
      this.setState({coinList: data.data || []})
    })
    // 下拉的合约时长和收益率参数
    lsTimeAndRateList().then(({data}) => {
      let daysList = [...new Set(data.daysList || [])]
      let rateList = [...new Set(data.rateList || [])]
      rateList = rateList.sort((a, b) => a - b)
      let timeList = daysList.map(v => ({id: v, name: v + '天'}))
      let revenueList = rateList.map(v => ({id: v, name: v + '%'}))
      this.setState({revenueList, timeList})
    })
  }

  // 渲染
  render() {
    const { 
      tableList,
      meta,
      tableLoading,
      currentPage,
      coinList,
      revenueList,
      timeList,
      totalVisible,
      totalItems,
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
    const {authList} = this.context

    return (
      <div>
        <div className="pageTitle">LARGE智能宝资产列表</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList} revenueList={revenueList} timeList={timeList} />
        {
          <div className="clearfix mb5 tar">
            <Button icon="unordered-list" className="vat" onClick={() => this.totalModal(1)}>合计</Button>
            {
              !!authList.filter(v => +v === 9023).length &&
              <Button className="ml10 vat" shape="round" icon="download" onClick={this.outExcel} loading={this.state.excelLoading}>导出</Button>
            }
          </div>
        }         
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
              rowKey={(record, i) => i}
              dataSource={totalItems}
              pagination={false}
              columns={totalColumns} />
        </Modal>
      </div>
    );
  }
}