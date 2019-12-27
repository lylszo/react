const { override, fixBabelImports, addLessLoader, addWebpackAlias } = require('customize-cra')
const path = require('path')

const webpackConfig = () => config => {
  if (process.env.NODE_ENV === 'production') {
    config.devtool = false
  }
  // config.output.path = path.join(__dirname, '/dist')
  // console.log(config)
  // console.log(process.env)
  return config;
}

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
 	addLessLoader({
	  javascriptEnabled: true,
	  modifyVars: { '@primary-color': '#20232a'}
	}),
  addWebpackAlias({
    ["@"]: path.resolve(__dirname, "src")
  }),
  webpackConfig()
)
