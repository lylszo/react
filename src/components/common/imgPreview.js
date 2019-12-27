import React, { Component } from 'react'
import  { Modal, Icon } from 'antd'
import './imgPreview.scss'

export default class extends Component {
  constructor(props) {
    super(props)

    let {imgList} = this.props
    let id = this.props.id
    let imgObj = {}
    let index = 0
    if (imgList && imgList.length) {
      imgList.forEach((v, i) => {
        imgObj[v.id] = v.url
        if (v.id === this.props.id) {
          index = i
        }
      })      
    }

    this.state = {
      previewVisible: false, // 是否显示预览弹框
      previewImage: '', // 预览图片URL
      currentId: id, // 如果传图片列表，表示当前显示图片对应的id
      imgObj, // 图片列表对应的对象，便于取值
      index, // 当前图片对应的索引
    }
  }
  
  // 点击图片预览
  handlePreview = (url) => {
    if (url) {
      this.setState({previewVisible: true, previewImage: url})
    } else {
      this.setState({previewVisible: true})
    }
  }

  // 关闭预览
  handleCancel = () => {
    this.setState({previewVisible: false})
  }

  // 切换图片
  changeUrl = (type) => {
    const {imgList} = this.props
    const {currentId} = this.state
    if (imgList.length > 1) {
      imgList.forEach((v, i) => {
        if (v.id === currentId) {
          if (type === 'left') {
            let idx = (i - 1) < 0 ? (imgList.length - 1) : (i - 1)
            this.setState({currentId: imgList[idx].id, index: idx})
          } else {
            let idx = (i + 1) >= imgList.length  ? 0 : (i + 1)
            this.setState({currentId: imgList[idx].id, index: idx})
          }
        }
      })      
    }
  }

  // 渲染
  render () {
    const {url, borderColor, imgList, id} = this.props // imgList是图片列表，列表项必须包含唯一标识id和对应的图片路径url，如[{id: 1, url: 'url1'}, {id: 2, url: 'url2'}]
    const {previewVisible, previewImage, currentId, imgObj, index} = this.state

    return (
      <div className="imgPreview" style={{borderColor}}>
        {
          imgList && imgList.length ?
          <div>
            <img className="img" src={imgObj[id]} onClick={() => this.handlePreview()} alt="加载失败"/>
            <Modal className="imgPreviewModal" visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <a href={imgObj[currentId]} rel="noopener noreferrer" target="_blank">
                <img alt="加载失败" src={imgObj[currentId]} />
              </a>
              <div className="arrow">
                <Icon type="left" title="上一张" className="left" onClick={() => {this.changeUrl('left')}}/>
                <Icon type="right" title="下一张" className="right" onClick={() => {this.changeUrl('right')}}/>
              </div>
              <div className="num">
                {index + 1} / {imgList.length}
              </div>
            </Modal>
          </div>
          :
          <div>
            <img className="img" src={url} onClick={() => this.handlePreview(url)} alt="加载失败"/>
            <Modal className="imgPreviewModal" visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <a href={previewImage} rel="noopener noreferrer" target="_blank">
                <img alt="加载失败" src={previewImage} />
              </a>
            </Modal>
          </div>
        }
      </div>
    )
  }
}