import React, { Component } from 'react'
import { getWithdrawList, getAllCoinList, withdrawAudit, withdrawPatch, getWithdrawDetail, dlWithdraw } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal } from 'antd'
import { f_withdrawStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
const Option = Select.Option
const confirm = Modal.confirm
const { TextArea } = Input

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
            params.submittedStartAt = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.submittedEndAt = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
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
          <Form.Item label="目标地址">
            {getFieldDecorator('toAddress')(
              <Input allowClear placeholder="请输入目标地址" />
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
                  ObjToArr(f_withdrawStatus).map(item => {
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

// 驳回提币弹框
const RefuseModal = Form.create({ name: 'refuseModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = `驳回提币（用户ID：${f_encodeId(item.accountId)}）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="驳回理由">
              {getFieldDecorator('reason', {
                rules: [
                  { required: true, message: '请输入驳回提币理由' },
                  { max: 64, message: '提币理由不能超过64个字' }
                ]
              })(
                <TextArea rows="4" placeholder="64字以内" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 补单弹框
const PatchModal = Form.create({ name: 'patchModal' })(
    class extends Component {
    state = {
      type: 'AUTO'
    }
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const { type } = this.state
      const title = `申请补单（用户ID：${f_encodeId(item.accountId)}）`
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="补单类型">
              {getFieldDecorator('patchType', {
                initialValue: 'AUTO',
                getValueFromEvent: val => {
                  this.setState({type: val})
                  return val
                }
              })(
                <Select>
                  <Option value='AUTO' key='AUTO'>自动</Option>
                  <Option value='MANUAL' key='MANUAL'>手动</Option>
                </Select>
              )}
            </Form.Item>
            {
              type === 'MANUAL' &&
              <Form.Item label="交易哈希">
                {getFieldDecorator('txid', {
                  rules: [{required: true, message: '请填写交易哈希'}]
                })(
                  <Input placeholder="请输入交易哈希" />
                )}
              </Form.Item>
            }
          </Form>
        </Modal>
      )
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
      currentItem: {}, // 当前处理对象
      refuseVisible: false, // 是否显示驳回提币弹框
      refuseLoading: false, // 驳回提币确认loading
      patchVisible: false, // 是否显示补单弹框
      patchLoading: false, // 补单确认loading
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
    getWithdrawList(params).then(data => {
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

  // 打开驳回提币弹框
  refuse = (item) => {
    this.setState({refuseVisible: true, currentItem: item})
  }

  // 驳回提币确定
  onOkRefuse = () => {
    const { currentItem } = this.state
    this.refs.refuseModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        result: false,
        ...values
      }
      this.setState({refuseLoading: true})
      withdrawAudit(currentItem.id, params).then(() => {
        getWithdrawDetail(currentItem.id).then(data => {
          let list = [...this.state.tableList]
          list.forEach(v => {
            if (v.id === currentItem.id) {
              v.status = data.data.status
            }
          })
          this.setState({tableList: list})
        })
        this.setState({refuseLoading: false})
        this.onCancelRefuse()
        message.success('已驳回！')
      }).catch(() => {
        this.setState({refuseLoading: false})
      })
    })
  }

  // 驳回提币取消
  onCancelRefuse = () => {
    this.setState({refuseVisible: false})
    this.refs.refuseModal.resetFields()
  }

  // 打开补单弹框
  patch = (item) => {
    this.setState({patchVisible: true, currentItem: item})
  }

  // 补单确定
  onOkPatch = () => {
    const { currentItem } = this.state
    this.refs.patchModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({patchLoading: true})
      withdrawPatch(currentItem.id, params).then(() => {
        getWithdrawDetail(currentItem.id).then(data => {
          let list = [...this.state.tableList]
          list.forEach(v => {
            if (v.id === currentItem.id) {
              v.status = data.data.status
            }
          })
          this.setState({tableList: list})
        })
        this.setState({patchLoading: false})
        this.onCancelPatch()
        message.success('补单成功！')
      }).catch(() => {
        getWithdrawDetail(currentItem.id).then(data => {
          let list = [...this.state.tableList]
          list.forEach(v => {
            if (v.id === currentItem.id) {
              v.status = data.data.status
            }
          })
          this.setState({tableList: list})
        })
        this.setState({patchLoading: false})
      })
    })
  }

  // 补单取消
  onCancelPatch = () => {
    this.setState({patchVisible: false})
    this.refs.refuseModal.resetFields()
  }

  // 通过
  agree = (item) => {
    confirm({
      title: `审核通过（用户ID：${f_encodeId(item.accountId)}）`,
      content: (
        <div className="mt20">
          一旦通过后系统将把
          <span className="red">{item.amount} {item.shortName}</span>
          提币到以下钱包地址：<br />
          <span className="red">{item.address}</span><br />
          点击确定后将自动提币          
        </div>
      ),
      onOk:() => {
        return new Promise((resolve, reject) => {
          withdrawAudit(item.id, {result: true}).then(() => {
            getWithdrawDetail(item.id).then(data => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.status = data.data.status
                }
              })
              this.setState({tableList: list})
            })
            message.success('已通过！')
            resolve()
          }).catch(() => {
            getWithdrawDetail(item.id).then(data => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.status = data.data.status
                }
              })
              this.setState({tableList: list})
            })
            reject()
          })
        })
      }
    })
  }

  // 释放明细
  toReconciliation = (item) => {
    this.props.history.push({
      pathname: '/reconciliation',
      state: {
        userId: item.accountId
      }
    })
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '提币工单号',
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
        title: '手续费',
        dataIndex: 'feeYbt',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'submittedAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '完成时间',
        dataIndex: 'completedAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_withdrawStatus[text] || '-')
      }, {
        title: '审核人',
        dataIndex: 'staff',
        render: (text) => (text || '-')
      }
    ]
    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 3012).length // 通过、驳回、补单的权限
    let auth2 = !!authList.filter(v => +v === 3035).length // 对账的权限
    if (auth1 || auth2) {
      let width = 180
      if (!auth1) {
        width = 90
      }
      if (!auth2) {
        width = 120
      }
      columns.push({
        title: '操作',
        key: '',
        width,
        render: item => {
          if (item.status === 'WAIT_REVIEW' || item.status === 'ERROR') {
            return (
              <div>
                { auth1 && <Button size="small" onClick={() => this.refuse(item)}>驳回</Button> }
                { auth1 && <Button size="small" onClick={() => this.agree(item)}>通过</Button> }
                { auth2 && <Button size="small" onClick={() => this.toReconciliation(item)}>对账</Button> }
              </div>
            )
          } else if (item.status === 'FAILED') {
            return (
              <div>
                { auth1 && <Button size="small" onClick={() => this.patch(item)}>补单</Button> }
                { auth2 && <Button size="small" onClick={() => this.toReconciliation(item)}>对账</Button> }
              </div>
            )
          } else {
            return '-'
          }
        }
      })
    }
    return columns
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
      currentParams2.status = f_withdrawStatus[currentParams2.status]
    }
    if (currentParams2.accountId) {
      currentParams2.accountId = f_encodeId(currentParams2.accountId)
    }
    if (currentParams2.submittedStartAt) {
      currentParams2.submittedStartAt = moment(currentParams2.submittedStartAt).format('YYYY-MM-DD HH:mm:ss')
    }
    if (currentParams2.submittedEndAt) {
      currentParams2.submittedEndAt = moment(currentParams2.submittedEndAt).format('YYYY-MM-DD HH:mm:ss')
    }
    if (currentParams2.completedStartAt) {
      currentParams2.completedStartAt = moment(currentParams2.completedStartAt).format('YYYY-MM-DD HH:mm:ss')
    }
    if (currentParams2.completedEndAt) {
      currentParams2.completedEndAt = moment(currentParams2.completedEndAt).format('YYYY-MM-DD HH:mm:ss')
    }
    const searchObj = {
      accountId: '用户ID',
      toAddress: '目标地址',
      txid: '交易哈希',
      coinId: '币种',
      status: '状态',
      submittedStartAt: '创建开始时间',
      submittedEndAt: '创建结束时间',
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
    params.title = `提币记录（${titleArr.length ? titleArr.join('，') : '所有'}）`
    this.setState({excelLoading: true})
    dlWithdraw(params).then(() => {
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
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      coinList,
      refuseVisible,
      refuseLoading,
      currentItem,
      patchVisible,
      patchLoading,
    } = this.state
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
    const {authList} = this.context

    return (
      <div>
        <div className="pageTitle">提币记录</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList}/>
        {
          !!authList.filter(v => +v === 3011).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button className="ml10" shape="round" icon="download" onClick={this.outExcel} loading={this.state.excelLoading}>导出</Button>
            </div>          
          </div>          
        }
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          expandedRowRender={record => (
            <div className="tal pl30">
              <div>确认次数：{record.confirmedTimes || '-'}</div>
              <div>地址标签：{record.addressTag || '-'}</div>
              <div>目标地址：{record.address || '-'}</div>
              <div>交易哈希：{record.txid || '-'}</div>
            </div>
          )}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 驳回提币弹框 */}
        <RefuseModal
          ref="refuseModal"
          item={currentItem}
          onOk={this.onOkRefuse}
          onCancel={this.onCancelRefuse}
          visible={refuseVisible}
          confirmLoading={refuseLoading} />

        {/* 补单弹框 */}
        <PatchModal
          ref="patchModal"
          item={currentItem}
          onOk={this.onOkPatch}
          onCancel={this.onCancelPatch}
          visible={patchVisible}
          confirmLoading={patchLoading} />
      </div>
    );
  }
}