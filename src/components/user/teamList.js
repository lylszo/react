import React, { Component } from 'react'
import { getUserList, getInviteList } from '@/axios'
import { Form, Input, Button, message, Tree, Alert } from 'antd'
import { f_encodeId, f_decodeId } from '@/tool/filter'

const { TreeNode } = Tree

// 搜索表单
const SearchForm = Form.create({ name: 'teamListSearch' })(
  class extends Component {

    // 提交表单
    handleSubmit = (type) => {
      if (type === 'reset') {
        this.props.form.resetFields()
        this.props.getList('reset')
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
      const { loading, id } = this.props
      return (
        <Form className="searchForm" layout="inline">
          {
            id ?
            <Form.Item label="用户ID">
              {getFieldDecorator('id', {
                initialValue: id,
                rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
              })(
                <Input allowClear placeholder="请输入用户ID" />
              )}
            </Form.Item>
            :
            <Form.Item label="用户ID">
              {getFieldDecorator('id', {
                initialValue: '',
                rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
              })(
                <Input allowClear placeholder="请输入用户ID" />
              )}
            </Form.Item>            
          }
          <Form.Item label="手机号">
            {getFieldDecorator('phoneNumber', {
              rules: [{ pattern: /^[+\d]*$/, message: '请输入正确的手机号' }]
            })(
              <Input allowClear placeholder="请输入手机号" />
            )}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('emailAddress')(
              <Input allowClear placeholder="请输入邮箱" />
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
  constructor(props) {
    super(props)
    let id = props.location.state && props.location.state.id

    // 状态
    this.state = {
      id: id, // 其他页面传过来的用户id（app显示的） 
      currentUser: {}, // 当前搜索的用户信息
      searchLoading: false, // 搜索loading
      treeData: [], // 当前用户的邀请记录 
      text: '请查询数据', // 提示信息 
      expandedKeys: [], // 展开key
      treeKey: 0, // 树结构的key值
    }    
  }

  // 获取用户列表
  getList = (params) => {
    if (params === 'reset') {
      this.setState({currentUser: {}, treeData: [], id: ''})
      message.info('已重置，请输入搜索条件查询！')
      return
    }
    let paramsLength = 0
    for (let key in params) {
      if (params[key]) {
        paramsLength++
      }
    }
    if (!paramsLength) {
      message.info('请输入搜索条件！')
      return
    }
    if (params.id) {
      let code = f_decodeId(params.id)[0]
      if (code) {
        params.id = code
      } else {
        message.info('用户ID不存在！')
        return     
      }
    }
    for (let key in params) {
      if (!params[key]) {
        delete params[key]
      }
    }
    const params2 = Object.assign({page: 1}, params)
    this.setState({searchLoading: true})
    getUserList(params2).then(data => {
      let firstUser = (data.data.items && data.data.items[0]) ? data.data.items[0] : {}
      this.setState({
        currentUser: firstUser,
        expandedKeys: [firstUser.accountId + ''],
        treeData: firstUser.accountId ? [firstUser] : [],
        searchLoading: false,
        treeKey: new Date().getTime()
      }, () => {
        if (!firstUser.accountId) {
          this.setState({text: '未查询到结果'})     
        }
      })
    }).catch(() => {
      this.setState({currentUser: {}, treeData: [], searchLoading: false})
    })
  }

  // 根据后台返回的用户信息转化成展示信息
  transferInfo = (info) => {
    return `
      用户ID：${f_encodeId(info.accountId) || '-'}，
      姓名：${info.realName || '-'}，
      账号：${info.account.phoneNumber || info.account.emailAddress || '-'}，
      推荐人账号：${info.parentPhone || info.parentEmailAddress || '-'}，
      团队人数：${info.peopleNum || '-'}，
      AI智能宝业绩：${info.smartRevenue || '-'}，
      LARGE智能宝业绩：${info.largeSmartBalance || '-'}，
      AI智能宝团队业绩：${info.teamSmartRevenue || '-'}，
      LARGE智能宝团队业绩：${info.teamLargeSmartBalance || '-'}
    `
  }

  // 树结构数据
  renderTreeNodes = (data) => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={this.transferInfo(item)} key={item.accountId} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode title={this.transferInfo(item)} key={item.accountId} dataRef={item} />
    })
  }

  // 加载记录
  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      this.setState({searchLoading: true})
      if (!treeNode.props.children) {
        getInviteList({userId: treeNode.props.eventKey}).then(list => {
          treeNode.props.dataRef.children = list.data.items
          this.setState({treeData: [...this.state.treeData], searchLoading: false})
          resolve()
        }).catch(() => {
          this.setState({searchLoading: false})
        })
      } else {
        this.setState({treeData: [...this.state.treeData], searchLoading: false})
        resolve()
      }
    })
  }

  // 点击展开/折叠
  onExpand = (expandedKeys, {expanded}) => {
    this.setState({expandedKeys: expandedKeys})
  }

  // 渲染前
  componentWillMount() {
    const {id} = this.state
    if (id) {
      this.getList({id})
    }
  }

  // 渲染
  render() {
    const {currentUser, treeData, searchLoading, text, expandedKeys, id, treeKey} = this.state

    return (
      <div>
        <div className="pageTitle">团队列表</div>
        <SearchForm getList={this.getList.bind(this)} loading={searchLoading} id={id}/>

        <div className="mt10">
          {
            !currentUser.accountId &&
            <Alert message={text} type="info" />
          }
          <Tree
            key={treeKey}
            showLine
            expandedKeys={expandedKeys}
            onExpand={this.onExpand}
            loadData={this.onLoadData}
            selectable={false}>
            {this.renderTreeNodes(treeData)}
          </Tree>          
        </div>
      </div>
    );
  }
}