/* 全局静态资源，过滤对象数据，为区别其他参数，均以‘f_’开头 */
import moment from 'moment'
import Hashids from '@/assets/js/hashids'
const hashids = new Hashids("20190415", 6, "1234567890")

// 数据库用户Id加密成和app显示id一致
export const f_encodeId = (id) =>{
  let idStr = id ? (id + '').trim() : ''
  return idStr === '0' ? '0' : hashids.encode(idStr)
}

// app显示用户id解密为数据库用户Id
export const f_decodeId = (id) => {
  let idStr = id ? (id + '').trim() : ''
  return hashids.decode(idStr)
}

// 聊天时间过滤 （均为24小时制）
// 当天消息：
//   （0时至5时）=> 凌晨 02：30
//   （5时至11时）=> 上午 10：43
//   （11时至23时59分）=> 下午19：11
// 昨天消息： 昨天 16：56
// 一周内消息： 星期五 10：12
// 超过一周消息： 2019-7-12 18:23
export const f_chatTime = (time) => {
  try {
    let time1 = moment(time)
    let time2 = time1.format('HH:mm')
    let todayStart = moment().format('YYYY-MM-DD')
    let yesterdayStart = moment().subtract(1, 'day').format('YYYY-MM-DD')
    let sevenDaysAgoStart = moment().subtract(7, 'day').format('YYYY-MM-DD')
    if (time1.isAfter(todayStart)) {
      if (time1.isBefore(todayStart + ' 05:00:00')) {
        return '凌晨 ' + time2
      } else if (time1.isBefore(todayStart + ' 11:00:00')) {
        return '上午 ' + time2
      } else {
        return '下午 ' + time2
      }
    } else if (time1.isAfter(yesterdayStart)) {
      return '昨天 ' + time2
    } else if (time1.isAfter(sevenDaysAgoStart)) {
      return time1.format('dddd HH:mm')
    } else {
      return time1.format('YYYY-MM-DD HH:mm')
    }
  } catch (err) {
    return '-'
  }
}

// 可以将对应关系对象转换成数组，便于循环展示，使用id 和 name对应
export const ObjToArr = (obj) => {
  let arr = []
  for (let i in obj) {
    arr.push({id: i, name: obj[i]})
  }
  return arr
}

// 节点等级
export const f_nodeLevel = {
  '0': '非节点',
  '1': '普通节点',
  '2': '超级节点',
}

// 聊天节点等级
export const f_chatNodeLevel = {
  'nothing': '非节点',
  'node': '普通节点',
  'superNode': '超级节点',
}

// 事件类型
export const f_eventType = {
  '5': '买入币订单',
  '6': '卖出币订单',
  '7': '智能宝转出',
  '8': '智能宝转入',
  '9': '用户转账',
  '10': '二维码收付款',
  '11': '闪兑',
  '12': '充币',
  '13': '提币',
  '14': 'AI静态收益',
  '15': 'AI推荐动态收益',
  '16': '社区动态收益',
  '17': '赠送YBT',
  '18': '社区总体收益',
  '19': '推荐节点收益',
  '20': '平台手续费',
  '21': '平台管理收益',
  '22': '推荐项目收益',
  '23': '平台分红',
  '24': '团队业绩奖励',
  '25': '会员业绩奖励',
  '26': '会员存币奖励',
  '27': '智能宝转出费',
  '28': '智能宝违约费',
  '29': '智能宝服务费',
  '30': '提币手续费',
  '31': '转账手续费',
  '32': '操作冻结资产',
  '33': '数据库迁移',
  '34': '第三方支付',
  '35': '第三方支付退款',
  '36': '操作可用资产',
  // '37': '操作交易冻结资产',
  '38': '冻结资产释放',
  '39': '闪兑手续费',
  '40': 'LARGE智能宝转出',
  '41': 'LARGE智能宝转入',
  '42': 'LARGE智能宝服务费',
  '43': 'LARGE静态收益',
  '44': 'LARGE推荐动态收益',
  '45': '充币转入AI智能宝',
  '50': '贷款',
  '51': '还款',
  '52': '全球付卡开户',
  '53': '全球付卡充值',
  '54': '全球付卡充值手续费',
}

// 交易动作
export const f_operation = {
  '1': '冻结',
  '2': '解冻',
  '3': '买入',
  '4': '卖出',
  '5': '转入',
  '6': '转出',
  '7': '收益',
}

// 充币状态
export const f_rechargeStatus = {
  'SUCCEED': '成功',
  'FAILED': '失败',
  'CONFIRMING': '确认中',
}

