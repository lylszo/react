import React, { Component } from 'react'
import { balanceList } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, message, Modal, Row, Col, Radio } from 'antd'
import { f_auditStatus, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

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
      const { getFieldDecorator } = this.props.form
      const { loading } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('userId', {
              initialValue: '',
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="工单编号">
            {getFieldDecorator('idNum', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input placeholder="请输入工单编号" />
            )}
          </Form.Item>
          <Form.Item label="证件号码">
            {getFieldDecorator('cardId', {
              initialValue: '',
              rules: [{ pattern: /^[\da-zA-Z]*$/, message: '请输入正确的证件号码' }]
            })(
              <Input placeholder="请输入证件号码" />
            )}
          </Form.Item>
          <Form.Item label="提交申请时间">
            {getFieldDecorator('time')(
              <RangePicker />
            )}
          </Form.Item>
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_auditStatus).map(item => {
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

// 查看或审核弹框
const AuditModal = Form.create({ name: 'auditModal' })(
  class extends Component {

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, defaultValue, changeValue} = this.props
      const title = item.modalType === 1 ? '实名认证-未审核' : '实名认证-已审核'
      let imgBoxStyle = {
        width: '120px',
        height: '70px',
        borderRadius: '2px',
        border: '1px solid #e8e8e8'
      }
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          width={600}
          footer={item.modalType === 1 ? undefined : null}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 4}} wrapperCol={{span: 18}} onSubmit={this.handleSubmit} >
            <Row className="mb15">
              <Col span={4} className="tar babelColor"><div>用户ID：</div></Col>
              <Col span={7}>{f_encodeId(item.userId)}</Col>
              <Col span={4} className="tar babelColor"><div>提交时间：</div></Col>
              <Col span={7}>{item.item1 ? moment(item.item1).format('YYYY-MM-DD HH:mm:ss') : '-'}</Col>
            </Row>
            <Row className="mb15">
              <Col span={4} className="tar babelColor"><div>姓名：</div></Col>
              <Col span={7}>{item.item5 || '-'}</Col>
              <Col span={4} className="tar babelColor"><div>工单编号：</div></Col>
              <Col span={7}>{item.item2 || '-'}</Col>
            </Row>
            <Row className="mb15">
              <Col span={4} className="tar babelColor"><div>证件类型：</div></Col>
              <Col span={7}>{item.item9 || '-'}</Col>
              <Col span={4} className="tar babelColor"><div>地区：</div></Col>
              <Col span={7}>{item.item4 || '-'}</Col>
            </Row>
            <Row className="mb15">
              <Col span={4} className="tar babelColor"><div>证件号码：</div></Col>
              <Col span={20}>{item.item10 || '-'}</Col>
            </Row>
            <Row className="mb15">
              <Col span={4} className="tar babelColor"><div>上传证件照：</div></Col>
              <Col span={20}>
                <div className="clearfix">
                  <div className="fl">
                    <a href="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" target="_blank" rel="noopener noreferrer">
                      <div style={imgBoxStyle}>
                        <img width="100%" height="100%" style={{borderRadius: '2px'}} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="加载失败"/>
                      </div>
                    </a>
                    <div className="tac fs12">（正面）</div>
                  </div>
                  <div className="fl ml20">
                    <a href="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" target="_blank" rel="noopener noreferrer">
                      <div style={imgBoxStyle}>
                        <img width="100%" height="100%" style={{borderRadius: '2px'}} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="加载失败"/>
                      </div>
                    </a>
                    <div className="tac fs12">（背面）</div>
                  </div>
                  <div className="fl ml20">
                    <a href="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" target="_blank" rel="noopener noreferrer">
                      <div style={imgBoxStyle}>
                        <img width="100%" height="100%" style={{borderRadius: '2px'}} src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" alt="加载失败"/>
                      </div>
                    </a>
                    <div className="tac fs12">（手持证件）</div>
                  </div>
                </div>
              </Col>
            </Row>
            {
              item.modalType === 2 && 
              <div>
                <Row className="mb15">
                  <Col span={4} className="tar babelColor"><div>审核结果：</div></Col>
                  <Col span={20}>不通过</Col>
                </Row>
                <Row className="mb15">
                  <Col span={4} className="tar babelColor"><div>失败原因：</div></Col>
                  <Col span={20}>证件照不符合要求</Col>
                </Row>                
              </div>
            }
            {
              item.modalType === 1 &&
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
                        { required: true, message: '请选择失败原因' }
                      ]
                    })(
                      <Select placeholder="请选择">
                        <Option value="1">证件照不符合要求</Option>
                        <Option value="2">黑名单</Option>
                      </Select>
                    )}
                  </Form.Item>                
                }
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
      toAuditAmount: 0, // 待审核人数
      currentParams: {}, // 当前查询参数
      auditVisible: false, // 是否显示审核弹框
      auditLoading: false, // 审核弹框确定loading
      currentItem: {}, // 当前处理的表单项
      defaultValue: '1', // 审核弹框默认通过
    }
  }

  // 获取智能宝释放列表
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
      let selectKeys = ['status'] // 下拉选择的参数
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
    balanceList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false
      })
      this.setState({
        tableList: [{
          item1: '2019-06-19T07:52:54Z',
          item2: '0121202514552343',
          userId: '65433',
          item4: '中国',
          item5: '李大厨',
          item6: 'admin',
          status: '1',
          item8: '',
          item9: '身份证',
          item10: '45645645674365463'
        },{
          item1: '2019-06-19T09:06:34Z',
          item2: '13215649415648',
          userId: '31245',
          item4: '马来西亚',
          item5: '石破天',
          item6: 'admin3',
          status: '2',
          item8: '',
          item9: '身份证',
          item10: '234234634265426232'
        },{
          item1: '2019-06-19T10:07:34Z',
          item2: '234564564899787985',
          userId: '31245',
          item4: '泰国',
          item5: '东方不败',
          item6: 'admin',
          status: '3',
          item8: '照片不符合要求',
          item9: '护照',
          item10: 'PE76856786785678756'
        }]
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 查看或审核按钮，打开弹框
  audit = (item, modalType) => {
    // modalType 1：审核 2：查看，集成到当前编辑对象里
    this.setState({currentItem: {...item, modalType}}, () => {
      this.setState({auditVisible: true})
    })
  }

  // 改变审核弹框默认通过/不通过
  changeValue = (defaultValue) => {
    this.setState({defaultValue})
  }

  // 关闭查看或审核弹框
  onCancelAudit = () => {
    this.setState({auditVisible: false})
    this.changeValue('1')
    this.refs.auditModal.resetFields()
  }
  
  // 查看或审核弹框手机确定
  onOkAudit = () => {
    this.refs.auditModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {}
      this.setState({auditLoading: true})
      balanceList(params).then(() => {
        message.success('审核成功！')
        this.onCancelAudit()
        this.setState({auditLoading: false})
      }).catch(() => {
        this.setState({auditLoading: false})
      })
    })
  }

  // 整理列表项
  getColumns() {
    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 2020).length // 审核权限

    return [
      {
        title: '提交申请时间',
        dataIndex: 'item1',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '工单编号',
        dataIndex: 'item2',
        render: (text) => (text || '-')
      }, {
        title: '用户ID',
        dataIndex: 'userId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '地区',
        dataIndex: 'item4',
        render: (text) => (text || '-')
      }, {
        title: '姓名',
        dataIndex: 'item5',
        render: (text) => (text || '-')
      }, {
        title: '审核人员',
        dataIndex: 'item6',
        render: (text) => (text || '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_auditStatus[text] || '-')
      }, {
        title: '失败类型',
        dataIndex: 'item8',
        render: (text) => (text || '-')
      }, {
        title: '操作',
        width: 90,
        render: item => {
          return (
            +item.status === 1 ?
            (auth1 ? <Button size="small" onClick={() => this.audit(item, 1)}>审核</Button> : '-')
            :
            <Button size="small" onClick={() => this.audit(item, 2)}>查看</Button>
          )
        }
      }
    ]
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
      toAuditAmount,
      auditVisible,
      auditLoading,
      currentItem,
      defaultValue,
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
        <div className="pageTitle">用户实名审核</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} />
        <div className="clearfix mb5">
          <div className="fr">待审核人数：{toAuditAmount}</div>
        </div>
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
        
        {/* 重置手机弹框 */}
        <AuditModal
          defaultValue={defaultValue}
          changeValue={this.changeValue}
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