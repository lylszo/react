import { encapPost, encapGet, encapUpdate, encapDelete } from './http.js';
import { message } from 'antd'

/* 测试接口，用于前端调试，偶尔也会报错，resolve会自动返回所传参数, 测试数据可以放到params对象内 */
export const testApi = (params) => {
  console.log('测试参数和数据：', params)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.95) {
        resolve(params)
      } else {
        reject()
        message.error('接口报错！')
      }
    }, 1000)
  })
}

/* 登录和验证相关 */
export const initCaptcha = () => encapGet(`/staff/init-captcha?t=${Math.random()}`) // 极验初始化
export const login = (params = {}) => encapPost('/staff/login', params) // 登录
export const logout = () => encapPost('/staff/logout') // 注销
export const sendCode = (params = {}) => encapPost('/staff/send-verification-code', params) // 发送验证码
export const verifyCode = (params = {}) => encapPost('/staff/verify', params) // 验证验证码

/* 账号相关 */
export const getInfo = () => encapGet('/staff/info') // 获取当前职员详情
export const resetPassword = (params = {}) => encapPost('/staff/set-password', params) // 获取当前职员详情

/* 统计相关 */
export const assetStatistic = () => encapGet('/statistics/platform/asset') // 资产统计
export const ybtStatistic = () => encapGet('/statistics/platform/ybt-release') // ybt释放统计
export const coinStatistic = (id) => encapGet(`/wallet-mgmt/wallet-info/${id}`) // 重提币统计
export const userStatistic = () => encapGet('/staff/get-user-sum-info') // 用户统计

/* 用户管理相关 */
export const getUserList = (params = {}) => encapGet('/staff/investors', params) // 获取用户列表
export const getVipData = () => encapGet('/staff/get-user-list-sum') // 获取用户会员统计数据
export const getUserDetail = (id) => encapGet(`/staff/users/${id}`) // 获取用户详情
export const lockUser = (id, params = {}) => encapUpdate(`/staff/${id}/lock-account`, params) // 锁定用户
export const unlockUser = (id, params = {}) => encapUpdate(`/staff/${id}/unlock-user`, params) // 解锁用户
export const lockUserAsset = (params = {}) => encapPost('/staff/set-is-locked-asset', params) // 解锁/锁定用户资产
export const resetUserPhone = (params = {}) => encapPost(`/staff/reset-front-phone`, params) // 重置用户手机号
export const resetUserPwd = (params = {}) => encapPost(`/staff/reset-front-password`, params) // 重置用户密码
export const resetUserEmail = (params = {}) => encapPost(`/staff/accounts/alter-email`, params) // 重置用户邮箱
export const setUserGrade = (params = {}) => encapPost('/staff/set-grade', params) // 设置会员等级
export const userAssetSet = (params = {}) => encapPost(`/admin/operation/ybt-asset`, params) // 用户资产配置
export const userNodeSet = (params = {}) => encapPost(`/staff/set-node-level`, params) // 用户设置节点
export const getInviteList = (params = {}) => encapGet('/staff/invites', params) // 获取用户邀请记录
export const getUserAsset = (id) => encapGet(`/admin/balance/${id}`) // 用户资产查询
export const getUserLargeAsset = (userId) => encapGet(`/large/smart/assets/${userId}`) // 获取用户Large智能宝币种资产列表
export const getUserSmartAsset = (id) => encapGet(`/smart-pay/smart-assets/${id}`) // 用户智能宝资产查询
export const resetGrade = (id) => encapPost(`/staff/${id}/init-grade-modified-status`) // 用户重置等级
export const editUserRemark = (id, params = {}) => encapUpdate(`/staff/${id}/remark`, params) // 修改用户备注
export const earningsLimitAdd = (params = {}) => encapPost('/clr-blacklist', params) // 新建收益限制黑名单用户
export const earningsLimitDel = (id) => encapDelete(`/clr-blacklist/${id}`) // 解除用户限制
export const earningsLimitList = (params = {}) => encapGet('/clr-blacklist/list', params) // 获取收益限制用户列表
export const investAgainAdd = (params = {}) => encapPost('/reinvestment/account', params) // 新建复投限制黑名单用户
export const investAgainDel = (id) => encapDelete(`/reinvestment/account/${id}`) // 解除复投限制
export const investAgainList = (params = {}) => encapGet('/reinvestment/account-list', params) // 获取复投限制用户列表
export const delUserGoogle = (id) => encapDelete(`/staff/remove-user-google-bind/${id}`) // 解绑用户谷歌验证
export const arkAdd = (params = {}) => encapPost('/clr-noah', params) // 新建诺亚方舟用户
export const arkDel = (id) => encapDelete(`/clr-noah/${id}`) // 移除诺亚方舟用户
export const arkList = (params = {}) => encapGet('/clr-noah/list', params) // 获取诺亚方舟用户列表
export const arkEdit = (params = {}) => encapUpdate('/clr-noah', params) // 编辑诺亚方舟用户
export const userClrList = (params = {}) => encapGet('/clr-ratoi/list', params) // 获取用户的动态收益比例
export const userClrEdit = (params = {}) => encapPost('/clr-ratoi', params) // 编辑用户动态收益比例

