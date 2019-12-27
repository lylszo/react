import axios from 'axios'
import { message } from 'antd'

axios.defaults.baseURL = '/api'
axios.defaults.timeout = 300000

// 给请求头添加 token
export function setAuthHeader(token) {
  const token2 = token || sessionStorage.getItem('token')
  if (token2) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }
}

// 请求头删除 token
export function clearAuthHeader() {
  delete axios.defaults.headers.common['Authorization'];
}

// Post请求
export function encapPost(url, param, header) {
  return new Promise(function (resolve, reject) {
    try {
      let config
      if (header) {
        config = { headers: header }
      }
      axios.post(url, param, config).then((response) => {
        resolve(response)
      }).catch(function (error) {
        handleError(error, reject)
      });
    } catch (err) {
      reject(err || {})
    }
  });
}

// Get请求
export function encapGet(url, param, header) {
  return new Promise(function (resolve, reject) {
    try {
      let config = { params: param }
      if (header) {
        config.headers = header
      }
      axios.get( url, config).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        handleError(error, reject)
      })
    } catch (err) {
      reject(err || {})
    }
  })
}

// Delete请求
export function encapDelete(url, param) {
  return new Promise(function (resolve, reject) {
    try {
      axios.delete(url, { data: param }).then(function (response) {
        resolve(response)
      }).catch(function (error) {
        handleError(error, reject)
      });
    } catch (err) {
      reject(err || {})
    }
  });
}

// put请求
export function encapUpdate(url, param) {
  return new Promise(function (resolve, reject) {
    try {
      axios.put(url, param).then((response) => {
        resolve(response)
      }).catch(function (error) {
        handleError(error, reject)
      });
    } catch (err) {
      reject(err || {})
    }
  });
}

// 处理错误
function handleError (error, reject) {
  error.response = error.response || {}
  reject(error.response)
  if (error.response.status === 500 || error.response.status === 502 || error.response.status === 503) { // 服务异常
    message.error('服务异常，请稍后重试！')
  } else if (error.response.status === 403) { //403错误
    clearAuthHeader();
    sessionStorage.clear();
    message.error('账号已过期，请重新登录!')
    window.location.reload()
  } else { // 非以上直接提示后台信息
    message.error(error.response.data ? error.response.data.message : '')
  }
}
