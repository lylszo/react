import React, { Component } from 'react'
import { teamLeaderList, editTeamLeaderStatus, addTeamLeader, getCaptainParams, editTeamLeader } from '@/axios'
import { Table, Form, Input, Button, Select, message, Modal, Switch, Radio } from 'antd'
import { f_encodeId, f_decodeId } from '@/tool/filter'
import MyContext from '@/tool/context'

const Option = Select.Option
const confirm = Modal.confirm

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
          <Form.Item label="是否团队长">
            {getFieldDecorator('mask', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="2">是</Option>
                <Option value="0">否</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="发放模式">
            {getFieldDecorator('issueType', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="0">所有用户</Option>
                <Option value="1">有效用户</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="团队业绩统计">
            {getFieldDecorator('isIncludeLarge', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                <Option value="1">包含LARGE智能宝</Option>
                <Option value="0">不包含LARGE智能宝</Option>
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

// 添加团队长弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, validUSDT } = this.props
      return (
        <Modal
          width="580px"
          title='添加团队长'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="账号">
              {getFieldDecorator('account', {
                rules: [
                  {required: true, message: '请输入账号'}
                ]
              })(
                <Input placeholder="账号" />
              )}
            </Form.Item>
            <Form.Item label="奖励基数">
              {getFieldDecorator('base', {
                rules: [
                  {required: true, message: '请输入奖励基数'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="奖励基数" />
              )}
            </Form.Item>
            <Form.Item label="奖励数量">
              {getFieldDecorator('num', {
                rules: [
                  {required: true, message: '请输入奖励数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="奖励数量" />
              )}
            </Form.Item>
            <Form.Item label="发放模式">
              {getFieldDecorator('issueType', {
                initialValue: '0',
                rules: [
                  { required: true, message: '请选择发放模式' }
                ]
              })(
                <Radio.Group>
                  <Radio value="0">所有用户</Radio>
                  <Radio value="1" className="ml30">有效用户（{validUSDT}USDT）</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="团队业绩统计">
              {getFieldDecorator('isIncludeLarge', {
                initialValue: '0',
                rules: [
                  { required: true, message: '请选择发放模式' }
                ]
              })(
                <Radio.Group>
                  <Radio value="1" className="ml30">包含LARGE智能宝</Radio>
                  <Radio value="0">不包含LARGE智能宝</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑团队长弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, validUSDT, currentItem } = this.props
      let title = `编辑团队长（用户ID：${f_encodeId(currentItem.memberId)}）`
      return (
        <Modal
          width="580px"
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="奖励基数">
              {getFieldDecorator('base', {
                initialValue: currentItem.base || '',
                rules: [
                  {required: true, message: '请输入奖励基数'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="奖励基数" />
              )}
            </Form.Item>
            <Form.Item label="奖励数量">
              {getFieldDecorator('num', {
                initialValue: currentItem.num || '',
                rules: [
                  {required: true, message: '请输入奖励数量'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="奖励数量" />
              )}
            </Form.Item>
            <Form.Item label="发放模式">
              {getFieldDecorator('issueType', {
                initialValue: currentItem.issueType || '0',
                rules: [
                  { required: true, message: '请选择发放模式' }
                ]
              })(
                <Radio.Group>
                  <Radio value="0">所有用户</Radio>
                  <Radio value="1" className="ml30">有效用户（{validUSDT}USDT）</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="团队业绩统计">
              {getFieldDecorator('isIncludeLarge', {
                initialValue: currentItem.isIncludeLarge ? '1' : '0',
                rules: [
                  { required: true, message: '请选择发放模式' }
                ]
              })(
                <Radio.Group>
                  <Radio value="1" className="ml30">包含LARGE智能宝</Radio>
                  <Radio value="0">不包含LARGE智能宝</Radio>
                </Radio.Group>
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
    validUSDT: '0', // 有效用户所需USDT
    addVisible: false, // 是否显示添加弹框
    addLoading: false, // 添加弹框确定loading
    editVisible: false, // 是否显示编辑弹框
    editLoading: false, // 编辑弹框确定loading
    currentItem: {}, // 当前操作项
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
      let selectKeys = ['mask', 'issueType', 'isIncludeLarge'] // 下拉选择的参数
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
                   {...searchParams, page: currentPage, pageSize: 10, type: 2} : 
                   {...this.state.currentParams, page: currentPage, pageSize: 10, type: 2}
    this.setState({tableLoading: true, currentPage: currentPage})
    teamLeaderList(params).then(data => {
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

  // 查看团队详情
  toDetail = item => {
    this.props.history.push({pathname: '/teamList', state: {id: f_encodeId(item.memberId)}})
  }

  // 整理列表项
  getColumns() {
    let list = [
      {
        title: '用户ID',
        dataIndex: 'memberId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '奖励基数',
        dataIndex: 'base',
        render: (text) => (text || '-')
      }, {
        title: '奖励数量',
        dataIndex: 'num',
        render: (text) => (text || '-')
      }, {
        title: '已达基数',
        dataIndex: 'arriveBase',
        render: (text) => (text || '-')
      }, {
        title: '团队人数',
        dataIndex: 'teamNum',
        render: (text) => (text || '-')
      }, {
        title: '团队业绩',
        dataIndex: 'teamRenvenue',
        render: (text) => (text || '-')
      }, {
        title: '发放模式',
        dataIndex: 'issueType',
        render: (text) => (+text ? '有效用户' : '所有用户')
      }, {
        title: '团队业绩统计',
        dataIndex: 'isIncludeLarge',
        render: (text) => (+text ? '包含LARGE智能宝' : '不包含LARGE智能宝')
      },
      {
        title: '状态',
        render: item => {
          return <Switch 
                  checkedChildren="开"
                  unCheckedChildren="关"
                  onClick={() => this.changeStatus(item)}
                  checked={+item.mask === 2} />
        }
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 2013).length // 查看团队列表权限
    const auth2 = !!authList.filter(v => +v === 6020).length // 编辑团队长权限
    if (auth1 || auth2) {
      list.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.toDetail(item)}>查看</Button>}
              {auth2 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}              
            </div>
          )
        }
      })
    }

    return list
  }

  // 编辑团队长打开弹框
  edit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑团队长确定
  onOkEdit = () => {
    const {tableList, currentItem} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, memberId: currentItem.memberId, isIncludeLarge: +values.isIncludeLarge === 1 ? true : false}
      this.setState({editLoading: true})
      editTeamLeader(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.memberId === currentItem.memberId) {
            for(let i in values) {
              v[i] = values[i]
            }
          }
        })
        this.setState({tableList: tableList2, editLoading: false})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑团队长取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 添加团队长确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, type: 2, isIncludeLarge: +values.isIncludeLarge === 1 ? true : false}
      this.setState({addLoading: true})
      addTeamLeader(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加团队长取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
  }

  // 团队长状态开关
  changeStatus = (item) => {
    const {authList} = this.context
    if (!authList.filter(v => +v === 6019).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    let txt = +item.mask === 2 ? '关闭' : '开启'
    confirm({
      title: `确定设置ID为${f_encodeId(item.memberId)}的团队长为${txt}状态吗？`,
      width: 480,
      onOk:() => {
        return new Promise((resolve, reject) => {
          const mask = +item.mask === 2 ? '0' : '2'
          editTeamLeaderStatus({memberId: item.memberId, mask: mask}).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach(v => {
              if (v.memberId === item.memberId) {
                v.mask = mask
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

  // 渲染前
  componentWillMount() {
    this.getList(1)
    getCaptainParams().then(({data}) => {
      this.setState({validUSDT: data ? data.validThreshold : 0})
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
      validUSDT,
      editVisible,
      editLoading,
      currentItem,
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
        <div className="pageTitle">团队长设置</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        {
          !!authList.filter(v => +v === 6018).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          </div>          
        }
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加团队长弹框 */}
        <AddModal
          ref="addModal"
          validUSDT={validUSDT}
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 编辑团队长弹框 */}
        <EditModal
          ref="editModal"
          currentItem={currentItem}
          validUSDT={validUSDT}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />
      </div>
    );
  }
}