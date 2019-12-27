import React, { Component } from 'react'
import { getDownLoadList } from '@/axios'
import { Table, Form, Input, Button, Select } from 'antd'
import { f_logType, ObjToArr, f_fileDownloadStatus } from '@/tool/filter'
import moment from 'moment'

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
          <Form.Item label="操作员">
            {getFieldDecorator('createBy')(
              <Input allowClear placeholder="请输入操作员" />
            )}
          </Form.Item>
          <Form.Item label="操作类型">
            {getFieldDecorator('type', {
              initialValue: '-1'
            })(
              <Select>
                <Option value="-1">全部</Option>
                {
                  ObjToArr(f_logType).map(v => {
                    return <Option value={v.id} key={v.id}>{v.name}</Option>
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

export default class extends Component {
  // 状态
  state = {
    tableList: [], // 列表数据
    meta: {}, // 请求列表信息
    currentPage: 1, // 当前页码
    tableLoading: false, // 列表请求loading
    currentParams: {}, // 当前查询参数
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['type'] // 下拉选择的参数
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
    getDownLoadList(params).then(data => {
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
    return [
      {
        title: 'ID',
        dataIndex: 'id'
      }, {
        title: '文件名',
        dataIndex: 'name',
        render: (text) => (text || '-')
      }, {
        title: '标题',
        dataIndex: 'title',
        render: (text) => {
          if (text && text.length) {
            if (text.length > 40) {
              return <span title={text}>{text.slice(0, 40) + '...'}</span>
            } else {
              return text
            }
          } else {
            return '-'
          }
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (f_fileDownloadStatus[text] || '-')
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }, {
        title: '操作',
        render: item => {
          if (+item.status === 2) {
            return <a href={item.address} style={{with: '100%'}}><Button size="small">下载</Button></a>
          } else {
            return '-'
          }
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
        <div className="pageTitle">文件下载</div>
        { false && <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>}
        <div className="clearfix">
          <div className="fr mb5">
            <Button shape="round" icon="redo" onClick={() => this.getList(1)}>刷新</Button>
          </div>
        </div>
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}