import React, { Component } from 'react'
import { giveIssueList, editGiveIssueStatus, delGiveIssue, addGiveIssue } from '@/axios'
import { Table, Form, Input, Button, Select, DatePicker, Modal, message,Checkbox } from 'antd'
import { f_giveIssueType, f_giveNodeType, f_nodeLevel, ObjToArr, f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'
import moment from 'moment'

const { RangePicker } = DatePicker
const confirm = Modal.confirm
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
      const { loading } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="用户ID">
            {getFieldDecorator('memberId', {
              rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
            })(
              <Input allowClear placeholder="请输入用户ID" />
            )}
          </Form.Item>
          <Form.Item label="节点类型">
            {getFieldDecorator('nodeLevel', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_nodeLevel).map(v => {
                    return <Option value={v.id} key={v.id}>{v.name}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="发放类型">
            {getFieldDecorator('revenueType', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_giveIssueType).map(v => {
                    return <Option value={v.id} key={v.id}>{v.name}</Option>
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
          <Form.Item>
            <Button onClick={this.handleSubmit} type="primary" loading={loading}>查询</Button>
            <Button onClick={this.handleSubmit.bind(this, 'reset')} loading={loading}>重置</Button>
          </Form.Item>
        </Form>
      );
    }
  }
)

// 节点发放弹框
const NodeIssueModal = Form.create({ name: 'nodeIssueModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='新增节点发放'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="会员等级">
              {getFieldDecorator('gradeMask', {
                initialValue: [],
                rules: [
                  {required: true, message: '请选择会员等级'}
                ]
              })(
                <Select mode="multiple" placeholder="请选择会员等级">
                  {
                    ['1','2','3','4','5'].map(v => {
                      return <Option value={v} key={v}>V{v}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="发放类型">
              {getFieldDecorator('revenueType', {
                initialValue: '7',
                rules: [
                  {required: true, message: '请选择发放类型'}
                ]
              })(
                <Select>
                  {
                    ObjToArr(f_giveIssueType).filter(v => ['7', '8', '10'].filter(w => v.id === w).length).map(v => {
                      return <Option value={v.id} key={v.id}>{v.name}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="发放金额">
              {getFieldDecorator('quantity', {
                rules: [
                  {required: true, message: '请输入发放金额'},
                  {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                ]
              })(
                <Input placeholder="发放金额" />
              )}
            </Form.Item>
            <Form.Item label="节点类型">
              {getFieldDecorator('nodeLevel', {
                initialValue: '1',
                rules: [
                  {required: true, message: '请选择节点类型'}
                ]
              })(
                <Select>
                  {
                    ObjToArr(f_nodeLevel).filter(v => +v.id > 0).map(v => {
                      return <Option value={v.id} key={v.id}>{v.name}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 个人奖励弹框
const PersonModal = Form.create({ name: 'personModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      return (
        <Modal
          title='新增个人奖励'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="用户手机号">
              {getFieldDecorator('phone', {
                rules: [
                  {required: true, message: '请输入用户手机号'},
                  { pattern: /^[+\d]*$/, message: '请输入正确的手机号' }
                ]
              })(
                <Input placeholder="用户手机号" />
              )}
            </Form.Item>
            <Form.Item label="发放类型">
              {getFieldDecorator('revenueType', {
                initialValue: '4',
                rules: [
                  {required: true, message: '请选择发放类型'}
                ]
              })(
                <Select>
                  {
                    ObjToArr(f_giveIssueType).filter(v => ['4', '6', '9', '12'].filter(w => v.id === w).length).map(v => {
                      return <Option value={v.id} key={v.id}>{v.name}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="发放金额">
              {getFieldDecorator('quantity', {
                rules: [
                  {required: true, message: '请输入发放金额'},
                  {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                ]
              })(
                <Input placeholder="发放金额" />
              )}
            </Form.Item>
            <Form.Item label="释放规则">
              {getFieldDecorator('releaseRule', {
                rules: [
                  {required: true, message: '请输入释放规则'}
                ]
              })(
                <Input placeholder="释放规则" />
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
    nodeIssueVisible: false, // 是否显示节点发放弹框
    nodeIssueLoading: false, // 节点发放弹框确认loading
    personVisible: false, // 是否显示个人奖励弹框
    personLoading: false, // 个人奖励弹框确认loading
    checked: true // 有效性
  }

  onChangeChecked = async(e)=>{
    await this.setState({
      checked: e.target.checked,
    });
    this.getList(1)
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (pageOrSearch.memberId) {
      let code = f_decodeId(pageOrSearch.memberId)[0]
      if (code) {
        pageOrSearch.memberId = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['nodeLevel', 'revenueType'] // 下拉选择的参数
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
                   {...searchParams, page: currentPage, pageSize: 10 ,isValid:this.state.checked} : 
                   {...this.state.currentParams, page: currentPage, pageSize: 10, isValid:this.state.checked}
    this.setState({tableLoading: true, currentPage: currentPage})
    giveIssueList(params).then(data => {
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

  // 释放弹框
  release = (item, txt) => {
    confirm({
      title: `确定${txt}ID为${item.recordId}的充值发放吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          let status = txt === '释放' ? '2' : '9'
          editGiveIssueStatus({recordId: item.recordId, status: status}).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach(v => {
              if (v.recordId === item.recordId) {
                v.status = status
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

  // 删除弹框
  del = (item) => {
    confirm({
      title: `确定删除ID为${item.recordId}的充值发放吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          delGiveIssue(item.recordId).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach((v, i, a) => {
              if (v.recordId === item.recordId) {
                a.splice(i, 1)
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`已删除！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })    
  }

  // 节点发放确定
  onOkNodeIssue = () => {
    this.refs.nodeIssueModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      params.gradeMask = params.gradeMask.join()
      this.setState({nodeIssueLoading: true})
      addGiveIssue(params).then(() => {
        this.getList(1)
        this.setState({nodeIssueLoading: false})
        this.onCancelNodeIssue()
        message.success('节点发放新增成功！')
      }).catch(() => {
        this.setState({nodeIssueLoading: false})
      })
    })
  }

  // 节点发放取消
  onCancelNodeIssue = () => {
    this.setState({nodeIssueVisible: false})
    this.refs.nodeIssueModal.resetFields()
  }

  // 个人奖励确定
  onOkPerson = () => {
    this.refs.personModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values}
      this.setState({personLoading: true})
      addGiveIssue(params).then(() => {
        this.getList(1)
        this.setState({personLoading: false})
        this.onCancelPerson()
        message.success('个人奖励新增成功！')
      }).catch(() => {
        this.setState({personLoading: false})
      })
    })
  }

  // 个人奖励取消
  onCancelPerson = () => {
    this.setState({personVisible: false})
    this.refs.personModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '记录ID',
        dataIndex: 'recordId'
      },
      {
        title: '用户ID',
        dataIndex: 'memberId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '发放类型',
        render: (item) => {
          let nodeStr = (+item.nodeLevel !== 0 && f_nodeLevel[item.nodeLevel]) ? `（${f_nodeLevel[item.nodeLevel]}）` : ''
          let typeStr = f_giveIssueType[item.revenueType] || ''
          if (!nodeStr && !typeStr) {
            return '-'
          } else {
            return typeStr + nodeStr
          }
        }
      }, {
        title: '发放金额',
        dataIndex: 'quantity',
        render: (text) => (text || '-')
      }, {
        title: '会员等级',
        dataIndex: 'gradeMask',
        render: (text) => (text && text.length ? text.split(',').map(v => `V${v}`).join('，') : '-')
      }, {
        title: '发放规则',
        dataIndex: 'releaseRule',
        render: (text) => (text || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '上次发放时间',
        dataIndex: 'lastReleaseDate',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '释放次数',
        dataIndex: 'releaseTimes',
        render: (text) => (text || '-')
      }, {
        title: '释放数量',
        dataIndex: 'releaseQuantity',
        render: (text) => (text || '-')
      }, {
        title: '操作人',
        dataIndex: 'creator',
        render: (text) => (text || '-')
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_giveNodeType[text] || '-')
      }
    ]

    const {authList} = this.context

    if (authList.filter(v => +v === 6013).length) {
      columns.push({
        title: '操作',
        dataIndex: '',
        fixed: 'right',
        width: 100,
        render: (item) => {
          let txt = +item.status === 2 ? '终止' : '释放'
          return (
            <div>
              {
                +item.status !== 9 ?
                <Button size="small" onClick={() => this.release(item, txt)}>{txt}</Button>
                : '-'
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
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      nodeIssueVisible,
      nodeIssueLoading,
      personVisible,
      personLoading,
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
        <div className="pageTitle">赠送充值发放</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <div className="clearfix">
        <div className="fl mb5">
            {
              <Checkbox    
              checked={this.state.checked}
              onChange={this.onChangeChecked}>有效性</Checkbox>
            }
          </div>
          
          <div className="fr mb5">
            {
              !!authList.filter(v => +v === 6011).length &&
              <Button onClick={() => this.setState({nodeIssueVisible: true})}>节点发放</Button>
            }
            {
              !!authList.filter(v => +v === 6012).length &&
              <Button onClick={() => this.setState({personVisible: true})} className="ml10">个人奖励</Button>
            }
          </div>
        </div>
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 节点发放弹框 */}
        <NodeIssueModal
          ref="nodeIssueModal"
          onOk={this.onOkNodeIssue}
          onCancel={this.onCancelNodeIssue}
          visible={nodeIssueVisible}
          confirmLoading={nodeIssueLoading} />

        {/* 个人奖励弹框 */}
        <PersonModal
          ref="personModal"
          onOk={this.onOkPerson}
          onCancel={this.onCancelPerson}
          visible={personVisible}
          confirmLoading={personLoading} />
      </div>
    );
  }
}