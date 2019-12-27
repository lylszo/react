import React, { Component } from 'react'
import { Form, Input, Button, message, Row, Col, Tabs, Radio } from 'antd'
import { 
  getStaticParams,
  getDynamicParams,
  getCommunityParams,
  getNodeParams,
  getCaptainParams,
  getPersonalParams,
  editStaticParams,
  editDynamicParams,
  editCommunityParams,
  editNodeParams,
  editCaptainParams,
  editPersonalParams,
} from '../../axios'
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'

const TabPane = Tabs.TabPane;

// 奖励参数配置表单
const StaticForm = Form.create({ name: 'staticForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {staticParam: values}
          this.setState({submitLoading: true})
          editStaticParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getStaticParams().then(data => {
        this.setState({info: data.data || {}})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '700px', margin: '15px auto'}}>
          <Row>
            <Col span={12} style={{display: 'flex'}}>
              <div className="lh40">存入资产：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('rateUSDT', {
                  initialValue: info.rateUSDT || '',
                  rules: [
                    {required: true, message: '请输入利率分界阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="利率分界阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={12} style={{display: 'flex'}}>
              <div className="lh40 ml5">
                <span>以下</span>
                <span className="ml30">收益率：</span>
              </div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('underRate', {
                  initialValue: info.underRate || '',
                  rules: [
                    {required: true, message: '请输入分界阈值以下利率'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="分界阈值以下利率" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12} style={{display: 'flex'}}>
              <div className="lh40">存入资产：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('rateUSDT', {
                  initialValue: info.rateUSDT || '',
                  rules: [
                    {required: true, message: '请输入利率分界阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="利率分界阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={12} style={{display: 'flex'}}>
              <div className="lh40 ml5">
                <span>以上</span>
                <span className="ml30">收益率：</span>
              </div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('aboveRate', {
                  initialValue: info.aboveRate || '',
                  rules: [
                    {required: true, message: '请输入分界阈值以上利率'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="分界阈值以上利率" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={22} style={{display: 'flex'}}>
              <div className="lh40">享受静态收益及有效用户：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticUSD', {
                  initialValue: info.staticUSD || '',
                  rules: [
                    {required: true, message: '请输入静态收益阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="静态收益阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={2}><div className="lh40 pl5">以上</div></Col>
            <Col span={22} style={{display: 'flex'}}>
              <div className="lh40">享受静态收益和推荐动态收益：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('dynamicUSD', {
                  initialValue: info.dynamicUSD || '',
                  rules: [
                    {required: true, message: '请输入动态收益阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="动态收益阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={2}><div className="lh40 pl5">以上</div></Col>
            <Col span={22} style={{display: 'flex'}}>
              <div className="lh40 tar">智能宝有效用户余额：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('validUSDT', {
                  initialValue: info.validUSDT || '',
                  rules: [
                    {required: true, message: '请输入有效USDT阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="有效USDT阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={2}><div className="lh40 pl5">以上</div></Col>
          </Row>
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

const DynamicForm = Form.create({ name: 'dynamicForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {dynamicParam: values}
          this.setState({submitLoading: true})
          editDynamicParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getDynamicParams().then(data => {
        this.setState({info: data.data || {}})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '98%', margin: '0 auto'}}>
          <Row>
            <Col span={6}>
              <div className="lh40 tac bold">推荐用户</div>
            </Col>
            <Col span={5}>
              <div className="lh40 tac bold">个人业绩</div>
            </Col>
            <Col span={6}>
              <div className="lh40 tac bold">享受福利</div>
            </Col>
            <Col span={7}>
              <div className="lh40 tac bold">平级奖</div>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('firstOne', {
                      initialValue: info.firstOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('firstTwo', {
                      initialValue: info.firstTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">下级</div></Col>
                <Col span={15}>
                  <Form.Item>
                    {getFieldDecorator('firstThree', {
                      initialValue: info.firstThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('firstFour', {
                      initialValue: info.firstFour || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('secondOne', {
                      initialValue: info.secondOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('secondTwo', {
                      initialValue: info.secondTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">上级</div></Col>
                <Col span={15}>
                  <Form.Item>
                    {getFieldDecorator('secondThree', {
                      initialValue: info.secondThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('secondFour', {
                      initialValue: info.secondFour || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="% 加权平分" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('thirdOne', {
                      initialValue: info.thirdOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('thirdTwo', {
                      initialValue: info.thirdTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">上级</div></Col>
                <Col span={15}>
                  <Form.Item>
                    {getFieldDecorator('thirdThree', {
                      initialValue: info.thirdThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('thirdFour', {
                      initialValue: info.thirdFour || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="% 加权平分" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('fourthOne', {
                      initialValue: info.fourthOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('fourthTwo', {
                      initialValue: info.fourthTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">下级</div></Col>
                <Col span={15}>
                  <Form.Item>
                    {getFieldDecorator('fourthThree', {
                      initialValue: info.fourthThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('fourthFour', {
                      initialValue: info.fourthFour || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('fifthOne', {
                      initialValue: info.fifthOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('fifthTwo', {
                      initialValue: info.fifthTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">下级</div></Col>
                <Col span={6}>
                  <Form.Item>
                    {getFieldDecorator('fifthThree', {
                      initialValue: info.fifthThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={3}><div className="lh40 tac pr5">到</div></Col>
                <Col span={6}>
                  <Form.Item>
                    {getFieldDecorator('fifthFour', {
                      initialValue: info.fifthFour || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级"/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('fifthFive', {
                      initialValue: info.fifthFive || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Row>
                <Col span={13}><div className="lh40 tar">推荐有效用户数量：</div></Col>
                <Col span={11}>
                  <Form.Item>
                    {getFieldDecorator('sixthOne', {
                      initialValue: info.sixthOne || '',
                      rules: [
                        {required: true, message: '请输入推荐人数'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="推荐人数" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={5}>
              <Row>
                <Col span={8}><div className="lh40 tar mr5">达到</div></Col>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('sixthTwo', {
                      initialValue: info.sixthTwo || '',
                      rules: [
                        {required: true, message: '请输入个人业绩'},
                        {pattern: /^[\d-]*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="个人业绩" addonAfter="USDT" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row>
                <Col span={7}><div className="lh40 tar pr5">下级</div></Col>
                <Col span={6}>
                  <Form.Item>
                    {getFieldDecorator('sixthThree', {
                      initialValue: info.sixthThree || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={3}><div className="lh40 tac pr5">到</div></Col>
                <Col span={6}>
                  <Form.Item>
                    {getFieldDecorator('sixthFour', {
                      initialValue: info.sixthFour || '',
                      rules: [
                        {required: true, message: '请输入等级'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="等级"/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row>
                <Col span={8}><div className="lh40 tar pr5">代静态收益的</div></Col>
                <Col span={14}>
                  <Form.Item>
                    {getFieldDecorator('sixthFive', {
                      initialValue: info.sixthFive || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

const CommunityForm = Form.create({ name: 'communityForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {}
          let arr = [1,2,3,4,5]
          let arr1 = ['communityRate', 'quantity', 'staticRate']
          let arr2 = ['communityRate', 'recommendNum', 'staticRate']
          arr.forEach((v, i, a) => {
            let idx = i + 1 + ''
            let o = {vipLevel: idx}
            if (i === 0) {
              arr1.forEach(w => {
                o[w] = values[w + idx]
              })
            } else {
              arr2.forEach(w => {
                o[w] = values[w + idx]
              })
            }
            a[i] = o
          })
          params.communityParamList = arr
          params.includeLarge = values.includeLarge || '0'
          this.setState({submitLoading: true})
          editCommunityParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getCommunityParams().then(data => {
        let detail = data.data || {}
        let obj = {}
        let communityObj = {}
        detail.communityParamList.forEach(v => {
          for (let i in v) {
            communityObj[i + v.vipLevel] = v[i]
          }
        })
        obj = {...obj, ...communityObj}
        obj.includeLarge = detail.includeLarge
        this.setState({info: obj})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '94%', margin: '0 auto'}}>
          <Row>
            <Col span={2}>
              <div className="lh40 pl10 bold">等级</div>
            </Col>
            <Col span={7}>
              <div className="lh40 tac bold">条件</div>
            </Col>
            <Col span={7} offset={1}>
              <div className="lh40 tac bold">收益</div>
            </Col>
            <Col span={6} offset={1}>
              <div className="lh40 tac bold">平级奖</div>
            </Col>
          </Row>
          <Row>
            <Col span={2}>
              <div className="lh40">V1社区</div>
            </Col>
            <Col span={7} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">存币高于或等于</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('quantity1', {
                  initialValue: info.quantity1 || '',
                  rules: [
                    {required: true, message: '请输入币值阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="币值阈值" addonAfter="USDT" />
                )}
              </Form.Item>                
            </Col>
            <Col span={7} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下本次结算的静态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticRate1', {
                  initialValue: info.staticRate1 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
            <Col span={6} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">社区动态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('communityRate1', {
                  initialValue: info.communityRate1 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={2}>
              <div className="mt10 mb10">V2社区</div>
            </Col>
            <Col span={7} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下直推V1个数</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('recommendNum2', {
                  initialValue: info.recommendNum2 || '',
                  rules: [
                    {required: true, message: '请输入推荐个数'},
                    {pattern: /^\d*$/, message: '请输入数字'}
                  ]
                })(
                  <Input placeholder="推荐个数" />
                )}
              </Form.Item>
            </Col>
            <Col span={7} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下本次结算的静态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticRate2', {
                  initialValue: info.staticRate2 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
            <Col span={6} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">社区动态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('communityRate2', {
                  initialValue: info.communityRate2 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={2}>
              <div className="mt10 mb10">V3社区</div>
            </Col>
            <Col span={7} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下直推V2个数</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('recommendNum3', {
                  initialValue: info.recommendNum3 || '',
                  rules: [
                    {required: true, message: '请输入推荐个数'},
                    {pattern: /^\d*$/, message: '请输入数字'}
                  ]
                })(
                  <Input placeholder="推荐个数" />
                )}
              </Form.Item>
            </Col>
            <Col span={7} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下本次结算的静态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticRate3', {
                  initialValue: info.staticRate3 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
            <Col span={6} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">社区动态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('communityRate3', {
                  initialValue: info.communityRate3 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={2}>
              <div className="mt10 mb10">V4社区</div>
            </Col>
            <Col span={7} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下直推V3个数</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('recommendNum4', {
                  initialValue: info.recommendNum4 || '',
                  rules: [
                    {required: true, message: '请输入推荐个数'},
                    {pattern: /^\d*$/, message: '请输入数字'}
                  ]
                })(
                  <Input placeholder="推荐个数" />
                )}
              </Form.Item>
            </Col>
            <Col span={7} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下本次结算的静态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticRate4', {
                  initialValue: info.staticRate4 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
            <Col span={6} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">社区动态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('communityRate4', {
                  initialValue: info.communityRate4 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={2}>
              <div className="mt10 mb10">V5社区</div>
            </Col>
            <Col span={7} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">伞下直推V4个数</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('recommendNum5', {
                  initialValue: info.recommendNum5 || '',
                  rules: [
                    {required: true, message: '请输入推荐个数'},
                    {pattern: /^\d*$/, message: '请输入数字'}
                  ]
                })(
                  <Input placeholder="推荐个数" />
                )}
              </Form.Item>
            </Col>
            <Col span={7} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">全平台静态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('staticRate5', {
                  initialValue: info.staticRate5 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
            <Col span={6} offset={1} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">社区动态收益的</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('communityRate5', {
                  initialValue: info.communityRate5 || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          {
            false &&
            <div style={{display: 'flex'}}>
              <div className="mr20 lh40">是否包含LARGE智能宝业绩：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('includeLarge', {
                  initialValue: info.includeLarge,
                  rules: [
                    {required: true, message: '请选择是否包含LARGE智能宝业绩'}
                  ]
                })(
                  <Radio.Group>
                    <Radio value="1">包含</Radio>
                    <Radio value="0" className="ml30">不包含</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </div>
          }
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

const NodeForm = Form.create({ name: 'nodeForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {nodeParam: values}
          this.setState({submitLoading: true})
          editNodeParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getNodeParams().then(data => {
        this.setState({info: data.data || {}})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '600px', margin: '15px auto'}}>
          <Row>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">普通节点</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('commonNodeRate', {
                  initialValue: info.commonNodeRate || '',
                  rules: [
                    {required: true, message: '请输入普通节点比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="普通节点比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40 tar pr5">超级节点</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('superNodeRate', {
                  initialValue: info.superNodeRate || '',
                  rules: [
                    {required: true, message: '请输入超级节点比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="超级节点比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Row>
                <Col span={14} style={{display: 'flex'}}>
                  <div className="lh40 pr5">赠送YBT第 1 月到第</div>
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('firstEndMonth', {
                      initialValue: info.firstEndMonth || '',
                      rules: [
                        {required: true, message: '请输入月份'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="月份" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={10} style={{display: 'flex'}}>
                  <div className="lh40 pr5 pl5">月释放比例为：</div>
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('firstRate', {
                      initialValue: info.firstRate || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={7} style={{display: 'flex'}}>
                  <div className="lh40 pr5">赠送第</div>
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('secondStartMonth', {
                      initialValue: info.secondStartMonth || '',
                      rules: [
                        {required: true, message: '请输入月份'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="月份" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={7} style={{display: 'flex'}}>
                  <div className="lh40 pr5 pl5">月到</div>
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('secondEndMonth', {
                      initialValue: info.secondEndMonth || '',
                      rules: [
                        {required: true, message: '请输入月份'},
                        {pattern: /^\d*$/, message: '请输入数字'}
                      ]
                    })(
                      <Input placeholder="月份" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={10} style={{display: 'flex'}}>
                  <div className="lh40 pr5 pl5">月释放比例为：</div>
                  <Form.Item style={{flex: '1 1'}}>
                    {getFieldDecorator('secondRate', {
                      initialValue: info.secondRate || '',
                      rules: [
                        {required: true, message: '请输入比例'},
                        {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                      ]
                    })(
                      <Input placeholder="比例" addonAfter="%" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

const CaptainForm = Form.create({ name: 'captainForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {captainParam: values}
          this.setState({submitLoading: true})
          editCaptainParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getCaptainParams().then(data => {
        this.setState({info: data.data || {}})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '500px', margin: '15px auto'}}>
          <Row>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40">团队长默认智能宝存款基数：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('conditionQuantity', {
                  initialValue: info.conditionQuantity || '',
                  rules: [
                    {required: true, message: '请输入达成条件数量'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="达成条件数量" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40">默认释放团队奖励：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('awardQuantity', {
                  initialValue: info.awardQuantity || '',
                  rules: [
                    {required: true, message: '请输入授予数量'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="授予数量" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40">团队有效用户额度（大于或等于）： </div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('validThreshold', {
                  initialValue: info.validThreshold || '',
                  rules: [
                    {required: true, message: '请输入有效USDT阈值'},
                    {pattern: /^[0-9]*(\.[0-9]{0,8})?$/, message: '请输入数字，支持8位小数'}
                  ]
                })(
                  <Input placeholder="有效USDT阈值" addonAfter="USDT" />
                )}
              </Form.Item>
            </Col>
          </Row>
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

const PersonalForm = Form.create({ name: 'personalForm' })(withRouter(
  class extends Component {
    // 状态
    state = {
      submitLoading: false, // 提交按钮loading
      info: {}, // 当前奖金详情
    }

    // 提交表单
    handleSubmit = () => {
      this.props.form.validateFields((err, values) => {
        if (err) {
          message.info('请按提示输入正确的数据！')
        } else {
          let params = {personalparam: values}
          this.setState({submitLoading: true})
          editPersonalParams(params).then(() => {
            this.setState({submitLoading: false})
            message.success('保存成功！')
          }).catch(() => {
            this.setState({submitLoading: false})
          })
        }
      });
    }

    // 首次渲染后
    componentWillMount() {
      getPersonalParams().then(data => {
        this.setState({info: data.data || {}})
      })
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { submitLoading, info } = this.state
      const { authList } = this.props
      return (
        <Form style={{width: '500px', margin: '15px auto'}}>
          <Row>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40">释放时间：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('releaseDay', {
                  initialValue: info.releaseDay || '',
                  rules: [
                    {required: true, message: '请输入月份'},
                    {pattern: /^\d*$/, message: '请输入数字'}
                  ]
                })(
                  <Input placeholder="月份" addonBefore="每月" addonAfter="日"/>
                )}
              </Form.Item>
            </Col>
            <Col span={24} style={{display: 'flex'}}>
              <div className="lh40">释放业绩奖励比例：</div>
              <Form.Item style={{flex: '1 1'}}>
                {getFieldDecorator('everyMonthRate', {
                  initialValue: info.everyMonthRate || '',
                  rules: [
                    {required: true, message: '请输入比例'},
                    {pattern: /^[0-9]*(\.[0-9]{0,2})?$/, message: '请输入数字，支持2位小数'}
                  ]
                })(
                  <Input placeholder="比例" addonAfter="%" />
                )}
              </Form.Item>
            </Col>
          </Row>
          {
            !!authList.filter(v => +v === 6006).length &&
            <div className="tac">
              <Button size="large" className="mt40" style={{width: '150px'}} onClick={this.handleSubmit} type="primary" loading={submitLoading}>保存</Button>
            </div>
          }
        </Form>
      )
    }
  }
))

export default class extends Component {
  static contextType = MyContext

  state = {
    tabKey: {}
  }

  // 切换标签
  changeTab = (activeKey) => {
    let o = {...this.state.tabKey}
    o[`tab${activeKey}`] = (o[`tab${activeKey}`] || 0) + 1
    this.setState({tabKey: o})
  }

  // 渲染
  render() {
    const {tabKey} = this.state
    const {authList} = this.context

    return (
      <Tabs className="pageTab" onChange={this.changeTab}>
        <TabPane tab="1.静态收益" key="1"><StaticForm key={tabKey.tab1} authList={authList} /></TabPane>
        <TabPane tab="2.动态收益" key="2"><DynamicForm key={tabKey.tab2}  authList={authList} /></TabPane>
        <TabPane tab="3.社区动态收益" key="3"><CommunityForm key={tabKey.tab3} authList={authList} /></TabPane>
        <TabPane tab="4.节点收益" key="4"><NodeForm key={tabKey.tab4} authList={authList} /></TabPane>
        <TabPane tab="5.团队长收益" key="5"><CaptainForm key={tabKey.tab5} authList={authList} /></TabPane>
        <TabPane tab="6.额外收益" key="6"><PersonalForm key={tabKey.tab6} authList={authList} /></TabPane>
      </Tabs>
    );
  }
}