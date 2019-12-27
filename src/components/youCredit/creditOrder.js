import React, { Component } from 'react'
import { getYouOrderList, getYouOrderDetail, auditYouPass, auditYouFail, getPledgeCoinList, getValidCoinList } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal, Row, Col, Radio, Icon } from 'antd'
import { f_youCreditOrderStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { TextArea } = Input
const { RangePicker } = DatePicker
const Option = Select.Option

// 搜索表单
const SearchForm = Form.create({ name: 'assetRecordList' })(
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
      const { getFieldDecorator } = this.props.form
      const { loading, validList, pledgeList } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('uid', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="创建时间">
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
                  ObjToArr(f_youCreditOrderStatus).map(item => {
                    return <Option value={item.id} key={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="质押币种">
            {getFieldDecorator('pledgeCoinId', {
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
                  pledgeList.map(item => {
                    return <Option value={item.id} key={item.id}>{item.coinName}</Option>
                  })
                }
              </Select>
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

// 查看或审核弹框
const AuditModal = Form.create({ name: 'auditModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, modalType, detailLoading, defaultValue, changeValue } = this.props
      const titleObj = {
        '1': 'U币贷申请',
        '2': 'U币贷订单',
        '3': '驳回原因',
      }
      const columns1 = [
        {
          title: '合约编号',
          dataIndex: 'contractId',
          render: (text) => (text || '-')
        },{
          title: '平仓指数',
          dataIndex: 'forceRatio',
          render: (text) => (text ? `${text}%` : '-')
        },{
          title: '告警指数',
          dataIndex: 'warningRatio',
          render: (text) => (text ? `${text}%` : '-')
        },{
          title: '利息比率',
          dataIndex: 'interestRatio',
          render: (text) => (text ? `${text*10000000000/100000000}%` : '-')
        },
      ]
      const columns2 = [
        {
          title: '质押币种',
          dataIndex: 'pledgeCoinName',
          render: (text) => (text || '-')
        },{
          title: '质押数量',
          dataIndex: 'pledgeTotal',
          render: (text) => (text || '-')
        },{
          title: '质押价值',
          dataIndex: 'pledgeValue',
          render: (text) => (text || '-')
        },{
          title: '借贷币种',
          dataIndex: 'lendCoinName',
          render: (text) => (text || '-')
        },{
          title: '借贷总额',
          dataIndex: 'loanAmount',
          render: (text) => (text || '-')
        },{
          title: '风险指数',
          dataIndex: 'risk',
          render: (text) => (text ? `${text}%` : '-')
        },
      ]
      const columns3 = [
        {
          title: '质押均价',
          dataIndex: 'pledgeAvaPrice',
          render: (text) => (text || '-')
        },{
          title: '平仓均价',
          dataIndex: 'forcePrice',
          render: (text) => (text || '-')
        }
      ]
      return (
        <Modal
          title={titleObj[modalType]}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          width={modalType === 3 ? 400 : 700}
          footer={modalType === 1 ? undefined : null}
          maskClosable={false}
          onCancel={onCancel}>
          {
            modalType === 3 ?
            <div>
              { detailLoading ? <Icon type="loading" /> : item.reason }
            </div>
            :
            <Form labelCol={{span: 4}} wrapperCol={{span: 18}} onSubmit={this.handleSubmit} >
              <Row className="mb15">
                <Col span={4} className="tar babelColor"><div>用户ID：</div></Col>
                <Col span={7}>{f_encodeId(item.uid)}</Col>
                <Col span={4} className="tar babelColor"><div>工单编号：</div></Col>
                <Col span={7}>{item.orderId || '-'}</Col>
              </Row>
              <Row className="mb15">
                <Col span={4} className="tar babelColor"><div>手机：</div></Col>
                <Col span={7}>{item.phone || '-'}</Col>
                <Col span={4} className="tar babelColor"><div>提交时间：</div></Col>
                <Col span={7}>{item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Col>
              </Row>
              <Row className="mb15">
                <Col span={4} className="tar babelColor"><div>邮箱：</div></Col>
                <Col span={7}>{item.email || '-'}</Col>
                <Col span={4} className="tar babelColor"><div>更新时间：</div></Col>
                <Col span={7}>{item.updatedAt ? moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Col>
              </Row>
              <Row className="mb15">
                <Col span={4} className="tar babelColor"><div>实名认证：</div></Col>
                <Col span={7}>{item.isReal ? '是' : '否'}</Col>
                <Col span={4} className="tar babelColor"><div>姓名：</div></Col>
                <Col span={7}>{item.name || '-'}</Col>
              </Row>
              <Table
                className="smallTable mb15"
                rowKey={(record, i) => i}
                dataSource={[item]}
                pagination={false}
                columns={columns1} />
              <Table
                className="smallTable mb15"
                rowKey={(record, i) => i}
                dataSource={[item]}
                pagination={false}
                columns={columns2} />
              {
                modalType === 2 &&
                <Table
                  className="smallTable"
                  rowKey={(record, i) => i}
                  dataSource={[item]}
                  pagination={false}
                  columns={columns3} />
              }
              {
                modalType === 1 &&
                <div>
                  <div className="mb20 mt20" style={{borderTop: '1px solid #e8e8e8'}}></div>
                  <Form.Item label="审核结果">
                    {getFieldDecorator('status', {
                      initialValue: '1',
                      getValueFromEvent: ({target}) => {
                        changeValue(target.value)
                        return target.value
                      },
                      rules: [
                        { required: true, message: '请选择审核结果' }
                      ]
                    })(
                      <Radio.Group>
                        <Radio value="1">通过</Radio>
                        <Radio value="0" className="ml30">不通过</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                  {
                    +defaultValue === 0 &&
                    <Form.Item label="失败原因">
                      {getFieldDecorator('reason', {
                        rules: [
                          { required: true, message: '请填写失败原因' },
                          {max: 50, message: '最多输入50字'}
                        ]
                      })(
                        <TextArea rows={4}  placeholder="50字以内" />
                      )}
                    </Form.Item>                
                  }
                </div>
              }
            </Form>
          }

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
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
      auditVisible: false, // 是否显示审核弹框
      auditLoading: false, // 审核弹框确定loading
      currentItem: {}, // 当前处理的表单项
      modalType: 1, // 弹框类型 1：审核 2：查看详情，3：查看驳回原因
      detailLoading: false, // 获取详情loading
      defaultValue: '1', // 默认审核通过
      pledgeList: [], // 可以质押的币种列表
      validList: [], // 可以借贷的币种列表
    }
  }

  // 获取智能宝释放列表
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
      let selectKeys = ['status', 'pledgeCoinId', 'lendCoinId'] // 下拉选择的参数
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
    getYouOrderList(params).then(data => {
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

  // 查看或审核按钮，打开弹框
  audit = (item, modalType) => {
    let params = {
      orderId: item.id
    }
    this.setState({detailLoading: true})
    getYouOrderDetail(params).then(data => {
      this.setState({
        detailLoading: false,
        currentItem: {contractId: item.contractId, orderId: item.id, ...data.data}
      })
    }).catch(() => {
      this.setState({detailLoading: false})
    })
    this.changeValue('1')
    this.setState({auditVisible: true, modalType})
  }

  // 关闭查看或审核弹框
  onCancelAudit = () => {
    this.setState({auditVisible: false})
    this.refs.auditModal.resetFields()
  }
  
  // 查看或审核弹框手机确定
  onOkAudit = () => {
    const {currentItem, tableList} = this.state
    this.refs.auditModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.status === 1) {
        let params = {orderId: currentItem.orderId}
        this.setState({auditLoading: true})
        auditYouPass(params).then(() => {
          let tableList2 = [...tableList]
          tableList2.forEach(v => {
            if (v.id === currentItem.orderId) {
              v.status = 2
            }
          })
          this.setState({tableList: tableList2, auditLoading: false})
          message.success('已通过！')
          this.onCancelAudit()
        }).catch(() => {
          this.setState({auditLoading: false})
        })
      } else {
        let params = {orderId: currentItem.orderId, reason: values.reason}
        this.setState({auditLoading: true})
        auditYouFail(params).then(() => {
          let tableList2 = [...tableList]
          tableList2.forEach(v => {
            if (v.id === currentItem.orderId) {
              v.status = 1
            }
          })
          message.success('已驳回！')
          this.onCancelAudit()
          this.setState({auditLoading: false})
        }).catch(() => {
          this.setState({auditLoading: false})
        })

      }
    })
  }

  // 修改审核弹框中默认值 通过/不通过
  changeValue = (defaultValue) => {
    this.setState({defaultValue})
  }

  // 整理列表项
  getColumns() {
    const {authList} = this.context

    let columns = [ {
        title: '订单编号',
        dataIndex: 'id',
        render: (text) => (text || '-')
      }, {
        title: '用户ID',
        dataIndex: 'uid',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '质押币种',
        dataIndex: 'pledgeCoinName',
        render: (text) => (text || '-')
      },{
        title: '借贷币种',
        dataIndex: 'lendCoinName',
        render: (text) => (text || '-')
      }, {
        title: '合约编号',
        dataIndex: 'contractId',
        render: (text) => (text || '-')
      }, {
        title: '质押数量',
        dataIndex: 'pledgeTotal',
        render: (text) => (text || '-')
      }, {
        title: '质押价值',
        dataIndex: 'pledgeValue',
        render: (text) => (text || '-')
      }, {
        title: '借贷总额',
        dataIndex: 'loanAmount',
        render: (text) => (text || '-')
      }, {
        title: '总利息',
        dataIndex: 'totalInterest',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '签约时间',
        dataIndex: 'startAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '订单状态',
        dataIndex: 'status',
        render: (text) => (f_youCreditOrderStatus[text] || '-')
      }
    ]

    let auth1 = !!authList.filter(v => +v === 1119).length // 审核权限
    let auth2 = !!authList.filter(v => +v === 1117).length // 查看详情权限

    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        fixed: 'right',
        width: 90,
        render: item => {
          return (
            +item.status === 0 ?
            (auth1 ? <Button size="small" onClick={() => this.audit(item, 1)}>审核</Button> : '-')
            :
            <div>
              {
                +item.status === 2 ?
                '-'
                :
                <div>
                  { auth2 && <Button size="small" onClick={() => this.audit(item, +item.status === 1 ? 3 : 2)}>查看</Button>}
                </div>
              }
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
    getPledgeCoinList().then(data => {
      this.setState({pledgeList: data.data.items || []})
    })
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
      auditVisible,
      auditLoading,
      currentItem,
      modalType,
      detailLoading,
      defaultValue,
      validList,
      pledgeList,
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
        <div className="pageTitle">U币贷订单</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} validList={validList} pledgeList={pledgeList} />
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
        
        {/* 审核弹框 */}
        <AuditModal
          changeValue={this.changeValue}
          defaultValue={defaultValue}
          detailLoading={detailLoading}
          modalType={modalType}
          ref="auditModal"
          onOk={this.onOkAudit}
          onCancel={this.onCancelAudit}
          visible={auditVisible}
          confirmLoading={auditLoading}
          item={currentItem} />

      </div>
    );
  }
}