// 提币状态
export const f_withdrawStatus = {
  'WAIT_REVIEW': '待审核',
  'SECOND_REFUSAL': '审核驳回',
  'CONFIRMING': '确认中',
  'SUCCEED': '成功',
  'FAILED': '异常失败',
  'PATCH': '补单成功',
  'PENDING': '处理中',
  'ERROR': '钱包异常',
}

// 充值发放类型
export const f_giveIssueType = {
  '4': '赠送YBT',
  '6': '推荐节点收益',
  '7': '平台手续费',
  '8': '平台管理收益',
  '9': '推荐项目收益',
  '10': '平台分红',
  '12': '会员业绩奖励',
  '14': '冻结资产释放',
}

// 充值节点类型 old 1 2 3
export const f_giveNodeType = {
  '0': '初始化',
  '2': '释放中',
  '9': '终止',
}

// 日志类型
export const f_logType = {
  '1': '锁定用户',
  '2': '解锁用户',
  '3': '设置节点',
  '5': '设置等级',
  '6': '添加管理员',
  '7': '设置角色',
}

// 消息类型
export const f_msgType = {
  '1': '系统消息',
  '2': '系统公告',
  // '4': '弹窗公告',
}

// 审核状态
export const f_auditStatus = {
  '1': '待审核',
  '2': '通过',
  '3': '不通过',
}

// large智能宝资产状态
export const f_largeSmartStatus = {
  '1': '量化中',
  '2': '已到期',
  '3': '已取出',
}

// 群状态
export const f_groupStatus = {
  'running': '正常',
  'dissolve': '已解散',
}

// 添加好友方式
export const f_addFriendType = {
  'qr_code': '扫一扫',
  'search': '账号查找',
  'group_chat': '群聊',
}

// U币贷订单状态
export const f_youCreditOrderStatus = {
  '0': '审核中',
  '1': '已驳回',
  '2': '履行中',
  '3': '已平仓',
  '4': '已还款',
}

// 文件下载状态
export const f_fileDownloadStatus = {
  '1': '导出中',
  '2': '已完成',
  '3': '导出失败',
}

// 全球付卡状态
export const f_globalCardStatus = {
  '1': '未支付',
  '2': '待发货',
  // '3': '已发货',
  '4': '待激活',
  '5': '已激活',
  '6': '认证中',
  '7': '已认证',
  '8': '认证失败',
}

// 全球付卡身份认证类型
export const f_globalCardCertificate = {
  '00': '身份证',
  '02': '护照',
}

// 全球付卡交易类型
export const f_globalCardTradeType = {
  '0100': '全球付卡充值',
  '0102': '在线充值',
  '0110': '礼品卡激活',
  '0200': '全球付卡消费',
  '0201': '全球付卡消费授权',
  '0202': '授权清算',
  '0203': '补扣款',
  '0205': 'ATM提款授权',
  '0206': 'ATM提款清算',
  '0302': '全球付卡退款',
  '0303': '拒付',
  '0308': '网关支付退款',
  '0400': '转账',
  '0402': '他行转入',
  '0500': '提现',
  '0600': '转账到银行卡',
  '0601': '商户转账到银行卡',
  '0701': '交易状态查询',
  '0702': '查询余额',
  '0800': '网关支付',
  '0920': '消费撤销',
  '0921': '消费授权撤销',
  '0922': '人工授权撤销',
  '0923': '自动授权撤销',
  '0932': '退款撤销',
  '0933': '拒付撤销',
}

// 发现平台标识
export const f_findPlatformType = {
  '0': '无',
  '1': '超级红',
  '2': '特奢会',
  '3': '优品汇',
  '4': '星火燎原',
}

// 收益限制状态
export const f_earningsLimitStatus = {
  '1': 'AI静态收益',
  '2': 'AI推荐动态收益',
  '3': '社区动态收益',
  '4': '赠送YBT',
  '5': '社区总体收益',
  '6': '推荐节点收益',
  '7': '平台手续费',
  '8': '平台管理收益',
  '9': '推荐项目收益',
  '10': '平台分红',
  '11': '团队业绩奖励',
  '12': '会员业绩奖励',
  '13': '会员存币奖励',
  '14': '冻结资产释放',
  '51': 'Large静态收益',
  '52': 'Large动态收益',
}

// 收益限制类型
export const f_earningsLimitFlag = {
  '1': '人工限制',
  '2': '系统限制',
}

// 闪兑设置支持语言
export const f_exchangeLang = {
  'zh_cn': '中文',
  'zh_tw': '台湾',
  'km_kh': '香港',
  'en_us': '英语',
  'ja_jp': '日语',
  'ko_kr': '韩语',
}
