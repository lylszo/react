import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from "react-router-dom"

import Layout from './components/layout'
import Login from './components/login'

export default class extends Component {
  // 渲染
	render () {
		return (
			<BrowserRouter>
				<Switch>
				  <Route path='/login' component={ Login } />
				  <Route path='/' component={ Layout } />
				</Switch>
			</BrowserRouter>
		)
	}
}