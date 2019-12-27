import React, { Component } from 'react'
import { balanceList, getAllCoinList, dlBalance, balanceTotal } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal } from 'antd'
import { f_eventType, f_operation, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
const Option = Select.Option

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
          if (values.time) {
            params.startTime = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.endTime = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
          }
          delete params.time
          this.props.getList(params)
        })      
      }
    }

    // 点击选择时间的回调
    calendarChange = (val => {
      if (!val[1]) {
        this.setState({
          disabledDate: (time) => {
            if (time > moment(val[0]).subtract(31, 'day').valueOf() && time < moment(val[0]).add(31, 'day')) {
              return false
            } else {
              return true
            }
          }
        })
      } else {
        this.setState({disabledDate: () => false})
      }
    })

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form;
      const { loading, coinList, userId, coinId } = this.props
      const { disabledDate } = this.state
      return (
        <Form className="searchForm" layout="inline">
          {
            userId ?
            <Form.Item label="用户ID">
              {getFieldDecorator('userId', {
                initialValue: userId,
                rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
              })(
                <Input allowClear placeholder="用户ID" />
              )}
            </Form.Item>
            :
            <Form.Item label="用户ID">
              {getFieldDecorator('userId', {
                initialValue: '',
                rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
              })(
                <Input allowClear placeholder="用户ID" />
              )}
            </Form.Item>
          }
          <Form.Item label="手机号">
            {getFieldDecorator('phone', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号" />
            )}
          </Form.Item>
          <Form.Item label="用户邮箱">
            {getFieldDecorator('email')(
              <Input allowClear placeholder="邮箱" />
            )}
          </Form.Item>
          <Form.Item label="时间">
            {getFieldDecorator('time', {
              initialValue: [moment().subtract(15, 'day'), moment()]
            })(
              <RangePicker allowClear={false} onCalendarChange={this.calendarChange} disabledDate={disabledDate} renderExtraFooter={() => <div>注：时间跨度不能超过31天</div>}/>
            )}
          </Form.Item>
          <Form.Item label="交易动作">
            {getFieldDecorator('operation', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_operation).map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="事件类型">
            {getFieldDecorator('event', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_eventType).filter(v => v.id!== '32').map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          {
            coinId ?
            <Form.Item label="币种">
              {getFieldDecorator('currencyId', {
                initialValue: coinId
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
            :
            <Form.Item label="币种">
              {getFieldDecorator('currencyId', {
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
          }
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

    const userId = props.location.state && props.location.state.userId // 其他页面传来的用户ID（加密后的ID）
    const coinId = props.location.state && props.location.state.coinId // 其他页面传来的币种ID

    // 状态
    this.state = {
      userId: userId, // 其他页面传的用户ID（加密后的ID）
      coinId: coinId, // 其他页面传来的币种ID
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      coinList: [], // 币种列表
      totalItems: [], // 当前搜索结果对应的统计数据
      currentParams: {}, // 当前查询参数
      totalVisible: false, // 是否显示统计弹框
      exportTime: 0, // 上次导出成功的时间
      excelLoading: false, // 导出表格loading
      totalLoading: false, // 合计列表loading
    }
  }

  // 获取列表
  getList = (pageOrSearch, reset) => {
    if (!pageOrSearch.userId) {
      this.setState({userId: ''})
    }
    if (!pageOrSearch.currencyId || pageOrSearch.currencyId === '-1') {
      this.setState({coinId: ''})
    }
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
      let selectKeys = ['operation', 'event', 'currencyId'] // 下拉选择的参数
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
                     ...searchParams,
                     page: currentPage,
                     pageSize: 10
                   }
                   : 
                   {
                     startTime: moment(moment().subtract(15, 'day').format('YYYY-MM-DD') + ' 00:00:00').utc().format(),
                     endTime: moment(moment().format('YYYY-MM-DD') + ' 23:59:59').utc().format(),
                     ...this.state.currentParams,
                     page: currentPage,
                     pageSize: 10
                   }
    this.setState({tableLoading: true, currentPage: currentPage})
    balanceList(params).then(data => {
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
        title: '币种',
        dataIndex: 'currencyCode',
        render: (text) => (text || '-')
      }, {
        title: '交易动作',
        dataIndex: 'operation',
        render: (text) => (f_operation[text] || '-')
      }, {
        title: '交易对象ID',
        dataIndex: 'fromUserId',
        render: (text) => (+text ? f_encodeId(text) : '-')
      }, {
        title: '事件类型',
        dataIndex: 'event',
        render: (text) => (f_eventType[text] || '-')
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
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
        pageSize: undefined
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
    getAllCoinList().then(data => {
      this.setState({coinList: data.data})
    })
    const {userId, coinId} = this.state
    if (userId || coinId) {
      let params = {
        userId: userId || undefined,
        currencyId: coinId || undefined
      }
      this.getList(params)
    } else {
      this.getList(1)
    }
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
    if (currentParams2.currencyId) {
      currentParams2.currencyId = coinList.filter(v => +v.coinId === +currentParams2.currencyId)[0].shortName
    }
    if (currentParams2.event) {
      currentParams2.event = f_eventType[currentParams2.event]
    }
    if (currentParams2.operation) {
      currentParams2.operation = f_operation[currentParams.operation]
    }
    if (currentParams2.userId) {
      currentParams2.userId = f_encodeId(currentParams2.userId)
    }
    if (currentParams2.startTime) {
      currentParams2.startTime = moment(currentParams2.startTime).format('YYYY-MM-DD HH:mm:ss')
    }
    if (currentParams2.endTime) {
      currentParams2.endTime = moment(currentParams2.endTime).format('YYYY-MM-DD HH:mm:ss')
    }
    const searchObj = {
      currencyId: "币种",
      email: "邮箱",
      endTime: "结束时间",
      event: "事件类型",
      operation: "交易动作",
      phone: "手机号",
      startTime: "开始时间",
      userId: "用户ID"
    }
    let titleArr = []
    let params = {timeZone: moment().utcOffset()}
    for (let i in currentParams) {
      if (searchObj[i]) {
        params[i] = currentParams[i]
        titleArr.push(searchObj[i] + '：' + currentParams2[i])
      }
    }
    params.title = `资金流水（${titleArr.length ? titleArr.join('，') : '所有'}）`
    this.setState({excelLoading: true})
    dlBalance(params).then(() => {
      message.success('请求成功，请在“个人中心-文件下载”页面查看文件！')
      this.setState({excelLoading: false, exportTime: new Date().getTime()})
    }).catch(() => {
      this.setState({excelLoading: false})
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
      totalItems, 
      userId, 
      coinId, 
      totalVisible,
      totalLoading,
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
    const auth1 = !!authList.filter(v => +v === 4015).length // 导出权限

    return (
      <div>
        <div className="pageTitle">资金流水</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList} userId={userId} coinId={coinId}/>
        <div className="clearfix mb5 tar">
          <Button icon="unordered-list" className="vat" onClick={() => this.totalModal(1)} loading={tableLoading}>合计</Button>
          { auth1 && <Button className="ml10 vat" shape="round" icon="download" onClick={this.outExcel} loading={this.state.excelLoading}>导出</Button>}
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