import React, { Component } from 'react'
import { Form, DatePicker, Button, List, Avatar, Icon, Input } from 'antd'
import { getChatRecord, getFriendsChatList, getFriendsList } from '@/axios'
import ImgPreview from '@/components/common/imgPreview'
import Expression from '@/components/common/expression'
import { f_chatTime } from '@/tool/filter'
import moment from 'moment'
import './record.scss'

const { RangePicker } = DatePicker

// 全部聊天搜索表单
const AllForm = Form.create({ name: 'allForm' })(
  class extends Component {

    // 提交表单
    handleSubmit = (type) => {
      if (type === 'reset') {
        this.props.form.resetFields()
        this.props.getList('list', {})
      } else {
        this.props.form.validateFields((err, values) => {
          if (err) {
            return
          }
          let params = {...values}
          if (values.time && values.time.length) {
            params.startAt = moment(params.time[0].format('YYYY-MM-DD HH:mm') + ':00').utc().format()
            params.endAt = moment(params.time[1].format('YYYY-MM-DD HH:mm') + ':59').utc().format()
          }
          delete params.time
          this.props.getList('list', params)
        })      
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form;
      const { loading, type } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="时间">
            {getFieldDecorator('time')(
              <RangePicker showTime={{ format: 'HH:mm', defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')] }} format="YYYY-MM-DD HH:mm" />
            )}
          </Form.Item>
          <Form.Item label="关键词">
            {getFieldDecorator('keyword')(
              <Input allowClear placeholder="请输入关键词" />
            )}
          </Form.Item>
          {
            type === 'group' &&
            <Form.Item label="成员ID">
              {getFieldDecorator('memberId', {
                rules: [{ pattern: /^\d*$/, message: '请输入数字' }]
              })(
                <Input allowClear placeholder="请输入成员ID" />
              )}
            </Form.Item>
          }
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

    const chatType = this.props.type
    const info = this.props.info

    this.state = {
      chatType, // 记录类型 group => 群聊记录  personal => 好友聊天记录
      info, // 群信息或者好友信息
      list: [], // 列表数据
      currenList: [], // 当前列表数据
      meta: {}, // 请求列表信息
      listLoading: false, // 列表loading
      moreLoading: false, // 加载更多loading
      pageSize: 20, // 每页条数
      logoFilter: {}, // 通过当前群成员列表或者好友列表获取logo链接对象
    }    
  }

  // 获取列表
  getList = (type, searchFormParams) => {
    const {list, info, chatType, pageSize} = this.state
    let searchParams
    if (typeof searchFormParams === 'object') {
      for (let key in searchFormParams) {
        if (!searchFormParams[key]) {
          delete searchFormParams[key]
        }
      }
      searchParams = {...searchFormParams} 
    }
    let tag = list[0] ? list[0].id : -1
    if (searchFormParams) {
      tag = -1
    }
    type === 'more' ? this.setState({moreLoading: true}) : this.setState({listLoading: true})
    let scrollHeight1 = this.refs.recordBox ? this.refs.recordBox.scrollHeight : 0
    if (chatType === 'group') {
      const params = searchParams ? 
                   {...searchParams, tag, size: pageSize, type: 'all'} : 
                   {...this.state.currentParams, tag, size: pageSize, type: 'all'};
      getChatRecord(info.roomId, params).then(data => {
        let dataList = (data.data.items || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        this.setState({
          currentParams: params,
          meta: data.data.page || {}
        })
        if (type === 'more') {
          this.setState({moreLoading: false, list: [...dataList, ...list], currenList: data.data.items || []}, () => {
            this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
          })
        } else {
          this.setState({listLoading: false, list: dataList, currenList: data.data.items || []}, () => {
            this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - this.refs.recordBox.clientHeight
          })
        }
      }).catch(() => {
        this.setState({list: []})
        type === 'more' ? this.setState({moreLoading: false}) : this.setState({listLoading: false, list: []})
      })      
    } else {
      const params = searchParams ? 
                   {...searchParams, tag, size: pageSize, type: 'all', friendId: info.id} : 
                   {...this.state.currentParams, tag, size: pageSize, type: 'all', friendId: info.id};
      getFriendsChatList(info.info.id, params).then(data => {
        let dataList = (data.data.items || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        data.data.meta = {totalCount: 8000}
        this.setState({
          currentParams: params,
          meta: data.data.page || {}
        })
        if (type === 'more') {
          this.setState({moreLoading: false, list: [...dataList, ...list], currenList: data.data.items}, () => {
            this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
          })
        } else {
          this.setState({listLoading: false, list: dataList, currenList: data.data.items}, () => {
            this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - this.refs.recordBox.clientHeight
          })
        }
      }).catch(() => {
        this.setState({list: []})
        type === 'more' ? this.setState({moreLoading: false}) : this.setState({listLoading: false, list: []})
      })   
    }
  }

  // 渲染前
  componentWillMount() {
    this.getList('list')

    const {chatType, info} = this.state
    if (chatType === 'personal') {
      getFriendsList(info.info.id, {page: 1, pageSize: 10}).then(data => {
        const logoFilter2 = {...this.state.logoFilter}
        let arr = data.data.items || []
        arr.forEach(v => {
          logoFilter2[v.id] = v.logo || ''
        })
        this.setState({logoFilter: logoFilter2})
      })
      getFriendsList(info.id, {page: 1, pageSize: 10}).then(data => {
        const logoFilter2 = {...this.state.logoFilter}
        let arr = data.data.items || []
        arr.forEach(v => {
          logoFilter2[v.id] = v.logo || ''
        })
        this.setState({logoFilter: logoFilter2})
      })
    }
  }

  // 滚轮事件
  boxWheel = (e) => {
    e.persist()
    const {meta, list, currenList, pageSize, moreLoading} = this.state
    if (e.deltaY < 0 && this.refs.recordBox.scrollTop === 0) {
      if (meta.totalCount > list.length && currenList.length === pageSize && !moreLoading) {
        this.getList('more')
      }
    }
  }

  // 渲染
  render() {
    const {list, listLoading, moreLoading, meta, chatType, pageSize, currenList, logoFilter} = this.state
    const imgList = list.filter(v => v.msgType === 'image').map(v => ({id: v.id, url: v.message}))

    return (
      <div className="chatRecord">
        <AllForm getList={this.getList} loading={listLoading} type={chatType}/>
        <div>共搜索到 {meta.totalCount || 0} 条数据</div>
        <div className="recordBox" ref="recordBox" onWheel={this.boxWheel}>
          {
            !!list.length &&
            <div className="header">
            {
              (moreLoading || listLoading) ?
              <Icon type="loading" />
              :
              <div>
                {
                  (meta.totalCount > list.length && currenList.length === pageSize) ?
                  <span className="link" onClick={this.getList.bind(this, 'more', '')}>加载更多...</span>
                  :
                  <span>没有更多了~</span>
                }
              </div>
            }
            </div>
          }
          <List
            className="content"
            loading={listLoading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    item.sender === '-1' ?
                    <Avatar icon="user" />
                    :
                    <Avatar src={chatType === 'group' ? item.senderLogo : logoFilter[item.sender]} />
                  }
                  title={item.sender === '-1' ? '管理员' : (item.senderName || '-')}
                  description={
                    item.msgType === 'image' ? 
                    <div className="allRecordImg"><ImgPreview imgList={imgList} id={item.id} key={item.id}/></div>
                    : 
                    <Expression msg={item.message}/>
                  }
                />
                <div>{f_chatTime(item.createdAt)}</div>
              </List.Item>
            )}
          />        
        </div>
      </div>
    )
  }
}