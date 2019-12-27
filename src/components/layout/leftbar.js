import React, { Component } from 'react';
import { Menu, Icon, Spin } from 'antd';
import { withRouter } from "react-router-dom"
import MyContext from '@/tool/context'
import './leftbar.scss'

const SubMenu = Menu.SubMenu;

// 侧边栏配置列表
const list = [
  {
    icon: 'bar-chart',
    title: '统计管理',
    key: 'statistic',
    auth: ['1004', '1007', '1010'],
    children: [
      {
        path: 'userStatistic',
        title: '用户统计',
        auth: ['1004']
      },          
      {
        path: 'assetStatistic',
        title: '资产统计',
        auth: ['1007']
      },
      {
        path: 'coinStatistic',
        title: '充提币统计',
        auth: ['1010']
      },
    ]
  },
  {
    icon: 'team',
    title: '会员管理',
    key: 'user',
    auth: ['2004', '2013', '2019', '2025', '2032'],
    children: [
      {
        path: ['userList', 'userDetail'],
        title: '用户列表',
        auth: ['2004']
      },
      {
        path: 'teamList',
        title: '团队列表',
        auth: ['2013']
      },
      {
        path: 'ark',
        title: '诺亚方舟列表',
        auth: ['2032']
      },
      {
        path: 'earningsLimit',
        title: '收益限制列表',
        auth: ['2019']
      },
      {
        path: 'investAgain',
        title: '复投限制列表',
        auth: ['2025']
      },
      // {
      //   path: 'realNameAudit',
      //   title: '用户实名审核',
      //   auth: ['2018']
      // },
    ]
  },
  {
    icon: 'message',
    title: '聊天管理',
    key: 'chat',
    auth: ['1404', '1419', '1424', '1431'],
    children: [
      {
        path: ['groupChat', 'groupMember', 'groupRecord'],
        title: '群聊管理',
        auth: ['1404']
      },
      {
        path: ['groupBlackList'],
        title: '群聊黑名单',
        auth: ['1419']
      },
      {
        path: ['personalChat', 'personalMember', 'personalRecord'],
        title: '个人聊天管理',
        auth: ['1424']
      },
      {
        path: ['platformBlackList'],
        title: '平台黑名单',
        auth: ['1431']
      },
      // {
      //   path: ['redPacketRecord'],
      //   title: '红包记录',
      //   auth: ['2013']
      // },
      // {
      //   path: ['chatTransferRecord'],
      //   title: '转账记录',
      //   auth: ['2013']
      // },
      // {
      //   path: ['redPacketSet'],
      //   title: '红包设置',
      //   auth: ['2013']
      // },
    ]
  },
  {
    icon: 'wallet',
    title: '钱包管理',
    key: 'wallet',
    auth: ['3004', '3009', '3015', '3020', '3026', '3038', '3027', '3043'],
    children: [
      {
        path: 'addCoinList',
        title: '充币列表',
        auth: ['3004']
      },
      {
        path: 'smartAddCoinList',
        title: 'AI智能宝充币列表',
        auth: ['3038']
      },
      {
        path: ['getCoinList', 'reconciliation'],
        title: '提币列表',
        auth: ['3009']
      },
      {
        path: 'coinMarket',
        title: '币种行情',
        auth: ['3015']
      },
      {
        path: 'coinSet',
        title: '币种配置',
        auth: ['3020', '3027']
      },
      {
        path: 'linkInfo',
        title: '链信息',
        auth: ['3032']
      },
      {
        path: 'exchangeSet',
        title: '闪兑设置',
        auth: ['3043']
      },
    ]
  },
  {
    icon: 'money-collect',
    title: '财务管理',
    key: 'financial',
    auth: ['4004', '4007', '4010', '4013'], 
    children: [
      {
        path: 'assetRecord',
        title: '资金流水',
        auth: ['4004']
      },
      {
        path: 'handleUSD',
        title: '充值冻结USD',
        auth: ['4007']
      },
      {
        path: 'handleYBT',
        title: '充值YBT余额',
        auth: ['4010']
      },
      {
        path: 'walletRemain',
        title: '钱包余额',
        auth: ['4013']
      }
    ]
  },
  {
    icon: 'robot',
    title: 'AI智能宝管理',
    key: 'smart',
    auth: ['5004', '5009', '5014', '5017'],
    children: [
      {
        path: 'smartIn',
        title: 'AI智能宝转入',
        auth: ['5004']
      },
      {
        path: 'smartOut',
        title: 'AI智能宝转出',
        auth: ['5009']
      },
      {
        path: 'releaseList',
        title: 'AI智能宝释放列表',
        auth: ['5014']
      },
      {
        path: 'smartSet',
        title: 'AI智能宝配置',
        auth: ['5017']
      }
    ]
  },
  {
    icon: 'laptop',
    title: 'LARGE智能宝管理',
    key: 'largeSmart',
    auth: ['9004', '9009', '9015', '9020', '9026'],
    children: [
      {
        path: 'largeSmartSet',
        title: 'LARGE智能宝设置',
        auth: ['9004', '9009', '9015']
      },
      {
        path: ['largeSmart', 'largeSmartDetail'],
        title: 'LARGE智能宝资产列表',
        auth: ['9020']
      },
      {
        path: 'largeReleaseList',
        title: 'LARGE智能宝收益列表',
        auth: ['9026']
      }
    ]
  },
  {
    icon: 'underline',
    title: 'U币贷',
    key: 'youCredit',
    auth: ['1104', '1110', '1116', '1122', '1125'],
    children: [
      {
        path: 'creditContract',
        title: '合约设置',
        auth: ['1104', '1110']
      },
      {
        path: ['creditOrder'],
        title: 'U币贷订单',
        auth: ['1116']
      },
      {
        path: 'creditRepayment',
        title: '还款记录',
        auth: ['1122']
      },
      {
        path: 'creditBorrow',
        title: '借款记录',
        auth: ['1125']
      }
    ]
  },
  {
    icon: 'credit-card',
    title: 'YouBank全球付卡',
    key: 'globalCard',
    auth: ['1304', '1310', '1315', '1322'],
    children: [
      {
        path: ['globalCardList', 'globalCardDetail'],
        title: 'YouBank全球付卡',
        auth: ['1304']
      },
      {
        path: ['globalCardSet'],
        title: '全球付卡设置',
        auth: ['1310', '1315', '1322']
      }
    ]
  },
  {
    icon: 'search',
    title: '发现',
    key: 'find',
    auth: ['1204', '1211', '1218'],
    children: [
      {
        path: ['findAdvertLink'],
        title: '广告图与链接设置',
        auth: ['1204', '1211', '1218']
      }
    ]
  },
  {
    icon: 'number',
    title: '参数设置',
    key: 'params',
    auth: ['6004', '6009', '6016', '6023'],
    children: [
      {
        path: 'systemParam',
        title: '系统参数',
        auth: ['6023']
      },
      {
        path: 'rewardSet',
        title: '奖金参数',
        auth: ['6004']
      },
      {
        path: 'giveIssue',
        title: '赠送充值发放',
        auth: ['6009']
      },
      {
        path: 'teamLeader',
        title: '团队长设置',
        auth: ['6016']
      }
    ]
  },
  {
    icon: 'setting',
    title: '系统设置',
    key: 'system',
    auth: ['7004', '7011'],
    children: [
      {
        path: 'message',
        title: '公告消息',
        auth: ['7004']
      },
      {
        path: 'appVersion',
        title: 'APP版本号',
        auth: ['7011']
      }
    ]
  },
  {
    icon: 'lock',
    title: '权限设置',
    key: 'permission',
    auth: ['8004', '8012', '8019'],
    children: [
      {
        path: 'managerList',
        title: '管理员列表',
        auth: ['8004']
      },
      {
        path: ['roleList', 'editRole'],
        title: '角色列表',
        auth: ['8012']
      },
      {
        path: 'log',
        title: '操作日志',
        auth: ['8019']
      }
    ]
  },
  {
    icon: 'user',
    title: '个人中心',
    key: 'person',
    children: [
      {
        path: ['fileDownload'],
        title: '文件下载'
      }
    ]
  },
]

