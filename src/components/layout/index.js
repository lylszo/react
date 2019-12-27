import React, { Component, lazy, Suspense } from 'react'
import { Route, Switch, Redirect } from "react-router-dom"
import { setAuthHeader } from '@/axios/http'
import { getInfo } from '@/axios'
import MyContext from '@/tool/context'
import { Spin } from 'antd'
import './index.scss'

// 侧栏
import Topbar from './topbar'
import LeftBar from './leftbar'

// 首页
const Home = lazy(() => import(/* webpackChunkName: 'home' */ '../home'))
// 账户
const Account = lazy(() => import(/* webpackChunkName: 'account' */ '../account'))
// 统计管理
const AssetStatistic = lazy(() => import(/* webpackChunkName: 'statistic' */ '../statistic/assetStatistic'))
const CoinStatistic = lazy(() => import(/* webpackChunkName: 'statistic' */ '../statistic/coinStatistic'))
const UserStatistic = lazy(() => import(/* webpackChunkName: 'statistic' */ '../statistic/userStatistic'))
// 用户管理
const UserList = lazy(() => import(/* webpackChunkName: 'user' */ '../user/userList'))
const UserDetail = lazy(() => import(/* webpackChunkName: 'user' */ '../user/userDetail'))
const TeamList = lazy(() => import(/* webpackChunkName: 'user' */ '../user/teamList'))
const RealNameAudit = lazy(() => import(/* webpackChunkName: 'user' */ '../user/realNameAudit'))
const EarningsLimit = lazy(() => import(/* webpackChunkName: 'user' */ '../user/earningsLimit'))
const InvestAgain = lazy(() => import(/* webpackChunkName: 'user' */ '../user/investAgain'))
const Ark = lazy(() => import(/* webpackChunkName: 'user' */ '../user/ark'))
// 聊天管理
const GroupChat = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/groupChat'))
const GroupMember = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/subPage/groupMember'))
const GroupRecord = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/subPage/groupRecord'))
const PersonalChat = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/personalChat'))
const PersonalMember = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/subPage/personalMember'))
const PersonalRecord = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/subPage/personalRecord'))
const PlatformBlackList = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/platformBlackList'))
const GroupBlackList = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/groupBlackList'))
const RedPacketRecord = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/redPacketRecord'))
const ChatTransferRecord = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/chatTransferRecord'))
const RedPacketSet = lazy(() => import(/* webpackChunkName: 'chat' */ '../chat/redPacketSet'))
// 钱包管理
const AddCoinList = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/addCoinList'))
const SmartAddCoinList = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/smartAddCoinList'))
const CoinMarket = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/coinMarket'))
const CoinSet = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/coinSet'))
const GetCoinList = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/getCoinList'))
const Reconciliation = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/reconciliation'))
const LinkInfo = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/linkInfo'))
const ExchangeSet = lazy(() => import(/* webpackChunkName: 'wallet' */ '../wallet/exchangeSet'))
// 财务管理
const AssetRecord = lazy(() => import(/* webpackChunkName: 'financial' */ '../financial/assetRecord'))
const HandleUSD = lazy(() => import(/* webpackChunkName: 'financial' */ '../financial/handleUSD'))
const HandleYBT = lazy(() => import(/* webpackChunkName: 'financial' */ '../financial/handleYBT'))
const WalletRemain = lazy(() => import(/* webpackChunkName: 'financial' */ '../financial/walletRemain'))
// AI智能宝管理
const ReleaseList = lazy(() => import(/* webpackChunkName: 'smart' */ '../smart/releaseList'))
const Smart = lazy(() => import(/* webpackChunkName: 'smart' */ '../smart/smart'))
const SmartSet = lazy(() => import(/* webpackChunkName: 'smart' */ '../smart/smartSet'))
// LARGE智能宝管理
const LargeSmart = lazy(() => import(/* webpackChunkName: 'largeSmart' */ '../largeSmart/largeSmart'))
const LargeSmartDetail = lazy(() => import(/* webpackChunkName: 'largeSmart' */ '../largeSmart/subPage/largeSmartDetail'))
const LargeSmartSet = lazy(() => import(/* webpackChunkName: 'largeSmart' */ '../largeSmart/largeSmartSet'))
const LargeReleaseList = lazy(() => import(/* webpackChunkName: 'largeSmart' */ '../largeSmart/largeReleaseList'))
// YouBank全球付卡
const GlobalCardList = lazy(() => import(/* webpackChunkName: 'globalCard' */ '../globalCard/globalCardList'))
const GlobalCardSet = lazy(() => import(/* webpackChunkName: 'globalCard' */ '../globalCard/globalCardSet'))
const GlobalCardDetail = lazy(() => import(/* webpackChunkName: 'globalCard' */ '../globalCard/subPage/globalCardDetail'))
// U币贷
const CreditContract = lazy(() => import(/* webpackChunkName: 'youCredit' */ '../youCredit/creditContract'))
const CreditOrder = lazy(() => import(/* webpackChunkName: 'youCredit' */ '../youCredit/creditOrder'))
const CreditRepayment = lazy(() => import(/* webpackChunkName: 'youCredit' */ '../youCredit/creditRepayment'))
const CreditBorrow = lazy(() => import(/* webpackChunkName: 'youCredit' */ '../youCredit/creditBorrow'))
// 发现
const FindAdvertLink = lazy(() => import(/* webpackChunkName: 'find' */ '../find/findAdvertLink'))
// 参数设置
const GiveIssue = lazy(() => import(/* webpackChunkName: 'params' */ '../params/giveIssue'))
const SystemParam = lazy(() => import(/* webpackChunkName: 'params' */ '../params/systemParam'))
const RewardSet = lazy(() => import(/* webpackChunkName: 'params' */ '../params/rewardSet'))
const TeamLeader = lazy(() => import(/* webpackChunkName: 'params' */ '../params/teamLeader'))
// 系统设置
const AppVersion = lazy(() => import(/* webpackChunkName: 'system' */ '../system/appVersion'))
const Message = lazy(() => import(/* webpackChunkName: 'system' */ '../system/message'))
// 权限设置
const ManagerList = lazy(() => import(/* webpackChunkName: 'permission' */ '../permission/managerList'))
const RoleList = lazy(() => import(/* webpackChunkName: 'permission' */ '../permission/roleList'))
const EditRole = lazy(() => import(/* webpackChunkName: 'permission' */ '../permission/editRole'))
const Log = lazy(() => import(/* webpackChunkName: 'permission' */ '../permission/log'))
// 个人中心
const FileDownload = lazy(() => import(/* webpackChunkName: 'person' */ '../person/fileDownload'))

