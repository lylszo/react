import React, { Component } from 'react'
import { getYouContractList, addYouContract, setYouContractStatus, getValidCoinList } from '@/axios'
import { Table, Button, message, Modal, Form, Input, Switch, Select } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm
const Option = Select.Option

// 添加合约弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, lendCoinList } = this.props
      return (
        <Modal
          title='添加贷款合约'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 8}} wrapperCol={{span: 14}} onSubmit={this.handleSubmit} >
            <Form.Item label="借贷币种">
              {getFieldDecorator('lendCoinId', {
                initialValue: lendCoinList && lendCoinList[0] ? lendCoinList[0].id : 0,
                rules: [
                  {required: true, message: '请选择借贷币种'},
                ]
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {
                    lendCoinList.map(item => {
                      return <Option value={item.id} key={item.id}>{item.coinName}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="贷款最小天数">
              {getFieldDecorator('minDays', {
                rules: [
                  {required: true, message: '贷款最小天数'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="贷款最小天数" addonAfter="天"/>
              )}
            </Form.Item>
            <Form.Item label="贷款周期">
              {getFieldDecorator('period', {
                rules: [
                  {required: true, message: '贷款周期'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="贷款周期" addonAfter="天"/>
              )}
            </Form.Item>
            <Form.Item label="平仓指数">
              {getFieldDecorator('forceRatio', {
                rules: [
                  {required: true, message: '请输入平仓指数'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="平仓指数"  addonAfter="%"/>
              )}
            </Form.Item>
            <Form.Item label="告警指数">
              {getFieldDecorator('warningRatio', {
                rules: [
                  {required: true, message: '请输入告警指数'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="告警指数"  addonAfter="%"/>
              )}
            </Form.Item>
            <Form.Item label="借贷比例">
              {getFieldDecorator('lendRatio', {
                rules: [
                  {required: true, message: '请输入借贷比例'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="借贷比例"  addonAfter="%"/>
              )}
            </Form.Item>
            <Form.Item label="利息比率">
              {getFieldDecorator('interestRatio', {
                rules: [
                  {required: true, message: '请输入利息比率'},
                  {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                ]
              })(
                <Input placeholder="利息比率"  addonAfter="%"/>
              )}
            </Form.Item>
            <Form.Item label="单用户最大签约数">
              {getFieldDecorator('maxOrders', {
                rules: [
                  {required: true, message: '单用户最大签约数'},
                  { pattern: /^\d*$/, message: '请输入数字' }
                ]
              })(
                <Input placeholder="单用户最大签约数" addonAfter="笔"/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

export default class extends Component {
  static contextType = MyContext

  // 状态
  state = {
    tableList: [], // 列表数据
    meta: {}, // 请求列表信息
    currentPage: 1, // 当前页码
    tableLoading: false, // 列表请求loading
    currentParams: {}, // 当前查询参数
    addVisible: false, // 是否显示添加合约弹框
    addLoading: false, // 添加合约弹框确认loading
    type: '0', // 当前显示的是哪个币种的合约列表，0表示所有
    lendCoinList: [], // 可以借款的列表
  }

  // 获取列表
  getList = (page) => {
    let currentPage = page || 1
    let params = {...this.state.currentParams, page: currentPage}
    params.lendCoinId = (this.state.type && +this.state.type) ? this.state.type : undefined
    this.setState({tableLoading: true, currentPage: currentPage})
    getYouContractList(params).then(data => {
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
    let columns = [
      {
        title: '编号',
        dataIndex: 'id',
        render: (text) => (text || '-')
      },{
        title: '借贷币种',
        dataIndex: 'lendCoinName',
        render: (text) => (text || '-')
      },{
        title: '平仓指数',
        dataIndex: 'forceRatio',
        render: (text) => ((text || text === 0) ? `${text}%` : '-')
      },{
        title: '告警指数',
        dataIndex: 'warningRatio',
        render: (text) => ((text || text === 0) ? `${text}%` : '-')
      },{
        title: '借贷比例',
        dataIndex: 'lendRatio',
        render: (text) => ((text || text === 0) ? `${text}%` : '-')
      },{
        title: '利息比率',
        dataIndex: 'interestRatio',
        render: (text) => ((text || text === 0) ? `${text*10000000000/100000000}%` : '-')
      },{
        title: '单用户最大签约数',
        dataIndex: 'maxOrders',
        render: (text) => (text || '-')
      },{
        title: '贷款最小天数',
        dataIndex: 'minDays',
        render: (text) => (text || '-')
      },{
        title: '贷款周期（天）',
        dataIndex: 'period',
        render: (text) => (text || '-')
      },{
        title: '创建人',
        dataIndex: 'creator',
        render: (text) => (text || '-')
      },{
        title: '状态',
        render: item => {
          const txt = +item.status === 1 ? '关闭' : '开启'
          return <Switch 
              checkedChildren="开"
              unCheckedChildren="关"
              onClick={() => this.changeStatus(item, txt)}
              checked={+item.status === 1} />
        }
      }
    ]

    return columns
  }

  // 开启关闭
  changeStatus = (item, txt) => {
    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1107).length // 开启/关闭 权限
    if (!auth1) {
      return
    }
    const {tableList} = this.state
    confirm({
      title: `确定${txt}ID为${item.id}的合约吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          let status = +item.status === 1 ? '0' : '1'
          setYouContractStatus({id: item.id, status: +status ? true : false}).then(() => {
            let tableList2 = [...tableList]
            tableList2.forEach(v => {
              if (v.id === item.id) {
                v.status = status
              }
            })
            this.setState({tableList: tableList2})
            message.success(`已${txt}！`)
            resolve()
          }).catch(() => {
            reject()
          })       
        })
      }
    })    
  }

  // 添加合约确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.minDays > +values.period) {
        message.warning('贷款周期需大于贷款最小天数')
        return
      }
      if (+values.warningRatio > +values.forceRatio) {
        message.warning('平仓指数需大于告警指数')
        return
      }
      if (+values.warningRatio < +values.lendRatio) {
        message.warning('告警指数需大于等于借贷比例')
        return
      }
      let params = {...values}
      params.interestRatio = params.interestRatio*100000000/10000000000
      this.setState({addLoading: true})
      addYouContract(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加合约取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
  }

  // 改变当前显示合约的币种类型
  handleTypeChange = (type) => {
    this.setState({type}, () => {
      this.getList(1)
    })
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    getValidCoinList().then(data => {
      this.setState({lendCoinList: data.data.items || []})
    })
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      addVisible,
      addLoading,
      lendCoinList,
      type,
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
    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1106).length

    return (
      <div>
        {
          <div className="clearfix mt10">
            <Select
              showSearch
              defaultValue={type}
              onChange={this.handleTypeChange}
              style={{width: '200px'}}
              optionFilterProp="children"
              filterOption={(input, option) => 
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }>
              <Option value="0">全部合约设置</Option>
              {
                lendCoinList.map(item => {
                  return <Option value={item.id} key={item.id}>{`${item.coinName}合约设置`}</Option>
                })
              }
            </Select>
            { 
              auth1 &&
              <div className="fr mb5">
                <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
              </div>
            }
          </div>          
        }
        <Table
          scroll={{x:1200}}
          style={{marginTop: auth1 ? 0 : '15px'}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />          

        {/* 添加合约弹框 */}
        <AddModal
          ref="addModal"
          lendCoinList={lendCoinList}
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />
      </div>
    );
  }
}