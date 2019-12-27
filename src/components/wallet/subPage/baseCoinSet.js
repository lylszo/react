import React, { Component } from 'react'
import { getCoinList, addCoinSwitch, getCoinSwitch, 
         getCoinSetDetail, editCoinSet, addCoinSet, 
         getWalletList, showCoin, exchangeCoinSwitch,
         exchangeCoinRevenue } from '@/axios'
import { Table, Form, Input, Button, Modal, message, Switch, Select, Upload, Icon, Row, Col } from 'antd'
import MyContext from '@/tool/context'

const confirm = Modal.confirm
const Option = Select.Option

function maxVal (rule, value, callback) {
  if (+value > 120) {
    callback('请输入100以内的数字')
  } else {
    callback()
  }
}

// 编辑弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        loading: false, // 上传图片loading
      }
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { loading } = this.state
      let { onOk, onCancel, visible, confirmLoading, item, imgUrl, changeImgUrl } = this.props
      const title = `编辑（币种：${item.coinSymbol}）`
      if (!item.exemption) {
        item.maxExemptionValue = ''
      }

      // 上传logo前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 8}} wrapperCol={{span: 14}} onSubmit={this.handleSubmit} >
            <Form.Item label="logo">
              {getFieldDecorator('logo', {
                initialValue: [{logoKey: item.logoKey, logoUrl: item.logo}],
                rules: [
                  {required: true, message: '请上传币种logo'}
                ],
                valuePropName: 'fileList',
                getValueFromEvent: ({file}) =>{
                  if (file.status === 'uploading') {
                    this.setState({ loading: true });
                  } else if (file.status === 'error') {
                    this.setState({loading: false})
                    message.error(file.response.message)
                  } else if (file.status === 'done') {
                    file.logoKey = file.response.key
                    file.logoUrl = file.response.url
                    changeImgUrl(file.logoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  key={item.id}
                  name="file"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        ((imgUrl || item.logo) && !loading) ?
                        <img alt="加载失败" src={imgUrl || item.logo} width="54" height="54" />
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="钱包类型">
              {getFieldDecorator('chainSymbol', {
                initialValue: item.chainSymbol || '',
                rules: [
                  { required: true, message: '请输入钱包类型' },
                  { max: 64, message: '不能超过64字符' }
                ]
              })(
                <Input placeholder="钱包类型" disabled />
              )}
            </Form.Item>
            <Form.Item label="排序">
              {getFieldDecorator('sort', {
                initialValue: item.sort || '',
                rules: [
                  { required: true, message: '请输入排序' },
                  { pattern: /^\d*$/, message: '请输入数字' },
                  { validator: maxVal }
                ]
              })(
                <Input placeholder="排序" />
              )}
            </Form.Item>
            <Form.Item label="最小充币数量">
              {getFieldDecorator('minRecharge', {
                initialValue: item.minRecharge || '',
                rules: [
                  { required: true, message: '请输入最小充币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小充币数量" />
              )}
            </Form.Item>
            <Form.Item label="最小提币数量">
              {getFieldDecorator('minWithdraw', {
                initialValue: item.minWithdraw || '',
                rules: [
                  { required: true, message: '请输入最小提币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小提币数量" />
              )}
            </Form.Item>
            <Form.Item label="最大提币数量">
              {getFieldDecorator('maxWithdraw', {
                initialValue: item.maxWithdraw || '',
                rules: [
                  { required: true, message: '请输入最大提币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最大提币数量" />
              )}
            </Form.Item>
            <Form.Item label="每日最大提币">
              {getFieldDecorator('dayWithdrawTotal', {
                initialValue: item.dayWithdrawTotal || '',
                rules: [
                  { required: true, message: '请输入每日最大提币' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="每日最大提币" />
              )}
            </Form.Item>
            <Form.Item label="提币费率">
              {getFieldDecorator('withdrawRate', {
                initialValue: item.withdrawRate || '',
                rules: [
                  { required: true, message: '请输入提币费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="提币费率" />
              )}
            </Form.Item>
            <Form.Item label="最小提币手续费">
              {getFieldDecorator('minWithdrawFee', {
                initialValue: item.minWithdrawFee || '',
                rules: [
                  { required: true, message: '请输入最小提币手续费' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小提币手续费" />
              )}
            </Form.Item>
            <Form.Item label="用户转账手续费率">
              {getFieldDecorator('transferAccountsFee', {
                initialValue: item.transferAccountsFee || '',
                rules: [
                  { required: true, message: '请输入用户转账手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="用户转账手续费率" />
              )}
            </Form.Item>
            <Form.Item label="二维码收款手续费率">
              {getFieldDecorator('qrReceivablesFee', {
                initialValue: item.qrReceivablesFee || '',
                rules: [
                  { required: true, message: '请输入二维码收款手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="二维码收款手续费率" />
              )}
            </Form.Item>
            <Form.Item label="二维码付款手续费率">
              {getFieldDecorator('qrPayFee', {
                initialValue: item.qrPayFee || '',
                rules: [
                  { required: true, message: '请输入二维码付款手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="二维码付款手续费率" />
              )}
            </Form.Item>
            <Form.Item label="提币YBT费率">
              {getFieldDecorator('withdrawRateYbt', {
                initialValue: item.withdrawRateYbt || '',
                rules: [
                  { required: true, message: '请输入提币YBT费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="提币YBT费率" />
              )}
            </Form.Item>
            <Form.Item label="最大免审值">
              {getFieldDecorator('exemption', {
                initialValue: !!item.exemption,
                rules: [
                  { required: true, message: '请选择是否设置最大免审值' },
                ],
                valuePropName: 'checked',
                getValueFromEvent: val => {
                  item.exemption = !!val
                  return val
                }
              })(
                <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否" />
              )}
            </Form.Item>
            {
              item.exemption &&
              <Row style={{marginTop: '-20px'}}>
                <Col span={24} offset={8}>
                  <Form.Item>
                    {getFieldDecorator('maxExemptionValue', {
                      initialValue: item.maxExemptionValue || '',
                      rules: [
                        { required: true, message: '请输入最大免审值' },
                        { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                      ]
                    })(
                      <Input placeholder="最大免审值" />
                    )}
                  </Form.Item>                  
                </Col>
              </Row>
            }
          </Form>
        </Modal>
      )
    }
  }
)

// 添加币种弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {
    state = {
      loading: false, // 上传图片loading
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, walletList, imgUrl, changeImgUrl } = this.props
      const { loading } = this.state

      // 上传logo前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      return (
        <Modal
          title='添加币种配置'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 8}} wrapperCol={{span: 14}} onSubmit={this.handleSubmit} >
            <Form.Item label="logo">
              {getFieldDecorator('logo', {
                initialValue: '',
                rules: [
                  {required: true, message: '请上传币种logo'}
                ],
                valuePropName: 'fileList',
                getValueFromEvent: ({file}) =>{
                  if (file.status === 'uploading') {
                    this.setState({ loading: true });
                  } else if (file.status === 'error') {
                    this.setState({loading: false})
                    message.error(file.response.message)
                  } else if (file.status === 'done') {
                    file.logoKey = file.response.key
                    file.logoUrl = file.response.url
                    changeImgUrl(file.logoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  name="file"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        (imgUrl && !loading) ?
                        <img alt="加载失败" src={imgUrl} width="54" height="54" />
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="币种名称">
              {getFieldDecorator('coinSymbol', {
                rules: [
                  {required: true, message: '请填写币种名称'}
                ]
              })(
                <Input placeholder="币种名称" />
              )}
            </Form.Item>
            <Form.Item label="钱包类型">
              {getFieldDecorator('chainSymbol', {
                rules: [
                  {required: true, message: '请选择钱包类型'}
                ]
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="请选择">
                  {
                    walletList.map(item => {
                      return <Option value={item.chainSymbol} key={item.id}>{item.chainSymbol}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="排序">
              {getFieldDecorator('sort', {
                initialValue: '',
                rules: [
                  { required: true, message: '请输入排序' },
                  { pattern: /^\d*$/, message: '请输入数字' },
                  { validator: maxVal }
                ]
              })(
                <Input placeholder="排序" />
              )}
            </Form.Item>
            <Form.Item label="最小充币数量">
              {getFieldDecorator('minRecharge', {
                rules: [
                  { required: true, message: '请输入最小充币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小充币数量" />
              )}
            </Form.Item>
            <Form.Item label="最小提币数量">
              {getFieldDecorator('minWithdraw', {
                rules: [
                  { required: true, message: '请输入最小提币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小提币数量" />
              )}
            </Form.Item>
            <Form.Item label="最大提币数量">
              {getFieldDecorator('maxWithdraw', {
                rules: [
                  { required: true, message: '请输入最大提币数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最大提币数量" />
              )}
            </Form.Item>
            <Form.Item label="每日最大提币">
              {getFieldDecorator('dayWithdrawTotal', {
                rules: [
                  { required: true, message: '请输入每日最大提币' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="每日最大提币" />
              )}
            </Form.Item>
            <Form.Item label="提币费率">
              {getFieldDecorator('withdrawRate', {
                rules: [
                  { required: true, message: '请输入提币费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="提币费率" />
              )}
            </Form.Item>
            <Form.Item label="最小提币手续费">
              {getFieldDecorator('minWithdrawFee', {
                rules: [
                  { required: true, message: '请输入最小提币手续费' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="最小提币手续费" />
              )}
            </Form.Item>
            <Form.Item label="用户转账手续费率">
              {getFieldDecorator('transferAccountsFee', {
                rules: [
                  { required: true, message: '请输入用户转账手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="用户转账手续费率" />
              )}
            </Form.Item>
            <Form.Item label="二维码收款手续费率">
              {getFieldDecorator('qrReceivablesFee', {
                rules: [
                  { required: true, message: '请输入二维码收款手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="二维码收款手续费率" />
              )}
            </Form.Item>
            <Form.Item label="二维码付款手续费率">
              {getFieldDecorator('qrPayFee', {
                rules: [
                  { required: true, message: '请输入二维码付款手续费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="二维码付款手续费率" />
              )}
            </Form.Item>
            <Form.Item label="提币YBT费率">
              {getFieldDecorator('withdrawRateYbt', {
                rules: [
                  { required: true, message: '请输入提币YBT费率' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="提币YBT费率" />
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

  constructor(props) {
    super(props)

    // 状态
    this.state = {
      meta: {}, // 请求列表信息
      currentPage: 1, // 当前页码
      tableLoading: false, // 列表请求loading
      tableList: [], // 列表数据
      walletList: [], // 钱包列表
      addVisible: false, // 是否显示添加弹框
      addLoading: false, // 添加币种配置确认loading
      editVisible: false, // 是否显示编辑弹框
      editLoading: false, // 编辑弹框确认loading
      currentItem: {}, // 当前编辑项
      imgUrl: '', // 添加或者编辑弹框上传图片后的url
    }
  }

  // 获取列表
  getList = (page) => {
    const params = {page: page || 1}
    this.setState({tableLoading: true, currentPage: page})
    getCoinList(params).then(data => {
      this.setState({
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false,
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 修改上传图片url
  changeImgUrl = (url) => {
    this.setState({imgUrl: url})
  }

  // 打开编辑弹框
  edit = (item) => {
    getCoinSetDetail(item.id).then(data => {
      this.setState({currentItem: data.data})
    })
    this.setState({editVisible: true})      
  }

  // 编辑确定
  onOkEdit = () => {
    const { currentItem } = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, flashExchangeFee: 0}
      params.logo = params.logo[0].logoKey
      if (+params.minWithdraw > +params.maxWithdraw) {
        message.warning('最小提币数量不能大于最大提币数量！')
        return
      }
      this.setState({editLoading: true})
      editCoinSet(currentItem.id, params).then(() => {
        this.getList(1)
        this.setState({editLoading: false})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑取消
  onCancelEdit = () => {
    this.setState({editVisible: false, imgUrl: ''})
    this.refs.editModal.resetFields()
  }

  // 添加币种确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, flashExchangeFee: 0}
      params.logo = params.logo[0].logoKey
      if (+params.minWithdraw > +params.maxWithdraw) {
        message.warning('最小提币数量不能大于最大提币数量！')
        return
      }
      this.setState({addLoading: true})
      addCoinSet(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加币种取消
  onCancelAdd = () => {
    this.setState({addVisible: false, imgUrl: ''})
    this.refs.addModal.resetFields()
  }

  // 充提币开关、是否显示币种
  handleSwitch = (item, type) => {
    const {authList} = this.context
    if (!authList.filter(v => +v === 3022).length) {
      message.warning('抱歉，您没有该权限！')
      return
    }
    if (type === 0) { // 充币
      let txt = item.rechargeable ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinSymbol}的充币功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            addCoinSwitch({id: item.id, rechargeable: !item.rechargeable}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.rechargeable = !item.rechargeable
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    } else if (type === 1) { // 提币
      let txt = item.withdrawable ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinSymbol}的提币功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            getCoinSwitch({id: item.id, withdrawable: !item.withdrawable}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.withdrawable = !item.withdrawable
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    } else if (type === 2) { // 是否在展示
      let txt = item.show ? '隐藏' : '展示'
      confirm({
        title: `是否在APP${txt}${item.coinSymbol}？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            showCoin({id: item.id, show: !item.show}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.show = !item.show
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    } else if (type === 3) { // 是否可闪兑
      let txt = item.flashExchange ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinSymbol}的闪兑功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            exchangeCoinSwitch({id: item.id, flashExchange: !item.flashExchange}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.flashExchange = !item.flashExchange
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    } else if (type === 4) { // 是否产生收益
      let txt = item.isRevenue ? '关闭' : '开启'
      confirm({
        title: `是否${txt}${item.coinSymbol}的收益功能？`,
        onOk:() => {
          return new Promise((resolve, reject) => {
            exchangeCoinRevenue({id: item.id, isRevenue: !item.isRevenue}).then(() => {
              let list = [...this.state.tableList]
              list.forEach(v => {
                if (v.id === item.id) {
                  v.isRevenue = !item.isRevenue
                }
              })
              this.setState({tableList: list})
              message.success(`${txt}成功！`)
              resolve()
            }).catch(() => {
              reject()
            })
          })
        }
      })
    }
  }

  // 整理列表项
  getColumns() {
    let columns = [
      {
        title: '币种ID',
        dataIndex: 'id'
      }, {
        title: '币种名称',
        dataIndex: 'coinSymbol',
        render: (text) => (text || '-')
      }, {
        title: '排序',
        dataIndex: 'sort',
        render: (text) => (text || '-')
      }, {
        title: '是否展示',
        render: item => {
          return <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onClick={() => this.handleSwitch(item, 2)}
                  checked={item.show} />
        }
      }, {
        title: '充币开关',
        render: item => {
          return <Switch 
                  checkedChildren="开"
                  unCheckedChildren="关"
                  onClick={() => this.handleSwitch(item, 0)}
                  checked={item.rechargeable} />
        }
      }, {
        title: '提币开关',
        render: item => {
          return <Switch 
                  checkedChildren="开"
                  unCheckedChildren="关"
                  onClick={() => this.handleSwitch(item, 1)}
                  checked={item.withdrawable} />
        }
      }, {
        title: '是否产生收益',
        render: item => {
          return <Switch 
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onClick={() => this.handleSwitch(item, 4)}
                  checked={item.isRevenue} />
        }
      }
    ]

    const {authList} = this.context

    if (authList.filter(v => +v === 3024).length) {
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

    // 获取钱包列表
    getWalletList().then(data => {
      this.setState({walletList: data.data})
    })
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      editVisible,
      editLoading,
      currentItem,
      addVisible,
      addLoading,
      walletList,
      imgUrl,
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
        <div className="clearfix">
          {
            !!authList.filter(v => +v === 3023).length &&
            <div className="fr mb5 ml20">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          }
        </div>
        <Table
          scroll={{x:1200}}
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 编辑弹框 */}
        <EditModal
          ref="editModal"
          item={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          imgUrl={imgUrl}
          changeImgUrl={this.changeImgUrl}
          confirmLoading={editLoading} />

        {/* 添加币种弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          walletList={walletList}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          imgUrl={imgUrl}
          changeImgUrl={this.changeImgUrl}
          confirmLoading={addLoading} />

      </div>
    );
  }
}