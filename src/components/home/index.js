import React, { Component } from 'react';
import './index.scss'

export default class extends Component {
  // 渲染
  render() {
    return (
    	<div className="pro-index">
    		<div className="pageTitle">首页</div>
        <div className="content">
          <h1>Welcome to the Management Platform!</h1>
        </div>
    	</div>
    );
  }
}