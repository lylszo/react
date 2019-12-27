import React, { Component } from 'react'
import { Menu, Avatar, Dropdown, Icon, Modal} from 'antd'
import { withRouter } from "react-router-dom"
import { logout } from '@/axios'
import MyContext from '@/tool/context'
import './topbar.scss'

const confirm = Modal.confirm

class Topbar extends Component {
  static contextType = MyContext

  // 状态
  state = {
    light: false, // 账号信息是否高亮显示
  }

  // 下拉框状态展开账号高亮显示
  lightDropdown = (visible) => {
    this.setState({light: visible})
  }

  // 退出登录
  logoutModal = () => {
    confirm({
      title: '确定退出登录吗？',
      onOk:() => {
        return new Promise((resolve, reject) => {
          logout().then(() => {
            sessionStorage.clear()
            this.props.history.push('/login')
            resolve()
          }).catch(() => {
            reject()
          })
        })
      }
    })
  }

  // 渲染
  render() {
    const {light} = this.state
    const {userInfo} = this.context
    return (
      <div className="topbar">
        <div className="left" onClick={() => this.props.history.push('/')}>
          <img alt="logo" src={require('../../assets/img/logo.png')} />
          <h1>管理后台</h1>
        </div>
        <div className="right">
          <Dropdown 
            overlay={(
              <Menu>
                <Menu.Item onClick={() => this.props.history.push('/account')}>
                  <div><Icon type="setting" />账户设置</div>
                </Menu.Item>
                <Menu.Item onClick={this.logoutModal}>
                  <div><Icon type="logout" />退出登录</div>
                </Menu.Item>
              </Menu>
            )}
            onVisibleChange={this.lightDropdown}
            overlayClassName="userDropdown"
            placement="bottomRight">
            <div className={{user: true, active: light}}>
              <Avatar className="avatar" icon="user" /> 
              <span className="userName">{userInfo.account}</span>
              <Icon type="down" />                
            </div>
          </Dropdown>
        </div>
      </div>
    )
  }
}

export default withRouter(Topbar)