/* 聊天相关 */
export const getChatRoom = (params = {}) => encapGet('/chat/chat-rooms', params) // 获取聊天室列表
export const cancelChatRoom = (id, params= {}) => encapUpdate(`/chat/chat-rooms/${id}`, params) // 解散聊天室
export const getRoomLimit = (params = {}) => encapGet('/chat/chat-rooms/users/create', params) // 获取建群限制信息
export const ceateRoomLimit = (params = {}) => encapUpdate('/chat/chat-rooms/users/create', params) // 建群限制
export const getRoomMemberList = (params = {}) => encapGet(`/chat/chat-rooms/${params.roomId}/members`, params) // 群成员列表
export const delRoomMember = (roomId, params = {}) => encapDelete(`/chat/chat-rooms/${roomId}/members`, params) // 剔除群成员
export const getChatRecord = (id, params = {}) => encapGet(`/chat/chat-rooms/${id}/chat-historical-record`, params) // 查看群聊记录
export const groupSendLimit = (id, params = {}) => encapUpdate(`/chat/chat-rooms/silent/${id}/member?roomId=${params.roomId}`, params) // 群成员发言限制
export const groupMemberToBlack = (id, params = {}) => encapPost(`/chat/chat-rooms/blacklist/${id}/member`, params) // 将群成员拉入黑名单
export const groupMemberOutBlack = (id, params = {}) => encapDelete(`/chat/chat-rooms/blacklist/${id}/member`, params) // 将群成员拉出黑名单
export const getChatUserList = (params = {}) => encapGet('/chat/chat-users', params) // 获取所有用户信息列表
export const getFriendsList = (userId, params = {}) => encapGet(`/chat/friends/${userId}`, params) // 获取好友列表
export const getFriendsChatList = (id, params = {}) => encapGet(`/chat/friends/${id}/chat-historical-record`, params) // 查询好友聊天记录
export const getPlatformBlackList = (params = {}) => encapGet('/chat/platform-blacklists', params) // 获取所有平台黑名单列表
export const getGroupBlackList = (params = {}) => encapGet('/chat/chat-rooms/blacklist', params) // 获取所有群黑名单列表
export const platformToBlack = (id, params = {}) => encapPost(`/chat/platform-blacklists/${id}`, params) // 加入平台黑名单
export const platformOutBlack = (id) => encapDelete(`/chat/platform-blacklists/${id}`) // 将群成员拉出黑名单
export const getRedPacketList = (params = {}) => encapGet('/chat/red-packets', params) // 获取红包记录
export const sendAllMessage = (params = {}) => encapPost('/chat/chat-rooms/admin/msgsnd', params) // 所有群发送管理员消息
export const sendGroupMessage = (id, params = {}) => encapPost(`/chat/chat-rooms/${id}/admin/msgsnd`, params) // 指定群群发送管理员消息
export const groupBanned = (id) => encapUpdate(`/chat/chat-rooms/${id}/silent`) // 指定群全员禁言或解除禁言
export const groupAddFriend = (id, params = {}) => encapUpdate(`/chat/chat-rooms/${id}/isAddFriend`, params) // 指定群全员是否允许通过群聊加好友

