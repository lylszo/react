import React, { Component } from 'react'
import { f_encodeId, f_globalCardCertificate } from '@/tool/filter'
import { gcDetail, gcLimit, getUserDetail } from "@/axios";
import GlobalCardBuyRecord from './globalCardBuyRecord'
import moment from 'moment'

export default class extends Component {

  constructor(props) {
    super(props)

    const info = this.props.location.state ? this.props.location.state.item : {}
    
    this.state = {
      info, // 传入的用户信息
      userInfo: {}, // 当前用户详情
      cardDetail: {}, // 当前全球卡详情
      cardLimit: {}, // 当前全球卡详情
      userDetail: {}, // 当前用户详情
    }
  }

  // 渲染前
  componentWillMount() {
    const { info } = this.state
    gcDetail({cardNo: info.cardNo}).then(data => {
      this.setState({cardDetail: data.data})
    })
    gcLimit({cardNo: info.cardNo}).then(data => {
      this.setState({cardLimit: data.data})
    })
    getUserDetail(info.accountId).then(data => {
      this.setState({userDetail: data.data.basicInfo})
    })
  }

  // 渲染
  render() {
    const {
      info,
      userDetail,
      cardLimit,
      cardDetail,
    } = this.state

    return (
      <div className="pro-userDetail">
        <div className="pageTitle">用户详情</div>
        <div style={{border: '1px dashed gray', borderRadius: '5px', padding: '20px 20px 5px'}}>
          <table style={{width: '100%', marginLeft: '1%'}}>
            <tbody>
              <tr className="fs15">
                <th className="pb10">基本信息</th>
                <th className="pb10">YouBank全球付卡信息</th>
                <th className="pb10">实名认证信息</th>
              </tr>
              <tr className="vat">
                <td>
                  <p>用户ID： {+userDetail.accountId ? f_encodeId(userDetail.accountId) : '-'}</p>
                  <p>手机号码： {userDetail.phoneNumber || '-'}</p>
                  <p>邮箱： {userDetail.emailAddress || '-'}</p>
                  <p>注册时间： {userDetail.createdAt ? moment(userDetail.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</p>
                </td>
                <td>
                  <p>姓名： {info.name || '-'}</p>
                  <p>详细地址： {info.addr || '-'}</p>
                  <p>手机号： {info.cardPhoneNumber || '-'}</p>
                  <p>全球卡号： {info.cardNo || '-'}</p>
                  <p>客户编号： {info.custNo || '-'}</p>
                  <p>余额限额： {cardLimit.balanceQuota || '-'} {cardLimit.currencyType === 'USD' ? '美元' : ''}</p>
                  <p>有效期至： {cardDetail.expireDate ? moment(cardDetail.expireDate).format('YYYY-MM-DD') : '-'}</p>
                  <p>日消费限额： {cardLimit.costDayQuota || '-'} {cardLimit.currencyType === 'USD' ? '美元' : ''}</p>
                  <p>年消费限额： {cardLimit.costYearQuota || '-'} {cardLimit.currencyType === 'USD' ? '美元' : ''}</p>
                  <p>当前可用余额： {cardLimit.balanceAvail || '-'} {cardLimit.currencyType === 'USD' ? '美元' : ''}</p>
                </td>
                <td>
                  <p>证件类型： {f_globalCardCertificate[cardDetail.certType] || '-'}</p>
                  <p>证件号码： {cardDetail.certId || '-'}</p>
                  <p>真实姓名： {cardDetail.custName || '-'}</p>
                  <p>英文姓名： {cardDetail.custNameEn || '-'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="fs18 bold mt30 mb15">消费记录</div>
        <GlobalCardBuyRecord info={info} />
      </div>
    );
  }
}