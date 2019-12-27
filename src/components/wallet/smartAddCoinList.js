import React, { Component } from 'react'
import { getSmartRechargeList, getAllCoinList, dlSmartRecharge } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message } from 'antd'
import moment from 'moment'
import MyContext from '@/tool/context'
import { f_rechargeStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'

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
            params.createdStartAt = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.createdEndAt = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
          }
          if (values.time2 && values.time2.length) {
            params.completedStartAt = moment(params.time2[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.completedEndAt = moment(params.time2[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
          }
          delete params.time
          delete params.time2
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
            {getFieldDecorator('accountId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="来源地址">
            {getFieldDecorator('fromAddress')(
              <Input allowClear placeholder="来源地址" />
            )}
          </Form.Item>
          <Form.Item label="交易哈希">
            {getFieldDecorator('txid')(
              <Input allowClear placeholder="请输入交易哈希" />
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
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_rechargeStatus).map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="创建时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="完成时间">
            {getFieldDecorator('time2')(
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

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    // 状态
    this.state = {
      tableList: [], // 列表数据
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页条数
      tableLoading: false, // 列表请求loading
      coinList: [], // 币种列表
      excelLoading: false, // 导出表格loading
      currentParams: {}, // 当前查询参数
      exportTime: 0, // 上次导出成功的时间
    }
  }

  // 获取智能宝列表
  getList = (pageOrSearch, pageSize2) => {
    const {pageSize} = this.state
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
                   {...searchParams, page: currentPage, itemsPerPage: pageSize2 || pageSize} : 
                   {...this.state.currentParams, page: currentPage, itemsPerPage: pageSize2 || pageSize}
    this.setState({tableLoading: true, currentPage: currentPage})
    getSmartRechargeList(params).then(data => {
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
        title: '充值编号',
        dataIndex: 'id',
        render: (text) => (text || '-')
      },
      {
        title: '用户ID',
        dataIndex: 'accountId',
        render: (text) => (f_encodeId(text) || '-')
      },{
        title: '币种',
        dataIndex: 'shortName'
      }, {
        title: '数量',
        dataIndex: 'amount',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '完成时间',
        dataIndex: 'completedAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_rechargeStatus[text] || '-')
      }, {
        title: '确认次数',
        dataIndex: 'confirmedTimes',
        render: (text) => (text || '-')
      }
    ]
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
        if (currentParams2.status) {
          currentParams2.status = f_rechargeStatus[currentParams2.status]
        }
        if (currentParams2.accountId) {
          currentParams2.accountId = f_encodeId(currentParams2.accountId)
        }
        if (currentParams2.createdStartAt) {
          currentParams2.createdStartAt = moment(currentParams2.createdStartAt).format('YYYY-MM-DD HH:mm:ss')
        }
        if (currentParams2.createdEndAt) {
          currentParams2.createdEndAt = moment(currentParams2.createdEndAt).format('YYYY-MM-DD HH:mm:ss')
        }
        if (currentParams2.completedStartAt) {
          currentParams2.completedStartAt = moment(currentParams2.completedStartAt).format('YYYY-MM-DD HH:mm:ss')
        }
        if (currentParams2.completedEndAt) {
          currentParams2.completedEndAt = moment(currentParams2.completedEndAt).format('YYYY-MM-DD HH:mm:ss')
        }
        const searchObj = {
          accountId: '用户ID',
          fromAddress: '来源地址',
          txid: '交易哈希',
          coinId: '币种',
          status: '状态',
          createdStartAt: '创建开始时间',
          createdEndAt: '创建结束时间',
          completedStartAt: '完成开始时间',
          completedEndAt: '完成结束时间',
        }
        let titleArr = []
        let params = {timeZone: moment().utcOffset()}
        for (let i in currentParams) {
          if (searchObj[i]) {
            params[i] = currentParams[i]
            titleArr.push(searchObj[i] + '：' + currentParams2[i])
          }
        }
        params.title = `AI智能宝充币记录（${titleArr.length ? titleArr.join('，') : '所有'}）`
        this.setState({excelLoading: true})
        dlSmartRecharge(params).then(() => {
          message.success('请求成功，请在“个人中心-文件下载”页面查看文件！')
          this.setState({excelLoading: false, exportTime: new Date().getTime()})
        }).catch(() => {
          this.setState({excelLoading: false})
        })
  }

  // 改变每页条数
  onShowSizeChange = (current, pageSize) => {
    this.setState({pageSize})
    this.getList(1, pageSize)
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
    const {tableList, meta, tableLoading, currentPage, coinList} = this.state
    const {authList} = this.context
    const pageSet = {
      showQuickJumper: true,
      defaultCurrent: 1,
      total: meta.totalCount,
      onChange: this.getList,
      current: currentPage,
      showTotal: total => `共${total}条`,
      size: 'small',
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '50', '80', '100'],
      onShowSizeChange: this.onShowSizeChange
    }

    return (
      <div>
        <div className="pageTitle">AI智能宝充币记录</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList}/>
        {
          !!authList.filter(v => +v ===3040).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button className="ml10" shape="round" icon="download" onClick={this.outExcel} loading={this.state.excelLoading}>导出</Button>
            </div>          
          </div>          
        }
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          expandedRowRender={record => (
            <div className="tal pl30">
              <div>地址标签：{record.addressTag || '-'}</div>
              <div>来源地址：{record.address || '-'}</div>
              <div>交易哈希：{record.txid || '-'}</div>
            </div>
          )}
          pagination={pageSet}
          columns={this.getColumns()} />

      </div>
    );
  }
}