/* 钱包管理 */
export const getRechargeList = (params = {}) => encapGet('/wallet-mgmt/recharge-records', params) // 获取充币记录
export const getSmartRechargeList = (params = {}) => encapGet('/wallet-mgmt/smart-recharge-records', params) // 获取AI智能宝充币记录
export const getWithdrawList = (params = {}) => encapGet('/wallet-mgmt/withdraw-records', params) // 获取提币记录
export const getReconciliation = (params = {}) => encapGet('/admin/balance/reconciliation', params) // 获取对账信息
export const getWithdrawDetail = (id) => encapGet(`/wallet-mgmt/withdraw-records/${id}`) // 获取提币详情
export const withdrawAudit = (id, params = {}) => encapPost(`/wallet-mgmt/withdraw/${id}/second-audit`, params) // 提币审核
export const withdrawPatch = (id, params = {}) => encapPost(`/wallet-mgmt/withdraw/patch/${id}`, params) // 提币补单
export const getCoinMarket = (params = {}) => encapGet('/exchange/list', params) // 获取币种行情
export const editCoinMarket = (params = {}) => encapPost('/exchange', params) // 新建/编辑币种行情
export const getAllCoinList = () => encapGet('/wallet-mgmt/coin-list') // 获取所有币种列表(不分页，下拉列表筛选使用)
export const getCoinList = (params = {}) => encapGet('/wallet-mgmt/coins', params) // 获取币种配置列表(分页)
export const addCoinSet = (params = {}) => encapPost('/wallet-mgmt/coins/add', params) // 新增币种配置
export const getWalletList = (params = {}) => encapGet('/wallet-mgmt/chain-setting/initialized', params) // 获取钱包（链信息）列表，不分页
export const addCoinSwitch = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/recharge?rechargeable=${params.rechargeable}`) // 币种充币开关
export const getCoinSwitch = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/withdraw?withdrawable=${params.withdrawable}`) // 币种提币开关
export const showCoin = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/show?show=${params.show}`) // 是否显示币种
export const exchangeCoinSwitch = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/flash-exchange?flashExchange=${params.flashExchange}`) // 是否可闪兑
export const exchangeCoinRevenue = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/isRevenue?isRevenue=${params.isRevenue}`) // 是否产生收益
export const exchangeSmartSwitch = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/smart-recharge?rechargeable=${params.rechargeable}`) // 是否产生收益
export const getCoinSetDetail = (id) => encapGet(`/wallet-mgmt/coins/${id}`) // 获取币种配置详情
export const editCoinSet = (id, params) => encapUpdate(`/wallet-mgmt/coins/${id}`, params) // 币种配置编辑
export const getLinkList = (params) => encapGet('/wallet-mgmt/chain-setting', params) // 链信息列表
export const getLinkDetail = (id) => encapGet(`/wallet-mgmt/chain-setting/${id}`) // 链信息详情
export const editLink = (id, params) => encapUpdate(`/wallet-mgmt/chain-setting/${id}`, params) // 编辑链信息
export const exchangeAdd = (params = {}) => encapPost('/exchange-control', params) // 闪兑设置新增
export const exchangeEdit = (params = {}) => encapUpdate('/exchange-control', params) // 闪兑设置编辑
export const exchangeList = (params = {}) => encapGet('/exchange-control/list', params) // 闪兑设置列表
export const exchangeDel = (id) => encapDelete(`/exchange-control/${id}`) // 闪兑设置删除

