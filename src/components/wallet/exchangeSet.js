import React, { Component } from 'react'
import { exchangeList, exchangeAdd, exchangeEdit, exchangeDel, getAllCoinList } from '@/axios'
import { Table, Form, Input, Button, Select, message, Modal, Checkbox } from 'antd'
import { f_exchangeLang, ObjToArr } from '@/tool/filter' 
import MyContext from '@/tool/context'
import moment from 'moment'

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
      const { loading, coinList } = this.props
      return (
        <Form className="searchForm" layout="inline">
          <Form.Item label="闪兑前币种">
            {getFieldDecorator('coinExchangeFrom', {
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
                  coinList.map(item => {
                    return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="闪兑后币种">
            {getFieldDecorator('coinExchangeTo', {
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
                  coinList.map(item => {
                    return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
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

// 添加闪兑弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, coinList } = this.props
      return (
        <Modal
          width="630px"
          title='添加闪兑设置'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 18}} onSubmit={this.handleSubmit} >
            <Form.Item label="闪兑前币种">
              {getFieldDecorator('coinExchangeFrom', {
                rules: [
                  {required: true, message: '请选择闪兑前币种'}
                ]
              })(
                <Select
                  showSearch
                  placeholder="请选择闪兑前币种"
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {
                    coinList.map(item => {
                      return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="闪兑后币种">
              {getFieldDecorator('coinExchangeTo', {
                rules: [
                  {required: true, message: '请选择闪兑后币种'}
                ]
              })(
                <Select
                  showSearch
                  placeholder="请选择闪兑后币种"
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }>
                  {
                    coinList.map(item => {
                      return <Option value={item.coinId} key={item.coinId}>{item.shortName}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="支持语言">
              {getFieldDecorator('suportLanguage', {
                initialValue: ['zh_cn', 'zh_tw', 'km_kh', 'en_us', 'ja_jp', 'ko_kr'],
                rules: [
                  {required: true, message: '请选择支持语言'},
                ]
              })(
                <Checkbox.Group>
                  {
                    ObjToArr(f_exchangeLang).map(v => <Checkbox value={v.id} key={v.id}>{v.name}</Checkbox>)
                  }
                </Checkbox.Group>
              )}
            </Form.Item>
            <Form.Item label="闪兑手续费率">
              {getFieldDecorator('exchangeFee', {
                rules: [
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="闪兑手续费率，不填会取系统默认值" addonAfter="%"/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑闪兑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, currentItem } = this.props
      let title = `编辑闪兑（${currentItem.coinExchangeFromSymbol} => ${currentItem.coinExchangeToSymbol}）`
      return (
        <Modal
          width="630px"
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 18}} onSubmit={this.handleSubmit} >
            <Form.Item label="支持语言">
              {getFieldDecorator('suportLanguage', {
                initialValue: currentItem.suportLanguage ? currentItem.suportLanguage.split(',') : [],
                rules: [
                  {required: true, message: '请选择支持语言'},
                ]
              })(
                <Checkbox.Group style={{marginTop: '10px'}}>
                  {
                    ObjToArr(f_exchangeLang).map(v => <Checkbox value={v.id} key={v.id}>{v.name}</Checkbox>)
                  }
                </Checkbox.Group>
              )}
            </Form.Item>
            <Form.Item label="闪兑手续费率">
              {getFieldDecorator('exchangeFee', {
                initialValue: currentItem.exchangeFee || '',
                rules: [
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="闪兑手续费率，不填会取系统默认值" addonAfter="%"/>
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
    editVisible: false, // 是否显示编辑弹框
    editLoading: false, // 编辑弹框确定loading
    currentItem: {}, // 当前操作项
    coinList: [], // 币种列表
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      let selectKeys = ['coinExchangeFrom', 'coinExchangeTo'] // 下拉选择的参数
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
    exchangeList(params).then(data => {
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
        title: 'ID',
        dataIndex: 'id',
        render: (text) => (text || '-')
      }, {
        title: '闪兑前币种',
        dataIndex: 'coinExchangeFromSymbol',
        render: (text) => (text || '-')
      }, {
        title: '闪兑后币种',
        dataIndex: 'coinExchangeToSymbol',
        render: (text) => (text || '-')
      }, {
        title: '闪兑手续费率',
        dataIndex: 'exchangeFee',
        render: (text) => (text ? `${text}%` : '-')
      }, {
        title: '支持语言',
        dataIndex: 'suportLanguage',
        render: (text) => {
          if (text && text.split && text.split(',') && text.split(',').length) {
            return text.split(',').map(v => f_exchangeLang[v]).join('，')
          } else {
            return '-'
          }
        }
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-')
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 3046).length // 编辑闪兑权限
    const auth2 = !!authList.filter(v => +v === 3047).length // 删除闪兑权限
    if (auth1 || auth2) {
      list.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}
              {auth2 && <Button size="small" type="danger" onClick={() => this.del(item)}>删除</Button>}              
            </div>
          )
        }
      })
    }

    return list
  }

  // 编辑闪兑打开弹框
  edit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑闪兑确定
  onOkEdit = () => {
    const {tableList, currentItem} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, id: currentItem.id, suportLanguage: values.suportLanguage.join(',')}
      this.setState({editLoading: true})
      exchangeEdit(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.id === currentItem.id) {
            v.exchangeFee = values.exchangeFee
            v.suportLanguage = values.suportLanguage.join(',')
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

  // 编辑闪兑取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 添加闪兑确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (values.coinExchangeFrom === values.coinExchangeTo) {
        message.warning('闪兑前后币种不能重复！')
        return
      }
      let params = {...values, suportLanguage: values.suportLanguage.join(',')}
      this.setState({addLoading: true})
      exchangeAdd(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加闪兑取消
  onCancelAdd = () => {
    this.setState({addVisible: false})
    this.refs.addModal.resetFields()
  }

  // 删除闪兑设置
  del = item => {
    confirm({
      title: `确定删除${item.coinExchangeFromSymbol} => ${item.coinExchangeToSymbol}的闪兑设置吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          exchangeDel(item.id).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach((v, i, a) => {
              if (v.id === item.id) {
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

  // 渲染前
  componentWillMount() {
    this.getList(1)
    getAllCoinList().then(data => {
      this.setState({coinList: data.data || []})
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
      editVisible,
      editLoading,
      currentItem,
      coinList,
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
        <div className="pageTitle">闪兑设置</div>
        <SearchForm getList={this.getList.bind(this)} loading={tableLoading} coinList={coinList}/>
        {
          !!authList.filter(v => +v === 3045).length &&
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

        {/* 添加闪兑弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          coinList={coinList}
          confirmLoading={addLoading} />

        {/* 编辑闪兑弹框 */}
        <EditModal
          ref="editModal"
          currentItem={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />
      </div>
    );
  }
}