import React from 'react'
import ReactDOM from 'react-dom'
import './plugins'
import App from './app'
import './assets/css/index.scss'

import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

ReactDOM.render(<LocaleProvider locale={zh_CN}><App /></LocaleProvider>, document.getElementById('root'))

// 热更新
// if (module.hot) {
//   module.hot.accept()
// }