/* 财务管理 */
export const balanceList = (params = {}) => encapGet('/admin/balance/user-balance-flow', params) // 获取资金流水列表
export const balanceTotal = (params = {}) => encapGet('/admin/balance/user-balance-flow/total', params) // 获取各种流水合计信息
export const lockedBalance = (params = {}) => encapGet('/admin/balance/add-locked-flow', params) // 获取冻结资金流水列表
export const multipleAddUsd = (params = {}) => encapPost('/admin/add-locked-asset-batch', params) // 批量冻结USD资产
export const multipleDelUsd = (params = {}) => encapPost('/admin/deduction-locked-asset-batch', params) // 批量扣除USD资产
export const walletBalance = (id) => encapGet(`/wallet-mgmt/wallet-balance/${id}`) // 获取钱包余额

/* 智能宝管理 */
export const getSmartList = (params = {}) => encapGet('/smart-pay/smart-balance-into-search', params) // 获取智能宝流水列表
export const getSmartFeeSet = () => encapGet('/out-allocation/detail') // 获取智能宝费率详情
export const saveSmartFeeSet = (params = {}) => encapPost('/out-allocation/save', params) // 修改智能宝费率

/* LARGE智能宝,largeSmart简写ls */
export const lsBaseSetDetail = (params = {}) => encapGet('/large/smart/allocation', params) // 查询large智能宝基础配置
export const lsBaseSetSave = (params = {}) => encapUpdate('/large/smart/allocation', params) // 保存large智能宝基础配置
export const lsAddContract = (params = {}) => encapPost('/large/smart/contract', params) // 新增large智能宝合约
export const lsTimeAndRateList = () => encapGet('/large/smart/contract/param/list') // 获取合约时长和收益率的下拉列表数据
export const lsContractList = (params = {}) => encapGet('/large/smart/contract/list', params) //  查询large智能宝合约列表
export const lsReleaseList = (params = {}) => encapGet('/large/smart/revenue/list', params) //  查询large智能宝收益列表
export const lsContractStatusEdit = (params = {}) => encapUpdate(`/large/smart/contract/${params.id}/is_valid?isValid=${params.isValid}`, params) //  修改large智能宝合约状态
export const lsCoinOpenEdit = (params = {}) => encapUpdate(`/wallet-mgmt/coins/${params.id}/isLarge?isLarge=${params.isLarge}`, params) //  修改币种配置中large智能宝开启状态
export const lsSmartList = (params = {}) => encapGet('/large/smart/list', params) // 获取large智能宝资产列表

/* YouBank全球付卡,globalCard=>gc */
export const gcBalance = (params = {}) => encapGet('/staff/global-pay/user-trade-query', params) // 全球付用户后台交易记录查询
export const gcDetail = (params = {}) => encapGet('/staff/global-pay/user-authentication-info-query', params) // 全球付后台卡认证信息查询
export const gcApplyList = (params = {}) => encapGet('/staff/global-pay/card-apply-info-query', params) // 全球付后台卡申请信息查询
export const gcLimit = (params = {}) => encapGet('/staff/global-pay/card-quota-query', params) // 全球付后台卡限额查询
export const gcEditApply = (params = {}) => encapPost('/staff/global-pay/alter-apply-card-info', params) // 修改卡申请信息
export const gcSetInfo = () => encapGet('/staff/global-pay/get-base-configs') // 全球付基础设置信息
export const gcSetEdit = (params = {}) => encapPost('/staff/global-pay/alter-base-config', params) // 全球付基础设置信息
export const gcOpenSwitch = (id, params = {}) => encapUpdate(`/wallet-mgmt/coins/${id}/isGlobalPay?isGlobalPay=${params.isGlobalPay}`) // 是否开启全球付充值功能
export const gcExpress = (params = {}) => encapGet('/staff/global-pay/post-info-query', params) // 查询全球付卡物流信息

