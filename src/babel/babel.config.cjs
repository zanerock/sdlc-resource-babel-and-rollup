const { babelPresets, babelPlugins } = require('./babel-shared.config.cjs')

module.exports = function(api) {
  api.cache.invalidate(() => process.env.NODE_ENV === 'production')

  const config = {
    assumptions : {
      privateFieldsAsProperties : true,
      setPublicClassFields      : true
    },
    presets : babelPresets,
    plugins : babelPlugins
  }

  if (process.env.NODE_ENV === 'test') {
    config.sourceMaps = 'inline'
  }

  return config
}
