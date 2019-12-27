import React, { Component } from 'react'
import expressionNameList from '@/assets/js/expressionName'

export default class extends Component {

  // 渲染
  render () {
    const {msg} = this.props // msg是消息内容
    let reg = new RegExp(`${expressionNameList.join('|')}`, 'g')
    let arr = String(msg).split(reg).filter(v => v)
    return (
      <div className="pr30" style={{wordBreak: 'break-all', wordwrap: 'break-word'}}>
        {
          arr.map((v, i) => (
            new RegExp(`${expressionNameList.join('|')}`, 'g').test(v) ? 
            <img src={require(`@/assets/img/expression/${v}.png`)} style={{verticalAlign: 'text-bottom', margin: '0 1px'}} alt={v || '表情'} width="20" height="20" key={i}/>
            :
            <span key={i}>{v}</span>))
        }       
      </div>
    )
  }
}