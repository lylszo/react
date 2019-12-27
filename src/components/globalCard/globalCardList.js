import React, { Component } from 'react'
import { gcExpress, gcApplyList, gcEditApply } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal, Row, Col, Timeline, Spin } from 'antd'
import { f_globalCardStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import courierCompanyList from '@/assets/js/courierCompany'
import MyContext from '@/tool/context'
import moment from 'moment'
import './globalCard.scss'

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
            params.beginTime = moment(params.time[0].format('YYYY-MM-DD') + ' 00:00:00').utc().format()
            params.endTime = moment(params.time[1].format('YYYY-MM-DD') + ' 23:59:59').utc().format()
          }
          delete params.time
          this.props.getList(params)
        })      
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { loading } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('accountId', {
              initialValue: '',
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="卡绑定手机号">
            {getFieldDecorator('cardPhoneNumber', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号码" />
            )}
          </Form.Item>
          <Form.Item label="卡绑定邮箱">
            {getFieldDecorator('emailAddress')(
              <Input allowClear placeholder="请输入邮箱" />
            )}
          </Form.Item>
          <Form.Item label="全球卡号">
            {getFieldDecorator('cardNo', {
              initialValue: '',
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input placeholder="请输入全球卡号" />
            )}
          </Form.Item>
          <Form.Item label="客户编号">
            {getFieldDecorator('custNo', {
              initialValue: '',
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input placeholder="请输入客户编号" />
            )}
          </Form.Item>
          <Form.Item label="申请时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="姓名">
            {getFieldDecorator('name')(
              <Input allowClear placeholder="请输入姓名" />
            )}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('applyStatus', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_globalCardStatus).map(item => {
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

// 查看或发货弹框
const HandleModal = Form.create({ name: 'handleModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, logisticsList, logisticsLoading} = this.props
      const title = +item.applyStatus === 2 ? '发货' : '查看物流记录'
      return (
        <Modal
          className="globalCardList"
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          width={600}
          footer={+item.applyStatus === 2 ? undefined : null}
          maskClosable={false}
          onCancel={onCancel}>
          <Row className="mb15">
            <Col span={5} className="tar babelColor"><div>姓名：</div></Col>
            <Col span={16}>{item.name || '-'}</Col>
          </Row>
          <Row className="mb15">
            <Col span={5} className="tar babelColor"><div>详细地址：</div></Col>
            <Col span={16}>{item.addr || '-'}</Col>
          </Row>
          <Row className="mb15">
            <Col span={5} className="tar babelColor"><div>手机号码：</div></Col>
            <Col span={16}>{item.phoneNumber || '-'}</Col>
          </Row>
          {
            +item.applyStatus === 4 &&
            <div>
              <Row className="mb15">
                <Col span={5} className="tar babelColor"><div>全球卡号：</div></Col>
                <Col span={16}>{item.cardNo || '-'}</Col>
              </Row>
              <Row className="mb15">
                <Col span={5} className="tar babelColor"><div>快递公司：</div></Col>
                <Col span={16}>{item.postAgent || '-'}</Col>
              </Row>
              <Row className="mb15">
                <Col span={5} className="tar babelColor"><div>快递单号：</div></Col>
                <Col span={16}>{item.postNo || '-'}</Col>
              </Row>                
            </div>
          }
          {
            +item.applyStatus === 4 &&
            <div className="logistics">
              {
                logisticsLoading ?
                <Spin />
                :
                <div>
                  {
                    logisticsList && logisticsList.length ? 
                    <Timeline>
                      {
                        logisticsList.map((v, i) => 
                          <Timeline.Item key={i}>
                            <div className="mb5">{v.ftime}</div>
                            <div className="mb5">{v.context}</div>
                          </Timeline.Item>
                        )
                      }
                    </Timeline>
                    :
                    <div className="noneTip">暂无物流信息</div>
                  }
                </div>
              }
            </div>
          }
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            {
              +item.applyStatus === 2 && 
              <div>
                <Form.Item label="全球卡号">
                  {getFieldDecorator('cardNo', {
                    rules: [
                      { required: true, message: '请输入全球卡号' },
                      { pattern: /^\d*$/, message: '请输入数字' },
                    ]
                  })(
                    <Input allowClear placeholder="请输入全球卡号" />
                  )}
                </Form.Item>
                <Form.Item label="快递公司">
                  {getFieldDecorator('postAgent', {
                    rules: [{ required: true, message: '请选择快递公司' }]
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      placeholder="请选择快递公司"
                      filterOption={(input, option) => 
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }>
                      {
                        courierCompanyList.map(item => {
                          return <Option value={item.id + ',' + item.name} key={item.id}>{item.name}</Option>
                        })
                      }
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label="快递单号">
                  {getFieldDecorator('postNo', {
                    rules: [
                      { required: true, message: '请输入快递单号' }
                    ]
                  })(
                    <Input allowClear placeholder="请输入快递单号" />
                  )}
                </Form.Item>
              </div>
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
      tableLoading: false, // 列表请求loading
      currentParams: {}, // 当前查询参数
      handleVisible: false, // 是否显示发货弹框
      handleLoading: false, // 发货弹框确定loading
      currentItem: {}, // 当前处理的表单项
      logisticsList: [], // 物流信息
      logisticsLoading: false, // 获取物流信息loading
    }
  }

  // 获取智能宝释放列表
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
      let selectKeys = ['applyStatus'] // 下拉选择的参数
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
    gcApplyList(params).then(data => {
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

  // 查看或发货按钮，打开弹框
  handle = (item) => {
    if (+item.applyStatus === 4 && item.postAgentCode) {
      let params = { postNo: item.postNo, postAgentCode: item.postAgentCode }
      this.setState({logisticsLoading: true})
      gcExpress(params).then(data => {
        this.setState({logisticsLoading: false, logisticsList: data.data.dataList})
      }).catch(() => {
        this.setState({logisticsLoading: false})
      })
    }
    if (+item.applyStatus === 2 || +item.applyStatus === 4) {
      this.setState({currentItem: {...item}}, () => {
        this.setState({handleVisible: true})
      })
    } else {
      if (!item.cardNo) {
        message.warning("无效卡号")
        return
      }
      this.props.history.push({
        pathname: '/globalCardDetail',
        state: {item}
      })
    }
  }

  // 关闭查看或发货弹框
  onCancelHandle = () => {
    this.setState({handleVisible: false})
    this.refs.handleModal.resetFields()
  }
  
  // 查看或发货弹框手机确定
  onOkHandle = () => {
    const {currentItem, tableList} = this.state
    if (+currentItem.applyStatus === 2) {
      this.refs.handleModal.validateFields((err, values) => {
        if (err) {
          return
        }
        let company = values.postAgent.split(',')
        let params = {
          id: currentItem.id,
          ...values,
          postAgent: company[1],
          postAgentNo: company[0]
        }
        this.setState({handleLoading: true})
        gcEditApply(params).then(() => {
          let tableList2 = [...tableList]
          tableList2.forEach(v => {
            if (+v.accountId === +currentItem.accountId) {
              v.postAgent = params.post_agent
              v.postAgentCode = params.post_agent_code
              v.postNo = params.post_no
              v.cardNo = params.card_no
              v.applyStatus = 4
            }
          })
          this.setState({handleLoading: false, tableList: tableList2})
          message.success('发货成功！')
          this.onCancelHandle()
        }).catch(() => {
          this.setState({handleLoading: false})
        })
      })      
    }
    if (+currentItem.applyStatus === 4) {
      this.setState({handleVisible: false})
    }
  }

  // 整理列表项
  getColumns() {
    const {authList} = this.context

    let columns =  [
      {
        title: '用户ID',
        dataIndex: 'accountId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '姓名',
        dataIndex: 'name',
        render: (text) => (text || '-')
      }, {
        title: '卡绑定手机号',
        dataIndex: 'cardPhoneNumber',
        render: (text) => (text || '-')
      }, {
        title: '卡绑定邮箱',
        dataIndex: 'email',
        render: (text) => (text || '-')
      }, {
        title: '申请时间',
        dataIndex: 'applyTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '全球卡号',
        dataIndex: 'cardNo',
        render: (text) => (text || '-')
      }, {
        title: '客户编号',
        dataIndex: 'custNo',
        render: (text) => (text || '-')
      }, {
        title: '状态',
        dataIndex: 'applyStatus',
        render: (text) => (f_globalCardStatus[text] || '-')
      }
    ]

    let auth1 = !!authList.filter(v => +v === 1305).length // 查看详情、消费记录、物流信息权限
    let auth2 = !!authList.filter(v => +v === 1307).length // 发货权限
    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        width: 90,
        render: item => {
          if (+item.applyStatus === 2) {
            return (
              <div>
                { auth2 ? <Button size="small" onClick={() => this.handle(item)}>发货</Button> : '-'}
              </div>
            )
          } else if (+item.applyStatus) {
            return (
               <div>
                { auth1 ? <Button size="small" onClick={() => this.handle(item)}>查看</Button> : '-'}
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
      handleVisible,
      handleLoading,
      currentItem,
      logisticsList,
      logisticsLoading,
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
      <div className="globalCardList">
        <div className="pageTitle">YouBank全球付卡</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} />
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
        
        {/* 查看/发货 弹框 */}
        <HandleModal
          ref="handleModal"
          onOk={this.onOkHandle}
          onCancel={this.onCancelHandle}
          visible={handleVisible}
          logisticsList={logisticsList}
          logisticsLoading={logisticsLoading}
          confirmLoading={handleLoading}
          item={currentItem} />

      </div>
    );
  }
}