class leftbar extends Component {
  constructor(props) {
    super(props)

    // 路由对应的展示的菜单key值
    let openkeys = {}
    list.forEach(v => {
      v.children.forEach(w => {
        if (typeof w.path === 'string') {
          openkeys[w.path] = v.key
        } else {
          w.path.forEach(u => {
            openkeys[u] = v.key
          })
        }
      })
    })

    this.state = {
      openkeys: openkeys // 路由对应的展示的菜单key值
    }
  }

  static contextType = MyContext

  // 跳转页面
  toPage = (menuItem) => {
    this.props.history.push('/' + menuItem.key)
  }

  // 判断是否有权限
  hasAuth = (authList = [], auth) => {
    let flag = false
    if (auth) {
      for (let i = 0; i < authList.length; i++) {
        if (auth.filter(w => +w === +authList[i]).length) {
          flag = true
          break
        }
      }
    } else {
      flag = true
    }
    return flag
  }

  // 渲染
  render() {
    const {authList} = this.context // 当前用户权限
    const {openkeys} = this.state
    const {loading} = this.props

    // 获取当前url对应的页面的路由名称
    const pathStr = this.props.location.pathname
    let reg =/^\/(\w+)/.exec(pathStr)
    const thisPath = reg ? reg[1] : ''

    // 判断当前菜单高亮显示
    const activePath = (subItem) => {
      let path = subItem.path
      if (typeof path === 'string') {
        return thisPath === path
      } else {
        return !!path.filter(v => v === thisPath).length
      }
    }

    return (
    	<div className="leftbar">
        {
          loading ?
          <div className="spin">
            <Spin size="large" />
          </div>
          :
          <Menu
            onClick={this.toPage}
            defaultOpenKeys={[openkeys[thisPath]]}
            mode="inline">
            {
              list.map(item => (
                this.hasAuth(authList, item.auth) && 
                <SubMenu key={item.key} title={<span><Icon type={item.icon} /><span title={item.title}>{item.title}</span></span>}>
                  {
                    item.children.map(subItem => (
                      this.hasAuth(authList, subItem.auth) &&
                      <Menu.Item 
                        title={subItem.title}
                        className={{'active': activePath(subItem) }}
                        key={typeof subItem.path === 'string' ? subItem.path : subItem.path[0]}>
                        {subItem.title}
                      </Menu.Item>
                    ))
                  }
                </SubMenu>
              ))
            }
          </Menu>
        }
    	</div>
    );
  }
}

export default withRouter(leftbar)