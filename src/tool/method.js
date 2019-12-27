/* 公用方法 */

// 上传图片获取图片尺寸
export const getNaturalSize = (DomElement) => {
  return new Promise(function (resolve, reject) {
    var natureSize = {}
    var img = new Image()
    img.src = DomElement.src
    if (DomElement.src) {
      img.onload = function () {
        natureSize.width = img.width
        natureSize.height = img.height
        resolve(natureSize)
      }
    } else {
      reject('尺寸获取失败')
    }
  })
}