import { initCaptcha } from '../axios'

// 极验封装Promise
export default () => {
  return new Promise((resolve, reject) => {
    initCaptcha().then((data) => {
      const result = data.data
      window.initGeetest({
        gt: result.gt,
        challenge: result.challenge,
        offline: !result.success,
        product: 'bind',
        width: "100%"
      }, function(captchaObj) {
        captchaObj.onReady(function() {
          captchaObj.verify();
        }).onSuccess(function(){
          let validate = captchaObj.getValidate();
          resolve(validate)
        }).onClose(function() {
          reject()
        }).onError(function() {
          reject()
        })
      });        
    }).catch((err) => {
      reject(err)
    })
  })
}