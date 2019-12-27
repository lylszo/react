import React, { Component } from 'react'
import { getParamList, editParam } from '@/axios'
import { Table, Form, Input, Button, Modal, message, Switch, Radio } from 'antd'
import MyContext from '@/tool/context'

// 编辑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item, paramsSort } = this.props
      let requiredPattern = [
        { required: true, message: `请输入${item.description}` }
      ]
      let numberPattern = [
        { required: true, message: `请输入${item.description}` },
        {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
      ]
      // 参数类型
      let switchArr = paramsSort.switch.filter(v => v.value === item.configKey)
      let radioArr = paramsSort.radio.filter(v => v.value === item.configKey)
      let type = 1 // 输入框
      if (switchArr.length) {
        type = 2 // 按钮
      } else if (radioArr.length) {
        type = 3 // 单选框
      }
      return (
        <Modal
          title="编辑参数"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form onSubmit={this.handleSubmit} >
              <div style={{display: 'flex', padding: '0 20px'}}>
                <div className="lh40 tar">{item.description}：</div>
                {
                  type === 1 &&
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('configValue', {
                      initialValue: item.configValue || '',
                      rules: item.configKey === 'WALLET_BALANCE_IP' ? requiredPattern : numberPattern
                    })(
                      <Input placeholder={item.description} />
                    )}
                  </Form.Item>     
                }
                {
                  type === 2 &&
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('configValue', {
                      initialValue: +item.configValue ? true : false,
                      valuePropName: 'checked'
                    })(
                      <Switch 
                        checkedChildren={switchArr[0].open}
                        unCheckedChildren={switchArr[0].close} />
                    )}
                  </Form.Item>
                }
                {
                  type === 3 &&
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('configValue', {
                      initialValue: item.configValue || ''
                    })(
                      <Radio.Group>
                        {
                          radioArr[0].group.map(v => <Radio value={v.value} key={v.value}>{v.name}</Radio>)
                        }
                      </Radio.Group>
                    )}
                  </Form.Item>
                }         
              </div>
          </Form>
        </Modal>
      )
    }
  }
)

export default class extends Component {
  static contextType = MyContext

  constructor(props) {
    super(props)

    // 状态
    this.state = {
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      tableList: [], // 列表数据
      currentParams: {}, // 当前查询参数
      editVisible: false, // 是否显示编辑弹框
      editLoading: false, // 编辑弹框确认loading
      currentItem: {}, // 当前编辑项
      paramsSort: { // 参数分类
        switch: [ // 开关类型
          {
            value: 'SMART_RECHARGE',
            open: '开',
            close: '关',
            filter: {
              '0': '关闭',
              '1': '开启'
            }
          },
          {
            value: 'YBT_IS_ALLOW_TRANSFER',
            open: '是',
            close: '否',
            filter: {
              '0': '否',
              '1': '是'
            }
          },
          {
            value: 'YBT_API_PAY_RED',
            open: '开',
            close: '关',
            filter: {
              '0': '关闭',
              '1': '开启'
            }
          },
          {
            value: 'YBT_API_PAY_TSH',
            open: '开',
            close: '关',
            filter: {
              '0': '关闭',
              '1': '开启'
            }
          },
          {
            value: 'YBT_API_PAY_YPH',
            open: '开',
            close: '关',
            filter: {
              '0': '关闭',
              '1': '开启'
            }
          }
        ],
        radio: [ // 单选框类型
          {
            value: 'FEE_TYPE',
            group: [
              {value: '0', name: 'ybt'},
              {value: '1', name: 'ybt不足扣除本币'}
            ], 
            filter: {
              '0': 'ybt',
              '1': 'ybt不足扣除本币'
            }
          }
        ]
      },
    }
  }

  // 获取列表
  getList = (pageOrSearch) => {
    let searchParams
    let currentPage = 1
    if (typeof pageOrSearch === 'object') { // 点击查询按钮
      searchParams = {...pageOrSearch}
    } else {
      currentPage = pageOrSearch
    }
    const params = searchParams ? {...searchParams, page: currentPage} : {...this.state.currentParams, page: currentPage}
    this.setState({tableLoading: true, currentPage: currentPage})
    getParamList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 打开编辑弹框
  edit = (item) => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑确定
  onOkEdit = () => {
    const { currentItem, tableList, paramsSort } = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        id: currentItem.id,
        configValue: values.configValue
      }
      // switch类型参数传值
      if (paramsSort.switch.filter(v => v.value === currentItem.configKey).length) {
        params.configValue = values.configValue ? '1' : '0'
      }
      this.setState({editLoading: true})
      editParam(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.id === currentItem.id) {
            v.configValue = params.configValue
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

  // 编辑取消
  onCancelEdit = () => {
    this.setState({editVisible: false})
    this.refs.editModal.resetFields()
  }

  // 整理列表项
  getColumns() {
    const {paramsSort} = this.state
    let columns = [
      {
        title: '参数描述',
        dataIndex: 'description',
        render: (text) => (text || '-')
      }, {
        title: '参数值',
        render: item => {
          let switchArr = paramsSort.switch.filter(v => v.value === item.configKey)
          let radioArr = paramsSort.radio.filter(v => v.value === item.configKey)
          if (switchArr.length) {
            return switchArr[0].filter[item.configValue] || '-'
          } else if (radioArr.length) {
            return radioArr[0].filter[item.configValue] || '-'
          } else {
            return item.configValue 
          }
        }
      }
    ]

    const {authList} = this.context
    if (authList.filter(v => +v === 6025).length) {
      columns.push({
        title: '操作',
        dataIndex: '',
        width: 120,
        render: item => {
          return <Button size="small" onClick={() => this.edit(item)}>编辑</Button>
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
    const {tableList, meta, tableLoading, currentPage, editVisible, editLoading, currentItem, paramsSort} = this.state
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
        <div className="pageTitle">系统参数</div>
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 编辑弹框 */}
        <EditModal
          ref="editModal"
          paramsSort={paramsSort}
          item={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />

      </div>
    );
  }
}