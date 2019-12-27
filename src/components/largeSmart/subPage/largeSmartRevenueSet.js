import React, { Component } from 'react'
import { lsContractList, lsContractStatusEdit, lsAddContract, lsTimeAndRateList } from '@/axios'
import { Table, Form, Input, Button, Select, message, Modal, Switch } from 'antd'
import MyContext from '@/tool/context'

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
          this.props.getList(params)
        })      
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form;
      const { loading, timeList, revenueList } = this.props
      return (
        <Form className="searchForm" layout="inline">
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
            {getFieldDecorator('isValid', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="0">已关闭</Option>
                <Option value="1">已激活</Option>
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

// 添加收益类型弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='添加LARGE智能宝收益类型'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 7}} wrapperCol={{span: 15}} onSubmit={this.handleSubmit} >
            <Form.Item label="存入时间">
              {getFieldDecorator('days', {
                rules: [
                  {required: true, message: '请输入存入时间'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="合约时间"  addonAfter="天" />
              )}
            </Form.Item>
            <Form.Item label="收益率">
              {getFieldDecorator('rate', {
                rules: [
                  {required: true, message: '请输入收益率'},
                  {pattern: /^[0-9]*(\.[0-9]{0,3})?$/, message: '请输入数字，支持3位小数'}
                ]
              })(
                <Input placeholder="收益率（百分比）" addonAfter="%" />
              )}
            </Form.Item>
          <Form.Item label="单笔最小存入限额">
            {getFieldDecorator('minAmount', {
              rules: [
                {required: true, message: '请输入单笔最小存入限额'},
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="单笔最小存入限额" addonAfter="USDT" />
            )}
          </Form.Item>
          <Form.Item label="单笔最大存入限额">
            {getFieldDecorator('maxAmount', {
              rules: [
                {required: true, message: '请输入单笔最大存入限额'},
                {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
              ]
            })(
              <Input placeholder="单笔最大存入限额" addonAfter="USDT" />
            )}
          </Form.Item>
            <Form.Item label="用户端显示文案">
              {getFieldDecorator('descriptions', {
                rules: [
                  {required: true, message: '请输入文案'},
                  {max: 50, message: '最多输入50字'}
                ]
              })(
                <TextArea rows={4}  placeholder="50字以内" />
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
    addVisible: false, // 是否显示添加弹框
    addLoading: false, // 添加弹框确定loading
    revenueList: [], // 收益率下拉列表
    timeList: [], // 合约时长下拉列表
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['days', 'rate', 'isValid'] // 下拉选择的参数
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
    lsContractList(params).then(data => {
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
    let list = [
      {
        title: '编号',
        dataIndex: 'id',
        render: (text) => (text || '-')
      }, {
        title: '合约时间（天）',
        dataIndex: 'days',
        render: (text) => (text || '-')
      }, {
        title: '收益率',
        dataIndex: 'rate',
        render: (text) => (text ? `${text}%` : '-')
      }, {
        title: '单笔最小存入限额（USDT）',
        dataIndex: 'minAmount',
        render: (text) => (text || '-')
      }, {
        title: '单笔最大存入限额（USDT）',
        dataIndex: 'maxAmount',
        render: (text) => (text || '-')
      }, {
        title: '用户端文案',
        dataIndex: 'descriptions',
        render: (text) => {
          if (!text || !text.length) {
            return '-'
          } else if (text.length > 30) {
            return <span title={text}>{text.slice(0, 30) + '...'}</span>
          } else {
            return text
          }
        }
      },
      {
        title: '状态',
        width: 110,
        render: item => {
          return <Switch 
                  checkedChildren="激活"
                  unCheckedChildren="关闭"
                  onClick={() => this.changeStatus(item)}
                  checked={item.isValid} />
        }
      }
    ]
    return list
  }

  // 添加合约确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (+values.minAmount >= +values.maxAmount) {
        message.warning('单笔最大存入限额要大于单笔最小存入限额！')
        return
      }
      let params = {...values}
      this.setState({addLoading: true})
      lsAddContract(params).then(() => {
        this.getList(1)
        this.getSelectList()
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

  // 收益类型状态开关
  changeStatus = (item) => {
    const {authList} = this.context
    if (!authList.filter(v => +v === 9012).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    let txt = item.isValid ? '关闭' : '激活'
    confirm({
      title: `确定${txt}编号为${item.id}的收益类型吗？`,
      width: 480,
      onOk:() => {
        return new Promise((resolve, reject) => {
          lsContractStatusEdit({id: item.id, isValid: !item.isValid}).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach(v => {
              if (v.id === item.id) {
                v.isValid = !item.isValid
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`已${txt}！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })    
  }

  // 获取下拉的合约时长和收益率列表数据
  getSelectList = () => {
    lsTimeAndRateList().then(({data}) => {
      let daysList = [...new Set(data.daysList || [])]
      let rateList = [...new Set(data.rateList || [])]
      rateList = rateList.sort((a, b) => a - b)
      let timeList = daysList.map(v => ({id: v, name: v + '天'}))
      let revenueList = rateList.map(v => ({id: v, name: v + '%'}))
      this.setState({revenueList, timeList})
    })
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
    this.getSelectList()
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
      timeList,
      revenueList
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

    return (
      <div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} timeList={timeList} revenueList={revenueList}/>
        {
          !!authList.filter(v => +v === 9011).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          </div>          
        }
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加收益类型弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

      </div>
    );
  }
}