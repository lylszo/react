import React, { Component } from 'react'
import { findLinkAdd, findLinkEdit, findLinkList, findLinkDel } from '@/axios'
import { Table, Form, Input, Button, Modal, message, Upload, Icon, Radio, Select } from 'antd'
import { f_findPlatformType, ObjToArr } from '@/tool/filter'
import { getNaturalSize } from '@/tool/method'
import MyContext from '@/tool/context'

const confirm = Modal.confirm
const Option= Select.Option

// 添加商城弹框
const AddModal = Form.create({ name: 'addModal' })(
  class extends Component {

    state = {
      loading: false, // 上传图片loading
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onCancel, onOk, visible, confirmLoading, imgUrl, changeImgUrl, type, platformType, changePlatformType, typeName } = this.props
      const { loading } = this.state
      const title = `添加（${typeName}）`

      // 上传logo前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      const checkSize = (rule, value, callback) => {
        getNaturalSize(this.refs.addImg || {}).then(data => {
          if (data.width/data.height !== 1) {
            callback('图片比例应该为1:1')
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      }

      return (
        <Modal
          title={title}
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={onOk}
          maskClosable={false}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 17}} onSubmit={this.handleSubmit} >
            <Form.Item label="logo">
              {getFieldDecorator('logo', {
                initialValue: '',
                rules: [
                  {required: true, message: '请上传logo'},
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
                    file.logo = file.response.key
                    file.logoUrl = file.response.url
                    changeImgUrl(file.logoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  name="file"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        (imgUrl && !loading) ?
                        <img alt="加载失败" src={imgUrl} width="54" height="54" ref="addImg" />
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="标题">
              {getFieldDecorator('title', {
                rules: [
                  {required: true, message: '请输入标题'}
                ]
              })(
                <Input placeholder="标题" />
              )}
            </Form.Item>
            <Form.Item label="平台类型">
              {getFieldDecorator('platformType', {
                initialValue: '0',
                getValueFromEvent: val => {
                  changePlatformType(val)
                  return val
                }
              })(
                <Select>
                  {
                    ObjToArr(f_findPlatformType).map(item => {
                      return <Option value={item.id} key={item.id}>{item.name}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            {
              +platformType !== 0 &&
              <Form.Item label="是否需要授权">
                {getFieldDecorator('isBound', {
                  initialValue: false,
                  rules: [
                    {required: true, message: '请选择是否需要授权'}
                  ]
                })(
                  <Radio.Group>
                    <Radio value={true}>是</Radio>
                    <Radio value={false} className="ml30">否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            }
            {
              +type > 1 &&
              <Form.Item label="简介">
                {getFieldDecorator('content', {
                  rules: [
                    {required: true, message: '请输入简介'}
                  ]
                })(
                  <Input placeholder="简介" />
                )}
              </Form.Item>
            }
            <Form.Item label="跳转链接">
              {getFieldDecorator('url', {
                initialValue: ''
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

// 编辑商城弹框
const EditModal = Form.create({ name: 'editModal' })(
  class extends Component {

    state = {
      loading: false, // 上传图片loading
    }

    // 渲染
    render() {
      const { getFieldDecorator } = this.props.form
      const { onCancel, onOk, visible, confirmLoading, item, imgUrl, changeImgUrl, type, platformType, changePlatformType, typeName } = this.props
      const { loading } = this.state
      const title = `编辑${typeName}（ID：${item.id}）`
    
      // 上传logo前处理
      function beforeUpload(file) {
        const limit = file.size / 1024 / 1024 < 5;
        if (!limit) {
          message.error('图片大小不能超过5M!');
        }
        return limit;
      }

      const checkSize = (rule, value, callback) => {
        getNaturalSize(this.refs.editImg || {}).then(data => {
          if (data.width/data.height !== 1) {
            callback('图片比例应该为1:1')
          } else {
            callback()
          }
        }).catch(() => {
          callback()
        })
      }

      return (
        <Modal
          title={title}
          visible={visible}
          maskClosable={false}
          confirmLoading={confirmLoading}
          onOk={onOk}
          onCancel={onCancel}>
          <Form labelCol={{span: 6}} wrapperCol={{span: 17}} onSubmit={this.handleSubmit} >
            <Form.Item label="logo">
              {getFieldDecorator('logo', {
                initialValue: [{logo: item.logo, logoUrl: item.logoUrl}],
                rules: [
                  {required: true, message: '请上传logo'},
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
                    file.logo = file.response.key
                    file.logoUrl = file.response.url
                    changeImgUrl(file.logoUrl || '')
                    this.setState({loading: false})
                  }
                  return file ? [file] : ''
                }
              })(
                <Upload
                  key={item.id}
                  name="file"
                  action="/api/file/upload"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  headers={{Authorization: 'Bearer ' + sessionStorage.getItem('token')}}
                  listType="picture-card">
                    <div className="tac">
                      {
                        ((imgUrl || item.logoUrl) && !loading) ?
                        <img alt="加载失败" src={imgUrl || item.logoUrl} ref="editImg" width="54" height="54" />
                        :
                        <Icon type={loading ? 'loading' : 'plus'} className="fs24"/>
                      }
                    </div>
                </Upload>
              )}
            </Form.Item>
            <Form.Item label="标题">
              {getFieldDecorator('title', {
                initialValue: item.title || '',
                rules: [
                  {required: true, message: '请输入标题'}
                ]
              })(
                <Input placeholder="标题" />
              )}
            </Form.Item>
            {
              +type > 1 &&
              <Form.Item label="简介">
                {getFieldDecorator('content', {
                initialValue: item.content || '',
                  rules: [
                    {required: true, message: '请输入简介'}
                  ]
                })(
                  <Input placeholder="简介" />
                )}
              </Form.Item>
            }
            <Form.Item label="平台类型">
              {getFieldDecorator('platformType', {
                initialValue: item.platformType || '0',
                getValueFromEvent: val => {
                  changePlatformType(val)
                  return val
                }
              })(
                <Select>
                  {
                    ObjToArr(f_findPlatformType).map(item => {
                      return <Option value={item.id} key={item.id}>{item.name}</Option>
                    })
                  }
                </Select>
              )}
            </Form.Item>
            {
              +platformType !== 0 &&
              <Form.Item label="是否需要授权">
                {getFieldDecorator('isBound', {
                  initialValue: item.isBound || false,
                  rules: [
                    {required: true, message: '请选择是否需要授权'}
                  ]
                })(
                  <Radio.Group>
                    <Radio value={true}>是</Radio>
                    <Radio value={false} className="ml30">否</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            }
            <Form.Item label="跳转链接">
              {getFieldDecorator('url', {
                initialValue: item.url || '',
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
    tableLoading: false, // 列表请求loading
    currentParams: {}, // 当前查询参数
    currentItem: {}, // 当前编辑项
    addVisible: false, // 是否显示添加商城弹框
    addLoading: false, // 添加商城弹框确认loading
    editVisible: false, // 是否显示编辑商城弹框 
    editLoading: false, // 编辑商城弹框确认loading 
    imgUrl: '', // 添加或者编辑弹框上传图片后的url
    type: '2', // 当前编辑的功能区类别
    platformType: '0', // 平台类型
    typeName: '添加商城', // 当前商城名字
  }

  // 获取列表
  getList = (type) => {
    this.setState({tableLoading: true})
    findLinkList().then(data => {
      let arr = data.data.items || []
      this.setState({
        tableList: arr,
        tableLoading: false
      })
    }).catch(() => {
      this.setState({tableList: [], tableLoading: false})
    })         
  }

  // 整理列表项
  getColumns(linkType) {
    let columns = [
      {
        title: '编号',
        dataIndex: 'id'
      },{
        title: 'logo',
        dataIndex: 'logoUrl',
        render: text => (
          <img src={text || ''} alt="加载失败" width="80" height="80" style={{border: '1px solid #ccc', borderRadius: '2px'}} />
        )
      }, {
        title: '标题',
        render: item => {
         let txt = item.title || ''
         if (txt.length > 30) {
           return <span title={txt}>{txt.slice(0, 30) + '...'}</span>
         } else {
           return txt
         }
        }
      }, {
        title: '简介',
        render: item => {
         let txt = item.content || ''
         if (txt.length > 20) {
           return <span title={txt}>{txt.slice(0, 20) + '...'}</span>
         } else {
           return txt
         }
        }
      }, {
        title: '平台类型',
        dataIndex: 'platformType',
        render: text => f_findPlatformType[text] || '-'
      }, {
        title: '是否需要授权',
        dataIndex: 'isBound',
        render: text => text ? '是' : '否'
      }, {
        title: '跳转链接',
        render: item => {
         let txt = item.url || ''
         if (txt.length > 80) {
           return <a title={txt} href={txt} target="_blank" rel="noopener noreferrer">{txt.slice(0, 80) + '...'}</a>
         } else {
           return txt ? <a href={txt} target="_blank" rel="noopener noreferrer">{txt}</a> : '-'
         }
        }
      }
    ]

    if (+linkType === 1) {
      columns.splice(3, 1)
    }

    const {authList} = this.context
    let auth1 = !!authList.filter(v => +v === 1214).length // 编辑权限
    let auth2 = !!authList.filter(v => +v === 1215).length // 删除权限

    if (auth1 || auth2) {
      columns.push({
        title: '操作',
        width: (auth1 && auth2) ? 120 : 80,
        render: item => {
          return (
            <div>
              {
                auth1 &&
                <Button size="small" onClick={() => this.openEdit(item, linkType)}>编辑</Button>
              }
              {
                auth2 &&
                <Button size="small" type="danger" onClick={() => this.del(item, linkType)}>删除</Button>
              }
            </div>
          )
        }
      })
    }

    return columns
  }

  // 打开编辑窗口
  openEdit = (item, linkType) => {
    this.setState({currentItem: item, editVisible: true, type: linkType, platformType: item.platformType})
  }

  // 编辑商城确定
  onOkEdit = () => {
    const {currentItem, tableList, type} = this.state
    this.refs.editModal.validateFields((err, values) => {
      if (err) {
        return
      }
      let params = {...values, id: currentItem.id, type}
      params.logo = values.logo[0].logo
      if (!+params.platformType) {
        params.isBound = false
      }
      this.setState({editLoading: true})
      findLinkEdit(params).then(() => {
        const tableList2 = [...tableList]
        tableList2.forEach((v) => {
          if (+v.id === +type) {
            v.items.forEach((w, i, a) => {
              if (+w.id === +currentItem.id) {
                for(let i in values) {
                  w[i] = values[i]
                }
                w.logo = values.logo[0].logo
                w.logoUrl = values.logo[0].logoUrl
              }              
            })
          }
        })
        this.setState({editLoading: false, tableList: tableList2})
        this.onCancelEdit()
        message.success('编辑成功！')
      }).catch(() => {
        this.setState({editLoading: false})
      })
    })
  }

  // 编辑商城取消
  onCancelEdit = () => {
    this.refs.editModal.resetFields()
    this.setState({editVisible: false, imgUrl: '', platformType: '0'})
  }

  // 打开添加窗口
  openAdd = (type, typeName) => {
    this.setState({type, typeName, addVisible: true})
  }

  // 添加商城确定
  onOkAdd = () => {
    const {type} = this.state
    this.refs.addModal.validateFields((err, values) => {
      if (err) {
        return
      }
      if (!values.logo) {
        message.warning('请上传logo')
        return
      }
      let params = {...values, type}
      params.logo = params.logo[0].logo
      if (!+params.platformType) {
        params.isBound = false
      }
      this.setState({addLoading: true})
      findLinkAdd(params).then(() => {
        this.getList(type)
        this.setState({addLoading: false})
        this.onCancelAdd()
        message.success('添加成功！')
      }).catch(() => {
        this.setState({addLoading: false})
      })
    })
  }

  // 添加商城取消
  onCancelAdd = () => {
    this.refs.addModal.resetFields()
    this.setState({addVisible: false, imgUrl: '', platformType: '0'})
  }

  // 删除商城
  del = (item, linkType) => {
    confirm({
      title: `确定删除编号为${item.id}的链接吗？`,
      onOk:() => {
        return new Promise((resolve, reject) => {
          findLinkDel(item.id).then(() => {
            let tableList2 = [...this.state.tableList]
            tableList2.forEach((v) => {
              if (+v.id === +linkType) {
                v.items.forEach((w, i, a) => {
                  if (+w.id === +item.id) {
                    a.splice(i, 1)
                  }                  
                })
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

  // 修改默认平台类型
  changePlatformType = (platformType) => {
    this.setState({platformType})
  }

  // 渲染前
  componentWillMount() {
    this.getList()
  }

  // 渲染
  render() {
    const {
      tableList,
      tableLoading,
      addVisible,
      addLoading,
      editVisible,
      editLoading,
      currentItem,
      type,
      imgUrl,
      platformType,
      typeName,
    } = this.state
    const {authList} = this.context

    return (
      <div>
        {
          tableList.map(v => (
            <div key={v.id} className="pt10">
              <div>
                {
                  !!authList.filter(v => +v === 1213).length &&
                  <div className="fr mb5">
                    <Button onClick={this.openAdd.bind(this, v.id, v.name)}>添加</Button>
                  </div>          
                }
                <div className="fs16 bold mb10">{v.name}</div>                
              </div>
              <Table
                className="mb30"
                pagination={false}
                loading={tableLoading}
                rowKey={(record, i) => i}
                dataSource={v.items || []}
                columns={this.getColumns(v.id)} />
            </div>
          ))
        }
        {/* 添加商城弹框 */}
        <AddModal
          ref="addModal"
          onOk={this.onOkAdd}
          onCancel={this.onCancelAdd}
          visible={addVisible}
          item={currentItem}
          type={type}
          imgUrl={imgUrl}
          typeName={typeName}
          platformType={platformType}
          changePlatformType={this.changePlatformType}
          changeImgUrl={this.changeImgUrl}
          confirmLoading={addLoading} />

        {/* 编辑商城弹框 */}
        <EditModal
          ref="editModal"
          onOk={this.onOkEdit}
          onCancel={this.onCancelEdit}
          visible={editVisible}
          item={currentItem}
          type={type}
          typeName={typeName}
          imgUrl={imgUrl}
          platformType={platformType}
          changePlatformType={this.changePlatformType}
          changeImgUrl={this.changeImgUrl}
          confirmLoading={editLoading} />
      </div>
    );
  }
}