/* 发现相关 */
export const findAdvertAdd = (params = {}) => encapPost('/find/advert', params) // 发现广告新增
export const findAdvertEdit = (params = {}) => encapUpdate('/find/advert', params) // 发现广告编辑
export const findAdvertList = (params = {}) => encapGet('/find/advert/list', params) // 发现广告列表
export const findAdvertDel = (id) => encapDelete(`/find/advert/${id}`) // 发现广告删除
export const findLinkAdd = (params = {}) => encapPost('/find/url-config', params) // 发现链接新增
export const findLinkEdit = (params = {}) => encapUpdate('/find/url-config', params) // 发现链接编辑
export const findLinkList = (params = {}) => encapGet('/find/url-config/list', params) // 发现链接列表
export const findLinkDel = (id) => encapDelete(`/find/url-config/${id}`) // 发现链接删除
export const findClassifyAdd = (params = {}) => encapPost('/find/classify', params) // 发现分类新增
export const findClassifyEdit = (params = {}) => encapUpdate('/find/classify', params) // 发现分类编辑
export const findClassifyList = (params = {}) => encapGet('/find/classify/list', params) // 发现分类列表
export const findClassifyDel = (id) => encapDelete(`/find/classify/${id}`) // 发现分类删除

/* U币贷 */
export const getYouContractList = (params = {}) => encapGet('/loan-settings-contract/query', params) // U币贷合约列表
export const addYouContract = (params = {}) => encapPost('/loan-settings-contract/add', params) // 添加合约
export const setYouContractStatus = (params = {}) => encapPost('/loan-settings-contract/enable', params) // 设置合约 开启/关闭
export const getYouCoinList = (params = {}) => encapGet('/loan-settings-coin/list', params) // U币贷合约设置币种列表
export const setYouCoin = (params = {}) => encapPost('/loan-settings-coin/enable', params) // 设置币种是否能抵押
export const setYouCoinLend = (params = {}) => encapPost('/loan-settings-coin/lend-coin', params) // 设置币种是否能借贷
export const setYouCoinAmount = (params = {}) => encapPost('/loan-settings-coin/amount', params) // 设置币种U币贷限额
export const getYouOrderList = (params = {}) => encapGet('/loan-settings-order/query', params) // U币贷订单列表
export const getYouOrderDetail = (params = {}) => encapGet('/loan-settings-order/detail', params) // U币贷订单详情
export const auditYouPass = (params = {}) => encapPost(`/loan-settings-order/approve?orderId=${params.orderId}`) // 订单审核通过
export const auditYouFail = (params = {}) => encapPost('/loan-settings-order/refuse', params) // 订单审核驳回
export const getBackMoneyList = (params = {}) => encapGet('/loan-settings-back/list', params) // 还款列表
export const getBorrowList = (params = {}) => encapGet('/loan-settings-lend/list', params) // 借款列表
export const getValidCoinList = (params = {}) => encapGet('/loan-settings-coin/lend-list', params) // 获取可以借贷的币种列表
export const getPledgeCoinList = (params = {}) => encapGet('/loan-settings-coin/pledge-list', params) // 获取可以质押的币种列表

/* 奖金参数 */
export const getParamList = () => encapGet('/system/config/list') // 获取参数列表
export const editParam = (params) => encapUpdate('/system/config', params) // 参数设置
export const getStaticParams = (params = {}) => encapGet('/clrPara/static/info', params) // 获取静态收益参数
export const getDynamicParams = (params = {}) => encapGet('/clrPara/dynamic/info', params) // 获取动态收益参数
export const getCommunityParams = (params = {}) => encapGet('/clrPara/community/info', params) // 获取社区收益参数
export const getNodeParams = (params = {}) => encapGet('/clrPara/node/info', params) // 获取节点收益参数
export const getCaptainParams = (params = {}) => encapGet('/clrPara/captain/info', params) // 获取团队长收益参数
export const getPersonalParams = (params = {}) => encapGet('/clrPara/personal/info', params) // 获取额外收益参数
export const editStaticParams = (params = {}) => encapUpdate('/clrPara/static', params) // 编辑静态收益参数
export const editDynamicParams = (params = {}) => encapUpdate('/clrPara/dynamic', params) // 编辑动态收益参数
export const editCommunityParams = (params = {}) => encapUpdate('/clrPara/community', params) // 编辑社区收益参数
export const editNodeParams = (params = {}) => encapUpdate('/clrPara/node', params) // 编辑节点收益参数
export const editCaptainParams = (params = {}) => encapUpdate('/clrPara/captain', params) // 编辑团队长收益参数
export const editPersonalParams = (params = {}) => encapUpdate('/clrPara/personal', params) // 编辑额外收益参数

