import React, { Component } from 'react'
import { 
  getUserDetail,
  resetUserPhone,
  resetUserPwd,
  resetUserEmail,
  userAssetSet,
  userNodeSet,
  setUserGrade,
  lockUserAsset,
  resetGrade,
  delUserGoogle,
  userClrEdit,
  userClrList,
} from '@/axios'
import { Button, Tabs, Form, Input, Select, Modal, message } from 'antd'
import MyContext from '@/tool/context'
import countryList from '@/assets/js/country'
import Asset from './subPage/asset'
import Smart from './subPage/smart'
import AddCoin from './subPage/addCoin'
import GetCoin from './subPage/getCoin'
import avatarUrl from '@/assets/img/avatar.jpg'
import moment from 'moment'
import { f_nodeLevel, f_encodeId } from '@/tool/filter'
import './userDetail.scss'


const TabPane = Tabs.TabPane
const Option = Select.Option
const { TextArea } = Input
const confirm = Modal.confirm

// 重置手机号弹框
const ResetPhoneModal = Form.create({ name: 'resetPhoneModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, areaChange } = this.props
      const title = '重置手机号'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="新手机号">
              <Select
                showSearch
                style={{ width: '100%'}}
                defaultValue="86"
                onChange={areaChange}
                optionFilterProp="children"
                filterOption={(input, option) => (option.props.children[0].indexOf(input) >= 0)}>
                {
                  countryList.map((item, index) => (
                    <Option value={item.n} key={index}>{item.c}（+{item.n}）</Option>
                  ))
                }
              </Select>
              {getFieldDecorator('number', {
                rules: [
                  { required: true, message: '请输入新手机号' },
                  { pattern: /^[+\d]*$/, message: '请输入正确的手机号' }
                ]
              })(
                <Input placeholder="请输入新手机号" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 重置邮箱弹框
const ResetEmailModal = Form.create({ name: 'resetEmailModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      const title = '重置邮箱'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="新邮箱">
              {getFieldDecorator('emailAddress', {
                rules: [
                  { required: true, message: '请输入新邮箱地址' }
                ]
              })(
                <Input placeholder="请输入新邮箱地址" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 重置密码弹框
const ResetPwdModal = Form.create({ name: 'resetPwdModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      const title = '重置密码'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 4}} wrapperCol={{span: 19}} onSubmit={this.handleSubmit} >
            <Form.Item label="新密码">
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: '请填写新密码' },
                  { pattern: /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,16}$/, message: '密码为8-16位，且至少包含字母、数字、特殊字符的两种' }
                ]
              })(
                <Input type="password" placeholder="密码" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑动态收益率弹框
const ClrModal = Form.create({ name: 'clrModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, clrInfo } = this.props
      const title = '动态收益率'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 8}} wrapperCol={{span: 13}} onSubmit={this.handleSubmit} >
            <Form.Item label="推荐动态收益率">
              {getFieldDecorator('recommend', {
                initialValue: clrInfo.recommend || '',
                rules: [
                  { required: true, message: '请输入推荐动态收益率' },
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="请输入推荐动态收益率" addonAfter="%"/>
              )}
            </Form.Item>
            <Form.Item label="社区动态收益率">
              {getFieldDecorator('community', {
                initialValue: clrInfo.community || '',
                rules: [
                  { required: true, message: '请输入社区动态收益率' },
                  {pattern: /^[0-9]*(\.[0-9]{0,4})?$/, message: '请输入数字，支持4位小数'}
                ]
              })(
                <Input placeholder="请输入社区动态收益率" addonAfter="%"/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 资产配置弹框
const AssetModal = Form.create({ name: 'assetModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading } = this.props
      const title = '资产配置'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="操作类型">
              {getFieldDecorator('operator', {
                initialValue: '1',
                rules: [
                  { required: true, message: '请选择操作类型' }
                ]
              })(
                <Select>
                  <Option value="1" key="1">增加</Option>
                  <Option value="2" key="2">扣除</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="资产类型">
              {getFieldDecorator('assetType', {
                initialValue: '2',
                rules: [
                  { required: true, message: '请选择资产类型' }
                ]
              })(
                <Select>
                  <Option value="2" key="2">USD 冻结钱包</Option>
                  <Option value="1" key="1">YBT 可用余额</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="数量">
              {getFieldDecorator('amount', {
                rules: [
                  { required: true, message: '请填写数量' },
                  { pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数' }
                ]
              })(
                <Input placeholder="数量" />
              )}
            </Form.Item>
            <Form.Item label="备注">
              {getFieldDecorator('remark')(
                <TextArea rows={4}  placeholder="100字以内" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 设置节点弹框
const NodeModal = Form.create({ name: 'nodeModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, item } = this.props
      const title = '设置节点'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="节点类型">
              {getFieldDecorator('level', {
                initialValue: +item.nodeLevel || 0,
                rules: [
                  { required: true, message: '请选择节点类型' }
                ]
              })(
                <Select>
                  <Option value={0}>非节点</Option>
                  <Option value={1}>普通节点</Option>
                  <Option value={2}>超级节点</Option>
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 设置等级弹框
const GradeModal = Form.create({ name: 'gradeModal' })(
  class extends Component {
    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, visible, onCancel, confirmLoading, item, type, changeGradeType } = this.props
      const title = '设置等级'
      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 5}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="类别">
              {getFieldDecorator('type', {
                initialValue: type,
                getValueFromEvent: val => {
                  changeGradeType(val)
                  return val
                },
                rules: [
                  { required: true, message: '请选择等级' }
                ]
              })(
                <Select>
                  <Option value={1}>修改等级</Option>
                  {item.isGradeModified && <Option value={2}>重置等级</Option>}
                </Select>
              )}
            </Form.Item>
            { 
              type === 1 &&
              <Form.Item label="等级">
                {getFieldDecorator('grade', {
                  initialValue: +item.grade || 0,
                  rules: [
                    { required: true, message: '请选择等级' }
                  ]
                })(
                  <Select>
                    <Option value={0}>V0</Option>
                    <Option value={1}>V1</Option>
                    <Option value={2}>V2</Option>
                    <Option value={3}>V3</Option>
                    <Option value={4}>V4</Option>
                  </Select>
                )}
              </Form.Item>
            }
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

    const id = this.props.location.state ? this.props.location.state.id : 0
    
    this.state = {
      id, // 当前用户ID
      info: {}, // 当前用户信息对象
      phoneVisible: false, // 是否显示重置手机弹框
      phoneLoading: false, // 重置手机确认loading
      areaNum: 86, // 手机区号
      pwdVisible: false, // 是否显示重置密码弹框
      pwdLoading: false, // 重置密码确认loading
      assetVisible: false, // 是否显示资产配置弹框
      assetLoading: false, // 资产配置确定loading
      nodeVisible: false, // 是否显示配置节点弹框
      nodeLoading: false, // 配置节点确定loading
      gradeVisible: false, // 是否显示配置等级弹框
      gradeLoading: false, // 配置等级确定loading
      emailVisible: false, // 是否显示重置邮箱弹框
      emailLoading: false, // 重置邮箱确认loading
      clrVisible: false, // 是否显示动态收益配置弹框
      clrLoading: false, // 动态收益配置确认loading
      tabKey: {}, // 各个标签页key值对象
      setGradeType: 1, // 设置等级的类型
      clrInfo: {}, // 动态收益信息
    }
  }

  // 打开重置手机弹框
  handleResetPhone = () => {
    this.setState({phoneVisible: true})
  } 
  
  // 关闭重置手机弹框
  onCancelPhone = () => {
    this.setState({phoneVisible: false})
    this.refs.resetPhoneModal.resetFields()
  }
  
  // 重置手机确定
  onOkPhone = () => {
    this.refs.resetPhoneModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        number: `+${this.state.areaNum}${values.number}`,
        id: this.state.id
      }
      this.setState({phoneLoading: true})
      resetUserPhone(params).then(() => {
        const {info} = this.state
        this.setState({info: {...info, phoneNumber: params.number}})
        message.success('重置手机成功！')
        this.onCancelPhone()
        this.setState({phoneLoading: false})
      }).catch(() => {
        this.setState({phoneLoading: false})
      })
    })
  }

  // 打开重置邮箱弹框
  handleResetEmail = () => {
    this.setState({emailVisible: true})
  } 
  
  // 关闭重置邮箱弹框
  onCancelEmail = () => {
    this.setState({emailVisible: false})
    this.refs.resetEmailModal.resetFields()
  }
  
  // 重置邮箱确定
  onOkEmail = () => {
    this.refs.resetEmailModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ...values,
        id: this.state.id
      }
      this.setState({emailLoading: true})
      resetUserEmail(params).then(() => {
        const {info} = this.state
        this.setState({info: {...info, emailAddress: params.emailAddress}})
        message.success('重置邮箱成功！')
        this.onCancelEmail()
        this.setState({emailLoading: false})
      }).catch(() => {
        this.setState({emailLoading: false})
      })
    })
  }

  // 手机区号变化
  areaChange = (val) => {
    this.setState({areaNum: val})
  }

  // 打开重置密码弹框
  handleResetPwd = () => {
    this.setState({pwdVisible: true})
  }

  // 关闭重置密码弹框
  onCancelPwd = () => {
    this.setState({pwdVisible: false})
    this.refs.resetPwdModal.resetFields()
  }

  // 重置密码确定
  onOkPwd = () => {
    this.refs.resetPwdModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ...values,
        id: this.state.id
      }
      this.setState({pwdLoading: true})
      resetUserPwd(params).then(() => {
        message.success('重置密码成功！')
        this.onCancelPwd()
        this.setState({pwdLoading: false})
      }).catch(() => {
        this.setState({pwdLoading: false})
      })
    })
  }

  // 打开编辑动态收益率弹框
  handleClr = () => {
    this.setState({clrVisible: true})
  } 
  
  // 关闭编辑动态收益率弹框
  onCancelClr = () => {
    this.setState({clrVisible: false})
    this.refs.clrModal.resetFields()
  }
  
  // 编辑动态收益率确定
  onOkClr = () => {
    this.refs.clrModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        items: [
          {
            memberId: this.state.id,
            revenueType: 2,
            ratoi: values.recommend
          },
          {
            memberId: this.state.id,
            revenueType: 3,
            ratoi: values.community
          }
        ]
      }
      this.setState({clrLoading: true})
      userClrEdit(params).then(() => {
        this.setState({clrInfo: {...values}})
        message.success('编辑成功！')
        this.onCancelClr()
        this.setState({clrLoading: false})
      }).catch(() => {
        this.setState({clrLoading: false})
      })
    })
  }

  // 打开资产配置弹框
  handleAsset = () => {
    this.setState({assetVisible: true})
  }

  // 关闭资产配置弹框
  onCancelAsset = () => {
    this.setState({assetVisible: false})
    this.refs.assetModal.resetFields()
  }

  // 资产配置确定
  onOkAsset = () => {
    this.refs.assetModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ...values,
        userId: this.state.id
      }
      this.setState({assetLoading: true})
      userAssetSet(params).then(() => {
        message.success('资产配置成功！')
        this.onCancelAsset()
        let o = {...this.state.tabKey}
        o.tab1 = +o.tab1 + 1
        this.setState({assetLoading: false, tabKey: o})
      }).catch(() => {
        this.setState({assetLoading: false})
      })
    })
  }

  // 打开设置节点弹框
  handleNode = () => {
    this.setState({nodeVisible: true})
  }

  // 关闭设置节点弹框
  onCancelNode = () => {
    this.setState({nodeVisible: false})
    this.refs.nodeModal.resetFields()
  }

  // 设置节点确定
  onOkNode = () => {
    this.refs.nodeModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {
        ...values,
        id: this.state.id
      }
      this.setState({nodeLoading: true})
      userNodeSet(params).then(() => {
        let newInfo = Object.assign({}, this.state.info, {nodeLevel: params.level})
        this.setState({info: newInfo, nodeLoading: false})
        message.success('设置节点成功！')
        this.onCancelNode()
      }).catch(() => {
        this.setState({nodeLoading: false})
      })
    })
  }

  // 打开设置等级弹框
  handleGrade = () => {
    this.setState({gradeVisible: true})
  }

  // 关闭设置等级弹框
  onCancelGrade = () => {
    this.setState({gradeVisible: false})
    this.refs.gradeModal.resetFields()
    this.changeGradeType(1)
  }

  // 设置等级确定
  onOkGrade = () => {
    const {id} = this.state
    this.refs.gradeModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {id}
      if (values.type === 1) {
        params.grade = values.grade
        this.setState({gradeLoading: true})
        setUserGrade(params).then(() => {
          let newInfo = {...this.state.info, grade: params.grade, isGradeModified: true}
          this.setState({info: newInfo, gradeLoading: false})
          message.success('修改等级成功！')
          this.onCancelGrade()
        }).catch(() => {
          this.setState({gradeLoading: false})
        })
      } else {
        resetGrade(params.id).then(() => {
          let newInfo = {...this.state.info, isGradeModified: false, gradeModifiedEver: true}
          this.setState({info: newInfo, gradeLoading: false})
          message.success('重置等级成功！')
          this.onCancelGrade()
        }).catch(() => {
          this.setState({gradeLoading: false})
        })
      }
    })
  }

  // 解绑谷歌验证
  handleGoogle = () => {
    const { info } = this.state
    confirm({
      title: `确定解绑当前用户谷歌验证吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          delUserGoogle(info.accountId).then(() => {
            let o = {...info, bindGoogle: false}
            this.setState({info: o})
            message.success(`已解绑！`)
            resolve()
          }).catch(() => {
            reject()
          })       
        })

      }
    })
  }

  // 当修改等级类型改变的时候
  changeGradeType = type => {
    this.setState({setGradeType: type})
  }

  // 锁定/解锁用户资产确认弹框
  lockAsset = () => {
    const { info } = this.state
    const setLock = info.lockedAsset ? false : true
    const txt = setLock ? '锁定' : '解锁'
    confirm({
      title: `确定${txt}当前用户的资产吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          lockUserAsset({userId: info.accountId, isLockedAsset: setLock}).then(() => {
            let o = {...info, lockedAsset: setLock}
            this.setState({info: o})
            message.success(`已${txt}！`)
            resolve()
          }).catch(() => {
            reject()
          })       
        })

      }
    })
  }

  // 切换标签
  changeTab = (activeKey) => {
    let o = {...this.state.tabKey}
    o[`tab${activeKey}`] = (o[`tab${activeKey}`] || 0) + 1
    this.setState({tabKey: o})
  }

  // 释放明细
  toRelease = () => {
    this.props.history.push({
      pathname: '/releaseList',
      state: {
        userId: f_encodeId(this.state.id)
      }
    })
  }

  // 资金流水
  toBalance = () => {
    this.props.history.push({
      pathname: '/assetRecord',
      state: {
        userId: f_encodeId(this.state.id)
      }
    })
  }

  // 渲染前
  componentWillMount() {
    getUserDetail(this.state.id).then(data => {
      this.setState({info: data.data.basicInfo || {}})
    })

    userClrList({memberId: this.state.id}).then(data => {
      let list = (data && data.data && data.data.items) ? data.data.items : []
      if (list.length) {
        let o = {}
        list.forEach(v => {
          if(+v.revenueType === 2) {
            o.recommend = v.ratoi
          } else if (+v.revenueType === 3) {
            o.community = v.ratoi
          }
        })
       this.setState({clrInfo: o})
      }
    })
  }

  // 渲染
  render() {
    const {
      id,
      info,
      phoneVisible,
      phoneLoading,
      pwdVisible,
      pwdLoading,
      assetVisible,
      assetLoading,
      nodeVisible,
      nodeLoading,
      gradeVisible,
      gradeLoading,
      tabKey,
      setGradeType,
      emailVisible,
      emailLoading,
      clrVisible,
      clrLoading,
      clrInfo,
    } = this.state
    const {authList} = this.context

    return (
      <div className="pro-userDetail">
        <div className="pageTitle">用户详情</div>
        <div className="info">
          <table>
            <tbody>
              <tr>
                <td className="avatar">
                  <div className="box">
                    <div className="content">
                      <img width="100%" height="100%" alt="加载失败" src={info.headPortrait || avatarUrl} />
                    </div>
                    <div className="title">个人头像</div>
                  </div>
                </td>
                <td>
                  <p>用户ID： {f_encodeId(info.accountId)}</p>
                  <p>姓名： {info.realName || '-'}</p>
                  <p>身份证号码： {info.idNumber || '-'}</p>
                  <p>手机号码： {info.phoneNumber || '-'}</p>
                  <p>邮箱： {info.emailAddress || '-'}</p>
                  <p>状态： {info.isBlocked ? '锁定' : '正常'}</p>
                  <p>注册时间： {info.createdAt ? moment(info.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
                  <p>会员等级： V{info.grade}{info.isGradeModified ? '（已修改）' : (info.gradeModifiedEver ? '（曾经改过）' : '')}</p>
                  <p>节点等级： {f_nodeLevel[info.nodeLevel]}</p>
                  <p>邀请码： {info.promotionCode || '-'}</p>
                  <p>团队人数： {info.peopleNum || 0} 人</p>
                  <p>备注： {info.mark || '-'}</p>
                </td>
                <td>
                  <p>是否有效用户： {info.isEffective ? '是' : '否'}</p>
                  <p>资产状态： {info.lockedAsset ? '锁定' : '正常'}</p>
                  <p>上级ID： {info.superiorId ? f_encodeId(info.superiorId) : '-'}</p>
                  <p>上级手机号码： {info.superiorPhone || '-'}</p>
                  <p>上级邮箱： {info.parentEmailAddress || '-'}</p>
                  <p>AI智能宝业绩： {info.smartRevenue || '-'} USDT</p>
                  <p>LARGE智能宝业绩： {info.largeSmartBalance || '-'} USDT</p>
                  <p>AI智能宝团队业绩： {info.teamSmartRevenue || '-'} USDT</p>
                  <p>LARGE智能宝团队业绩： {info.teamLargeSmartBalance || '-'} USDT</p>
                  <p>推荐动态收益率： {clrInfo.recommend ? `${clrInfo.recommend}%` : '-'}</p>
                  <p>社区动态收益率： {clrInfo.community ? `${clrInfo.community}%` : '-'}</p>
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan="2">
                  {
                    !!authList.filter(v => +v === 2007).length &&
                    <Button type="primary" onClick={this.handleResetPhone}>重置手机号</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2007).length &&
                    <Button type="primary" onClick={this.handleResetEmail}>重置邮箱</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2007).length &&
                    <Button type="primary" onClick={this.handleResetPwd}>重置密码</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2029).length && info.bindGoogle &&
                    <Button type="primary" onClick={this.handleGoogle}>解绑谷歌验证</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2037).length &&
                    <Button type="primary" onClick={this.handleClr}>动态收益率</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2009).length &&
                    <Button type="primary" onClick={this.handleAsset}>资产配置</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2010).length &&
                    <Button type="primary" onClick={this.handleNode}>设置节点</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2014).length && 
                    <Button type="primary" onClick={this.handleGrade}>设置等级</Button>
                  }
                  {
                    !!authList.filter(v => +v === 2015).length &&
                    <Button type="primary" onClick={this.lockAsset}>{info.lockedAsset ? '解锁资产' : '锁定资产'}</Button>
                  }
                  {
                    !!authList.filter(v => +v === 5014).length &&
                    <Button type="primary" onClick={this.toRelease}>释放明细</Button>
                  }
                  {
                    !!authList.filter(v => +v === 4004).length &&
                    <Button type="primary" onClick={this.toBalance}>资金流水</Button>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="list">
          <Tabs defaultActiveKey="1" onChange={this.changeTab}>
            <TabPane tab="个人资产" key="1">
              <Asset id={id} key={tabKey.tab1} />
            </TabPane>
            <TabPane tab="智能宝资产" key="2">
              <Smart id={id} key={tabKey.tab2} />
            </TabPane>
            <TabPane tab="提币记录" key="3">
              <GetCoin id={id} key={tabKey.tab3} />
            </TabPane>
            <TabPane tab="充币记录" key="4">
              <AddCoin id={id} key={tabKey.tab4} />
            </TabPane>
          </Tabs>          
        </div>
        
        {/* 重置手机弹框 */}
        <ResetPhoneModal
          ref="resetPhoneModal"
          onOk={this.onOkPhone}
          onCancel={this.onCancelPhone}
          visible={phoneVisible}
          confirmLoading={phoneLoading}
          areaChange={this.areaChange} />
        
        {/* 重置邮箱弹框 */}
        <ResetEmailModal
          ref="resetEmailModal"
          onOk={this.onOkEmail}
          onCancel={this.onCancelEmail}
          visible={emailVisible}
          confirmLoading={emailLoading} />
      
        {/* 重置密码弹框 */}
        <ResetPwdModal
          ref="resetPwdModal"
          onOk={this.onOkPwd}
          onCancel={this.onCancelPwd}
          visible={pwdVisible}
          confirmLoading={pwdLoading} />
        
        {/* 动态收益配置弹框 */}
        <ClrModal
          ref="clrModal"
          clrInfo={clrInfo}
          onOk={this.onOkClr}
          onCancel={this.onCancelClr}
          visible={clrVisible}
          confirmLoading={clrLoading} />
      
        {/* 资产配置弹框 */}
        <AssetModal
          ref="assetModal"
          onOk={this.onOkAsset}
          onCancel={this.onCancelAsset}
          visible={assetVisible}
          confirmLoading={assetLoading} />
      
        {/* 设置节点弹框 */}
        <NodeModal
          ref="nodeModal"
          onOk={this.onOkNode}
          onCancel={this.onCancelNode}
          visible={nodeVisible}
          confirmLoading={nodeLoading}
          item={info} />
      
        {/* 设置等级弹框 */}
        <GradeModal
          ref="gradeModal"
          type={setGradeType}
          changeGradeType={this.changeGradeType}
          onOk={this.onOkGrade}
          onCancel={this.onCancelGrade}
          visible={gradeVisible}
          confirmLoading={gradeLoading}
          item={info} />

      </div>
    );
  }
}