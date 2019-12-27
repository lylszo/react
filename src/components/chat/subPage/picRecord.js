import React, { Component } from 'react'
import { Form, DatePicker, Button, List, Icon, Row, Col } from 'antd'
import { getChatRecord, getFriendsChatList } from '@/axios'
import ImgPreview from '@/components/common/imgPreview'
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
      const { loading } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="时间">
            {getFieldDecorator('time')(
              <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm"/>
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

    const chatType = this.props.type
    const info = this.props.info

    this.state = {
      chatType, // 记录类型 group => 群聊记录  personal => 好友聊天记录
      info, // 群信息或者好友信息
      list: [], // 列表数据按月份归类
      originList: [], // 列表数据未分月份
      meta: {}, // 请求列表信息
      listLoading: false, // 列表loading
      moreLoading: false, // 加载更多loading
      pageSize: 20, // 每页条数
      currenList: [], // 当前请求数据
    }
  }

  // 获取列表
  getList = (type, searchFormParams) => {
    const {info, chatType, pageSize, originList} = this.state
    let searchParams
    if (typeof searchFormParams === 'object') {
      for (let key in searchFormParams) {
        if (!searchFormParams[key]) {
          delete searchFormParams[key]
        }
      }
      searchParams = {...searchFormParams} 
    }
    let tag = originList[0] ? originList[0].id : -1
    if (searchFormParams) {
      tag = -1
    } 
    type === 'more' ? this.setState({moreLoading: true}) : this.setState({listLoading: true})
    let scrollHeight1 = this.refs.recordBox ? this.refs.recordBox.scrollHeight : 0
    if (chatType === 'group') {
      const params = searchParams ? 
                   {...searchParams, tag, size: pageSize, type: 'image'} : 
                   {...this.state.currentParams, tag, size: pageSize, type: 'image'};
      getChatRecord(info.roomId, params).then(data => {
        let arr = (data.data.items || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        if (type === 'more') {
          arr = [...arr, ...originList]
        }
        let dataList = this.transferPicArr(arr)
        this.setState({
          currentParams: params,
          meta: data.data.page || {},
          list: dataList,
          originList: arr,
          currenList: data.data.items || []
        })
        type === 'more' ?
        this.setState({moreLoading: false}, () => {
          this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
        })
        :
        this.setState({listLoading: false}, () => {
          this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
        })
      }).catch(() => {
        this.setState({list: []})
        type === 'more' ? this.setState({moreLoading: false}) : this.setState({listLoading: false, list: []})
      })      
    } else {
      const params = searchParams ? 
                   {...searchParams, tag, size: pageSize, type: 'image', friendId: info.id} : 
                   {...this.state.currentParams, tag, size: pageSize, type: 'image', friendId: info.id};
      getFriendsChatList(info.info.id, params).then(data => {
        let arr = (data.data.items || []).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        if (type === 'more') {
          arr = [...arr, ...originList]
        }
        let dataList = this.transferPicArr(arr)
        this.setState({
          currentParams: params,
          meta: data.data.page || {},
          list: dataList,
          originList: arr,
          currenList: data.data.items || []
        })
        type === 'more' ?
        this.setState({moreLoading: false}, () => {
          this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
        })
        :
        this.setState({listLoading: false}, () => {
          this.refs.recordBox.scrollTop = this.refs.recordBox.scrollHeight - scrollHeight1
        })
      }).catch(() => {
        this.setState({list: []})
        type === 'more' ? this.setState({moreLoading: false}) : this.setState({listLoading: false, list: []})
      })   
    }
  }

  // 转化图片列表
  transferPicArr = (arr) => {
    let monthObj = {}
    arr.forEach(v => {
      let t = moment(v.time).format('YYYY年MM月')
      if (monthObj[t]) {
        monthObj[t] = monthObj[t].concat([v])
      } else {
        monthObj[t] = [v]
      }
    })
    let monthArr = []
    for (let i in monthObj) {
      monthArr.push({title: i, list: monthObj[i]})
    }
    return monthArr
  }

  // 转成可轮播图片列表
  toImgList = (list) => {
    const arr = list.map(v => ({id: v.id, url: v.message}))
    return arr
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

  // 渲染前
  componentWillMount() {
    this.getList('list')
  }

  // 渲染
  render() {
    const {list, listLoading, moreLoading, meta, currenList, pageSize} = this.state
    
    return (
      <div className="chatRecord">
        <AllForm getList={this.getList.bind(this)} loading={listLoading} onWheel={this.boxWheel}/>
        <div>共搜索到 {meta.totalCount || 0} 条数据</div>
        <div className="recordBox" ref="recordBox">
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
                  title={item.title || '-'}
                  description={
                    <Row>
                      { item.list.map((v, i) => (
                          <Col span={4} className="imgItem" key={i}>
                            <ImgPreview imgList={this.toImgList(item.list)} id={v.id} key={v.id}/>
                          </Col>
                        ))
                      }
                    </Row>
                  }
                />
              </List.Item>
            )}
          />        
        </div>
      </div>
    )
  }
}