/* 参数配置 */
export const giveIssueList = (params = {}) => encapGet('/issuing/list', params) // 充值发放列表
export const editGiveIssueStatus = (params = {}) => encapUpdate('/issuing/status', params) // 更新发放状态
export const addGiveIssue = (params = {}) => encapPost('/issuing', params) // 新建发放记录
export const delGiveIssue = (id) => encapDelete(`/issuing/${id}`) // 删除充值发放记录
export const teamLeaderList = (params = {}) => encapGet('/accumulate/list', params) // 团队长列表
export const addTeamLeader = (params = {}) => encapPost('/accumulate', params) // 添加团队长
export const editTeamLeader = (params = {}) => encapUpdate('/accumulate', params) // 编辑团队长
export const editTeamLeaderStatus = (params = {}) => encapUpdate('/accumulate/mask', params) // 更新团队长状态
export const getReward = () => encapGet('/clrPara/info') // 获取奖金参数
export const saveReward = (params = {}) => encapPost('/clrPara', params) // 更新奖金参数

/* 系统配置 */
export const getAppVersion = (params = {}) => encapGet('/system/app-version', params) // 获取app版本信息
export const editAppVersion = (params = {}) => encapUpdate('/system/app-version', params) // 编辑app版本信息
export const getMsgList = (params = {}) => encapGet('/message/list', params) // 获取消息列表
export const addMsg = (params = {}) => encapPost('/message', params) // 新建消息
export const delMsg = (id) => encapDelete(`/message/${id}`) // 删除消息
export const editMsg = (params = {}) => encapUpdate('/message', params) // 编辑消息

/* 权限设置 */
export const getStaffList = (params = {}) => encapGet('/staff', params) // 获取职员列表
export const addStaff = (params = {}) => encapPost('/staff', params) // 新增职员
export const editStaffStatus = (params = {}) => encapUpdate('/staff', params) // 启用禁用职员
export const resetStaffPwd = (id) => encapPost(`/staff/${id}/reset-password`) // 重置职员密码
export const setStaffRole = (params) => encapPost('/staff/set-role', params) // 设置职员角色
export const AddRole = (params) => encapPost('/staff/roles', params) // 新建角色
export const getRoleList = (id) => encapGet('/staff/roles/list') // 获取角色列表（无分页）
export const getRoles = (params = {}) => encapGet('/staff/roles', params) // 获取角色列表（分页）
export const delRole = (id) => encapDelete(`/staff/roles/${id}`) // 删除角色
export const getRolePermission = (id) => encapGet(`/staff/roles/${id}/permissions`) // 获取角色对应的权限
export const setRolePermission = (params = {}) => encapPost('/staff/roles/set-permissions', params) // 设置角色对应的权限
export const getPermissions = () => encapGet('/staff/permission') // 获取所有权限列表
export const getLogList = (params = {}) => encapGet('/operation/log', params) // 获取日志列表

/* 文件下载 */
export const getDownLoadList = (params = {}) => encapGet('/export/list', params) // 文件下载列表
export const dlBalance = (params = {}) => encapPost('/admin/balance/user-balance-flow/export', params) // 资金流水导出
export const dlLargeSmart = (params = {}) => encapPost('/large/smart/list/export', params) // large智能宝转入转出导出
export const dlSmart = (params = {}) => encapPost('/smart-pay/smart-balance-into/export', params) // AI智能宝转入转出导出
export const dlRecharge = (params = {}) => encapPost('/wallet-mgmt/recharge-records/export', params) // 充币记录导出
export const dlSmartRecharge = (params = {}) => encapPost('/wallet-mgmt/smart-recharge-records/export', params) // 智能宝充币记录导出
export const dlWithdraw = (params = {}) => encapPost('/wallet-mgmt/withdraw-records/export', params) // 提币记录导出
