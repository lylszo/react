import React, { Component } from 'react'
import { findAdvertAdd, findAdvertEdit, findAdvertList, findAdvertDel } from '@/axios'
import { Table, Form, Input, Button, message, Modal, Upload, Icon } from 'antd'
import { getNaturalSize } from '@/tool/method'
import ImgPreview from '@/components/common/imgPreview'
import MyContext from '@/tool/context'

const confirm = Modal.confirm

// 添加广告图弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {

    state = {
      loading: false, // 上传图片loading
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, changeImgUrl, imgUrl } = this.props
      const { loading } = this.state

      // 上传前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      const checkSize = (rule, value, callback) => {
        getNaturalSize(this.refs.addImg || {}).then(data => {
          if (data.width/data.height !== 2.5) {
            callback('图片比例应该为5:2')
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      }

      return (
        <Modal
          width="580px"
          title='添加广告图'
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="广告图">
              {getFieldDecorator('photo', {
                initialValue: '',
                rules: [
                  {required: true, message: '请上传广告图'},
                  {validator: checkSize}
                ],
                valuePropName: 'fileList',
                getValueFromEvent: ({file}) =>{
                  if (file.status === 'uploading') {
                    this.setState({ loading: true });
                  } else if (file.status === 'error') {
                    this.setState({loading: false})
                    message.error(file.response.message)
                  } else if (file.status === 'done') {
                    file.photo = file.response.key
                    file.photoUrl = file.response.url
                    changeImgUrl(file.photoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  name="file"
                  className="advert"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        (imgUrl && !loading) ?
                        <img alt="加载失败" src={imgUrl} width="190" height="94" ref="addImg" />
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="编号">
              {getFieldDecorator('adId', {
                rules: [
                  {required: true, message: '请输入编号'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="编号" />
              )}
            </Form.Item>
            <Form.Item label="跳转链接">
              {getFieldDecorator('url')(
                <Input placeholder="跳转链接" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

// 编辑广告图弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {

    state = {
      loading: false, // 上传图片loading
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onOk, onCancel, visible, confirmLoading, currentItem, changeImgUrl, imgUrl } = this.props
      const { loading } = this.state
      let title = `编辑广告图（ID：${currentItem.id}）`

      // 上传前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      const checkSize = (rule, value, callback) => {
        getNaturalSize(this.refs.editImg || {}).then(data => {
          if (data.width/data.height !== 2.5) {
            callback('图片比例应该为5:2')
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      }

      return (
        <Modal
          width="580px"
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 16}} onSubmit={this.handleSubmit} >
            <Form.Item label="广告图">
              {getFieldDecorator('photo', {
                initialValue: [{photo: currentItem.photo, photoUrl: currentItem.photoUrl}],
                rules: [
                  {required: true, message: '请上传广告图'},
                  {validator: checkSize}
                ],
                valuePropName: 'fileList',
                getValueFromEvent: ({file}) =>{
                  if (file.status === 'uploading') {
                    this.setState({ loading: true });
                  } else if (file.status === 'error') {
                    this.setState({loading: false})
                    message.error(file.response.message)
                  } else if (file.status === 'done') {
                    file.photo = file.response.key
                    file.photoUrl = file.response.url
                    changeImgUrl(file.photoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  name="file"
                  className="advert"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        ((imgUrl || currentItem.photoUrl) && !loading) ?
                        <img alt="加载失败" src={imgUrl || currentItem.photoUrl} width="190" height="94" ref="editImg"/>
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="编号">
              {getFieldDecorator('adId', {
                initialValue: currentItem.adId || '',
                rules: [
                  {required: true, message: '请输入编号'},
                  {pattern: /^\d*$/, message: '请输入数字'}
                ]
              })(
                <Input placeholder="编号" />
              )}
            </Form.Item>
            <Form.Item label="跳转链接">
              {getFieldDecorator('url', {
                initialValue: currentItem.url || ''
              })(
                <Input placeholder="跳转链接" />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

export default class extends Component {
  static contextType = MyContext

  // 状态
  state = {
    tableList: [], // 列表数据
    meta: {}, // 请求列表信息
    currentPage: 1, // 当前页码
    tableLoading: false, // 列表请求loading
    currentParams: {}, // 当前查询参数
    addVisible: false, // 是否显示添加弹框
    addLoading: false, // 添加弹框确定loading
    editVisible: false, // 是否显示编辑弹框
    editLoading: false, // 编辑弹框确定loading
    currentItem: {}, // 当前操作项
    imgUrl: '', // 添加或者编辑弹框上传图片后的url
  }

  // 获取列表
  getList = (page) => {
    let params = {...this.state.currentParams, page: page, pageSize: 10, position: '2'}
    this.setState({tableLoading: true, currentPage: page})
    findAdvertList(params).then(data => {
      this.setState({
        currentParams: params,
        tableList: data.data.items,
        meta: data.data.meta || {},
        tableLoading: false
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })
  }

  // 删除广告图
  del = item => {
    confirm({
      title: `确定删除ID为${item.id}的广告图吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          findAdvertDel(item.id).then(() => {
            let tableList2 = this.state.tableList.concat()
            tableList2.forEach((v, i, a) => {
              if (v.id === item.id) {
                a.splice(i, 1)
              }
            })
            this.setState({tableList: tableList2})
            resolve()
            message.success(`已删除！`)
          }).catch(() => {
            reject()
          })       
        })

      }
    })
  }

  // 修改上传图片url
  changeImgUrl = (url) => {
    this.setState({imgUrl: url})
  }

  // 整理列表项
  getColumns() {
    let list = [
      {
        title: 'ID',
        dataIndex: 'id',
        render: (text) => (text || '-')
      },
      {
        title: '编号',
        dataIndex: 'adId',
        render: (text) => (text || '-')
      }, {
        title: '图片',
        dataIndex: 'photoUrl',
        render: (text) => (
          <div style={{width: '250px', height: '100px'}} className="dib">
            <ImgPreview url={text} borderColor="#ccc"/>
          </div>
        )
      }, {
        title: '跳转链接',
        dataIndex: 'url',
        render: (text) => {
          if (text && text.length) {
            let url = text
            if (text.length > 80) {
              url = text.slice(0, 80) + '...'
            }
            return <a href={text} target="_blank" rel="noopener noreferrer" title={text}>{url}</a>
          } else {
            return '-'
          }
        }
      }
    ]

    const {authList} = this.context
    const auth1 = !!authList.filter(v => +v === 1318).length // 编辑广告图权限
    const auth2 = !!authList.filter(v => +v === 1319).length // 删除广告图权限
    if (auth1 || auth2) {
      list.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        fixed: 'right',
        render: item => {
          return (
            <div>
              {auth1 && <Button size="small" onClick={() => this.edit(item)}>编辑</Button>}
              {auth2 && <Button type="danger" size="small" onClick={() => this.del(item)}>删除</Button>}              
            </div>
          )
        }
      })
    }

    return list
  }

  // 编辑广告图打开弹框
  edit = item => {
    this.setState({currentItem: item, editVisible: true})
  }

  // 编辑广告图确定
  onOkEdit = () => {
    const {tableList, currentItem} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, id: currentItem.id, position: '2'}
      params.photo = values.photo[0].photo
      this.setState({editLoading: true})
      findAdvertEdit(params).then(() => {
        let tableList2 = [...tableList]
        tableList2.forEach(v => {
          if (v.id === currentItem.id) {
            for(let i in values) {
              v[i] = values[i]
            }
            v.photoUrl = values.photo[0].photoUrl
            v.photo = values.photo[0].photo
          }
        })
        this.setState({tableList: tableList2, editLoading: false})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑广告图取消
  onCancelEdit = () => {
    this.setState({editVisible: false, imgUrl: ''})
    this.refs.editModal.resetFields()
  }

  // 添加广告图确定
  onOkAdd = () => {
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, position: '2'}
      params.photo = values.photo[0].photo
      this.setState({addLoading: true})
      findAdvertAdd(params).then(() => {
        this.getList(1)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加广告图取消
  onCancelAdd = () => {
    this.setState({addVisible: false, imgUrl: ''})
    this.refs.addModal.resetFields()
  }

  // 渲染前
  componentWillMount() {
    this.getList(1)
  }

  // 渲染
  render() {
    const {
      tableList,
      meta,
      tableLoading,
      currentPage,
      addVisible,
      addLoading,
      editVisible,
      editLoading,
      currentItem,
      imgUrl,
    } = this.state
    const pageSet = {
      showQuickJumper: true,
      defaultCurrent: 1,
      total: meta.totalCount,
      onChange: this.getList,
      current: currentPage,
      showTotal: total => `共${total}条`,
      size: 'small'
    }
    const {authList} = this.context

    return (
      <div>
        {
          !!authList.filter(v => +v === 1317).length &&
          <div className="clearfix">
            <div className="fr mb5">
              <Button onClick={() => this.setState({addVisible: true})}>添加</Button>
            </div>
          </div>          
        }
        <Table
          loading={tableLoading}
          rowKey={(record, i) => i}
          dataSource={tableList}
          pagination={pageSet}
          columns={this.getColumns()} />

        {/* 添加广告图弹框 */}
        <AddModal
          ref="addModal"
          changeImgUrl={this.changeImgUrl}
          imgUrl={imgUrl}
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          confirmLoading={addLoading} />

        {/* 编辑广告图弹框 */}
        <EditModal
          ref="editModal"
          changeImgUrl={this.changeImgUrl}
          imgUrl={imgUrl}
          currentItem={currentItem}
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          confirmLoading={editLoading} />
      </div>
    );
  }
}