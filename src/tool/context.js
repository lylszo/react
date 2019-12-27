// 全局context
import React from 'react'

export default React.createContext({
  userInfo: {}, // 用户信息
  authList: {}, // 当前权限列表
})