// 权限路由
function PrivateRoute({ component: Component, authList, code, ...rest }) {
  return (
    <Route
      {...rest}
      render={ props => {
        if (authList && code) {
          return authList.filter(v => {
            return code.filter(w => +v === +w).length
          }).length ?
          <Component {...props} /> :
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />          
        } else {
          return <Component {...props} />
        }
      }}
    />
  )
}

export default class extends Component {
  constructor(props) {
    super(props)
    const token = sessionStorage.getItem('token')
    this.state = {
      token: token, // session存储token
      userInfo: {}, // 当前用户信息
      loading: false, // 获取个人信息(包含权限)loading
    }
    // 设置请求token
    token && setAuthHeader(token)
  }

  // 渲染前获取用户信息（包含权限）
  componentWillMount() {
    if (this.state.token) {
      this.setState({loading: true})
      getInfo().then(data => {
        let userInfo = data.data
        this.setState({userInfo: userInfo, loading: false})
      }).catch(() => {
        this.setState({loading: 0})
      }) 
    }
  }

  // 渲染
  render() {
    const {userInfo, loading} = this.state
    const authList = userInfo.resource || []
    const fallback = (
      <div className="tac" style={{marginTop: '20vmin'}}><Spin size="large" /></div>
    )

    if (this.state.token) {
      return (
        <MyContext.Provider value={{userInfo, authList}}>
          <div className="layout">
            <Topbar />
            <LeftBar loading={loading}/>
            <div className="main">
              {
                !!userInfo.resource &&
                <Suspense fallback={fallback}>
                  <Switch>
                    <Route exact path="/" component={ Home } />
                    <Route path="/account" component={ Account } />
                    <PrivateRoute path="/assetStatistic" component={ AssetStatistic } authList={authList} code={['1007']}/>
                    <PrivateRoute path="/coinStatistic" component={ CoinStatistic } authList={authList} code={['1010']}/>
                    <PrivateRoute path="/userStatistic" component={ UserStatistic } authList={authList} code={['1004']}/>
                    <PrivateRoute path="/userList" component={ UserList } authList={authList} code={['2004']}/>
                    <PrivateRoute path="/userDetail" component={ UserDetail } authList={authList} code={['2005', '1407']}/>
                    <PrivateRoute path="/teamList" component={ TeamList } authList={authList} code={['2013']}/>
                    <PrivateRoute path="/earningsLimit" component={ EarningsLimit } authList={authList} code={['2019']}/>
                    <PrivateRoute path="/investAgain" component={ InvestAgain } authList={authList} code={['2025']}/>
                    <PrivateRoute path="/ark" component={ Ark } authList={authList} code={['2032']}/>
                    <PrivateRoute path="/groupChat" component={ GroupChat } authList={authList} code={['1404']}/>
                    <PrivateRoute path="/groupMember" component={ GroupMember } authList={authList} code={['1405']}/>
                    <PrivateRoute path="/groupRecord" component={ GroupRecord } authList={authList} code={['1406']}/>
                    <PrivateRoute path="/personalChat" component={ PersonalChat } authList={authList} code={['1424']}/>
                    <PrivateRoute path="/personalMember" component={ PersonalMember } authList={authList} code={['1425']}/>
                    <PrivateRoute path="/personalRecord" component={ PersonalRecord } authList={authList} code={['1426']}/>
                    <PrivateRoute path="/platformBlackList" component={ PlatformBlackList } authList={authList} code={['1431']}/>
                    <PrivateRoute path="/groupBlackList" component={ GroupBlackList } authList={authList} code={['1419']}/>
                    
                    <PrivateRoute path="/redPacketRecord" component={ RedPacketRecord } authList={authList} code={['2013']}/>
                    <PrivateRoute path="/chatTransferRecord" component={ ChatTransferRecord } authList={authList} code={['2013']}/>
                    <PrivateRoute path="/redPacketSet" component={ RedPacketSet } authList={authList} code={['2013']}/>

                    <PrivateRoute path="/globalCardList" component={ GlobalCardList } authList={authList} code={['1304']}/>
                    <PrivateRoute path="/globalCardSet" component={ GlobalCardSet } authList={authList} code={['1310', '1315', '1322']}/>
                    <PrivateRoute path="/globalCardDetail" component={ GlobalCardDetail } authList={authList} code={['1305']}/>
                    <PrivateRoute path="/findAdvertLink" component={ FindAdvertLink } authList={authList} code={['1204', '1211', '1218']}/>
                    <PrivateRoute path="/realNameAudit" component={ RealNameAudit } authList={authList} code={['2018']}/>
                    <PrivateRoute path="/addCoinList" component={ AddCoinList } authList={authList} code={['3004']}/>
                    <PrivateRoute path="/smartAddCoinList" component={ SmartAddCoinList } authList={authList} code={['3038']}/>
                    <PrivateRoute path="/coinMarket" component={ CoinMarket } authList={authList} code={['3015']}/>
                    <PrivateRoute path="/coinSet" component={ CoinSet } authList={authList} code={['3020', '3027']}/>
                    <PrivateRoute path="/getCoinList" component={ GetCoinList } authList={authList} code={['3009']}/>
                    <PrivateRoute path="/reconciliation" component={ Reconciliation } authList={authList} code={['3035']}/>
                    <PrivateRoute path="/linkInfo" component={ LinkInfo } authList={authList} code={['3032']}/>
                    <PrivateRoute path="/exchangeSet" component={ ExchangeSet } authList={authList} code={['3043']}/>
                    <PrivateRoute path="/assetRecord" component={ AssetRecord } authList={authList} code={['4004']}/>
                    <PrivateRoute path="/handleUSD" component={ HandleUSD } authList={authList} code={['4007']}/>
                    <PrivateRoute path="/handleYBT" component={ HandleYBT } authList={authList} code={['4010']}/>
                    <PrivateRoute path="/walletRemain" component={ WalletRemain } authList={authList} code={['4013']}/>
                    <PrivateRoute path="/releaseList" component={ ReleaseList } authList={authList} code={['5014']}/>
                    <PrivateRoute path="/smartIn" component={ Smart } key="smartIn" authList={authList} code={['5004']}/>
                    <PrivateRoute path="/smartOut" component={ Smart } key="smartOut" authList={authList} code={['5009']}/>
                    <PrivateRoute path="/largeSmart" component={ LargeSmart } key="largeSmart" authList={authList} code={['9020']}/>
                    <PrivateRoute path="/largeSmartDetail" component={ LargeSmartDetail } authList={authList} code={['9021']}/>
                    <PrivateRoute path="/largeSmartSet" component={ LargeSmartSet } authList={authList} code={['9004' ,'9009', '9015']}/>
                    <PrivateRoute path="/largeReleaseList" component={ LargeReleaseList } authList={authList} code={['9026']}/>
                    <PrivateRoute path="/creditContract" component={ CreditContract } authList={authList} code={['1104', '1110']}/>
                    <PrivateRoute path="/creditOrder" component={ CreditOrder } authList={authList} code={['1116']}/>
                    <PrivateRoute path="/creditRepayment" component={ CreditRepayment } authList={authList} code={['1122']}/>
                    <PrivateRoute path="/creditBorrow" component={ CreditBorrow } authList={authList} code={['1125']}/>
                    <PrivateRoute path="/systemParam" component={ SystemParam } authList={authList} code={['6023']}/>
                    <PrivateRoute path="/giveIssue" component={ GiveIssue } authList={authList} code={['6009']}/>
                    <PrivateRoute path="/rewardSet" component={ RewardSet } authList={authList} code={['6004']}/>
                    <PrivateRoute path="/smartSet" component={ SmartSet } authList={authList} code={['5017']}/>
                    <PrivateRoute path="/teamLeader" component={ TeamLeader } authList={authList} code={['6016']}/>
                    <PrivateRoute path="/appVersion" component={ AppVersion } authList={authList} code={['7011']}/>
                    <PrivateRoute path="/message" component={ Message } authList={authList} code={['7004']}/>
                    <PrivateRoute path="/managerList" component={ ManagerList } authList={authList} code={['8004']}/>
                    <PrivateRoute path="/roleList" component={ RoleList } authList={authList} code={['8012']}/>
                    <PrivateRoute path="/editRole" component={ EditRole } authList={authList} code={['8016']}/>
                    <PrivateRoute path="/log" component={ Log } authList={ authList } code={['8019']} />
                    <PrivateRoute path="/fileDownload" component={ FileDownload } />
                    <Redirect to="/" />
                  </Switch>
                </Suspense>
              }
            </div>
          </div>
        </MyContext.Provider>
      );      
    } else {
      this.props.history.push('/login')
      return null
    }
  }
}