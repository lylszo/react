import React, { Component } from 'react'
import { getRolePermission, setRolePermission, getPermissions } from '@/axios'
import { Button, message, Tree, Spin } from 'antd'

const { TreeNode } = Tree

export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: props.location.state.id,
      name: props.location.state.name,
      allList: [], // 所有权限列表
      list: [], // 当前角色对应的权限,选中的key
      saveLoading: false, // 保存按钮的loading
      validAuth: {}, // 第四级有效权限码
    }
  }

  // 树结构数据
  renderTreeNodes = (data) => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      } else {
        return <TreeNode title={item.title} key={item.id} dataRef={item} />
      }
    })
  }

  // 保存所选权限
  save = () => {
    const {list, id, validAuth} = this.state
    const list2 = list.filter(v => validAuth[v])
    this.setState({saveLoading: true})
    setRolePermission({roleId: id, ids: list2}).then(() => {
      message.success('保存成功！')
      this.setState({saveLoading: false})
    }).catch(() => {
      this.setState({saveLoading: false})
    })
  }

  // 渲染前
  componentWillMount() {
    getPermissions().then(data => {
      let arr = data.data
      if (arr.length) {
        let arr1 = [...arr]
        arr.forEach(v => {
          arr1.forEach(w => {
            if (w.pid === v.id) {
              if (v.children) {
                v.children.push(w)
              } else {
                v.children = [w]
              }
            }
          })
        })
        let arr3 = arr.filter(v => v.pid === '0')
        let obj4 = {}
        arr.forEach(v => {
          if (!v.children) {
            obj4[v.id] = v.title
          }
        })
        this.setState({allList: arr3, validAuth: obj4})
      }
    })
    getRolePermission(this.state.id).then(data => {
      this.setState({list: data.data.ids})
    })
  }

  // 渲染
  render() {
    const {name, allList, list, saveLoading} = this.state

    return (
      <div>
        <div className="pageTitle">修改角色{name ? `（ ${name} ）` : ''}</div>

        <div>
          {
            allList.length ? (
              <Tree
                showLine
                checkable
                checkedKeys={list}
                onCheck={keys => this.setState({list: keys})}
                selectable={false}>
                {this.renderTreeNodes(allList)}
              </Tree>
            ) : (
              <Spin className="ml50" size="large" />
            )
          }
        </div>
        <Button
          style={{width: '150px', marginTop: '30px'}}
          onClick={this.save}
          size="large"
          loading={saveLoading}
          type="primary">保存</Button>
      </div>
    );
  }
}