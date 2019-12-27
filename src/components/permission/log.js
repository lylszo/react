import React, { Component } from 'react'
import { getLogList } from '@/axios'
import { Table, Form, Input, Button, Select } from 'antd'
import { f_logType, ObjToArr, f_encodeId } from '@/tool/filter'
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
    getLogList(params).then(data => {
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
        title: '操作员',
        dataIndex: 'createBy',
        render: (text) => (text || '-')
      }, {
        title: '操作内容',
        dataIndex: 'content',
        render: (text) => (text || '-')
      }, {
        title: '操作类型',
        dataIndex: 'type',
        render: (text) => (f_logType[text] || '-')
      }, {
        title: '操作对象ID',
        dataIndex: 'accountId',
        render: (text) => (f_encodeId(text) || '-')
      }, {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
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
        <div className="pageTitle">操作日志</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading}/>
        <Table
          className="mt15"
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />
      </div>
    );
  }
}