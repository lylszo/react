import React, { Component } from 'react'
import { lockedBalance, multipleAddUsd, multipleDelUsd, balanceTotal } from '@/axios'
import { Table, Form, Input, Button, DatePicker, message, Modal } from 'antd'
import { f_eventType, f_operation, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'
import './handleUSD.scss'

const { RangePicker } = DatePicker
const typeArr = [
  {id: 5, name: '去重有效充值USD'},
  {id: 3, name: '去重充值USD'},
  {id: 4, name: '批量有效充值USD'},
  {id: 1, name: '批量充值USD'},
  {id: 2, name: '批量扣除USD'},
]

// 搜索表单
const SearchForm = Form.create({ name: 'userListSearch' })(
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
      const { loading } = this.props
      const { disabledDate } = this.state
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('userId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="用户ID" />
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
              initialValue: [moment().subtract(15, 'day'), moment()]
            })(
              <RangePicker allowClear={false} onCalendarChange={this.calendarChange} disabledDate={disabledDate} renderExtraFooter={() => <div>注：时间跨度不能超过31天</div>}/>
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
      uploadType: 1, // 批量操作类型
      excelLoading: false, // 批量操作按钮loading
      totalItems: [], // 当前搜索结果对应的统计数据
      totalVisible: false, // 是否显示统计弹框
      totalLoading: false, // 合计列表loading
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
      for (let key in pageOrSearch) {
        if (!pageOrSearch[key]) {
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
                     pageSize: 10,
                     currencyId: 1,
                     event: 32
                   }
                   : 
                   {
                     startTime: moment(moment().subtract(15, 'day').format('YYYY-MM-DD') + ' 00:00:00').utc().format(),
                     endTime: moment(moment().format('YYYY-MM-DD') + ' 23:59:59').utc().format(),
                     ...this.state.currentParams,
                     page: currentPage,
                     pageSize: 10,
                     currencyId: 1,
                     event: 32
                   }
    this.setState({tableLoading: true, currentPage: currentPage})
    lockedBalance(params).then(data => {
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
        title: '创建时间',
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

  // 转移click事件
  toFile = (type) => {
    this.setState({uploadType: type}, () => {
      this.refs.excelRef.click()
    })
  }

  // 上传表格获取表格数据
  uploadExcel = () => {
    const {uploadType} = this.state
    this.setState({excelLoading: true})
    if(!this.refs.excelRef.files) {
      this.setState({excelLoading: false})
      return;
    }
    let f = this.refs.excelRef.files[0];
    let reader = new FileReader();
    if (f) {
      let n = /[\s\S]*\.(\w*)$/.exec(f.name)
      if (!n || (n[1] !== 'xlsx' && n[1] !== 'xls')) {
        message.error('请上传后缀名为.xlsx或者.xls的表格文件!')
        this.refs.excelRef.value = '' // 设置选中文件为空
        this.setState({excelLoading: false})
        return
      }
      reader.onload = e => {
        let data = e.target.result;
        this.refs.excelRef.value = '' // 设置选中文件为空
        let wb = window.XLSX.read(data, {
            type: 'binary'
        });
        //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        //wb.Sheets[Sheet名]获取第一个Sheet的数据
        let result = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) // 获取excel对应的json数据
        if (!result.length) {
          message.error('请确认表格Sheet1是否有数据！')
          this.setState({excelLoading: false})
          return;
        }
        if (result.length > 10000) {
          message.error('批量充值数量不能超过10000，请分批充值！')
          this.setState({excelLoading: false})
          return;
        }
        // 对表格数据去两端空格处理
        let trimResult = []
        for (let i = 0; i < result.length; i++) {
          let a = {
            coinId: '1',
            remark: `批量${uploadType === 2 ? '扣除' : '充值'}USD`
          }
          let item = result[i]
          for (let j in item) {
            let key = (j + '').trim()
            let value = (item[j] + '').trim()
            if (key === 'account' || key === 'amount') {
              a[key] = value
            }
          }
          // 判断表格中是否有account和amount两项内容
          if (!a.account || !a.amount) {
            message.error(`表格第 ${item.__rowNum__ + 1} 行数据中"account"和"amount"都不能为空！`)
            this.setState({excelLoading: false})
            this.refs.excelRef.value = '' // 设置选中文件为空
            return;
          }
          trimResult.push(a)   
        }
        if (uploadType === 1 || uploadType >= 3) {
          let params = {
            addLockBalanceReq: trimResult,
            isAllowRepeat: (uploadType === 3 || uploadType === 5) ? false : true,
            title: typeArr.filter(v => +v.id === +uploadType)[0].name,
            isValidUser: (uploadType === 4 || uploadType === 5) ? true : false,
          }
          multipleAddUsd(params).then(data => {
            this.setState({excelLoading: false})
            message.success('请求成功，请在“个人中心-文件下载”页面查看结果！')
          }).catch(() => {
            this.setState({excelLoading: false})
          })
        } else {
          let params = {
            deductionLockBalanceReq: trimResult,
            title: '批量扣除USD'
          }
          multipleDelUsd(params).then(data => {
            this.setState({excelLoading: false})
            message.success('请求成功，请在“个人中心-文件下载”页面查看结果！')
          }).catch(() => {
            this.setState({excelLoading: false})
          })
        }
      };      
      reader.readAsBinaryString(f);
    }
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
    const {tableList, meta, tableLoading, currentPage, excelLoading, totalItems, totalVisible, totalLoading} = this.state
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
      <div className="handleUSD">
        <div className="pageTitle">充值冻结USD</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} />
        <div className="clearfix">
          <Button icon="unordered-list" className="vat" onClick={() => this.totalModal(1)} loading={tableLoading}>合计</Button>
          {
            !!authList.filter(v => +v === 2009).length &&
            <div className="multipleAddUsd">
              <input type="file" style={{display: 'none'}} onChange={this.uploadExcel} ref="excelRef" />
              {
                typeArr.map((v, i) => (
                  <div className="dib" key={i} style={{marginLeft: i > 0 ? '20px' : '0px'}}>
                    <Button 
                      loading={excelLoading}
                      shape="round"
                      icon="upload"
                      type={v.id === 2 ? 'danger' : 'default'}
                      onClick={() => this.toFile(v.id)}
                    >
                      {v.name}
                    </Button>
                    <div className="tip" style={{left: i < 3 ? 0 : 'auto'}}>
                      <p>请上传.xls或者.xlsx格式的excel文件，并确保数据是存在Sheet1中，且至少包含account（用户账号：手机号或邮箱）和amount（充值或扣除数量）这两项数据，如下表：</p>
                      <img alt="" src={require('../../assets/img/excel.png')} width="100%" />
                    </div>                
                  </div>                  
                ))
              }          
            </div>              
          }
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