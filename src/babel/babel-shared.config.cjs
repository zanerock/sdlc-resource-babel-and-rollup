const readFileSync = require('node:fs').readFileSync
const join = require('node:path').join

const findRoot = require('find-root')
const semver = require('semver')

const NODE_ENV = process.env.NODE_ENV

const presetEnvOptions = { modules : NODE_ENV === 'test' ? 'commonjs' : false }

const npmRoot = findRoot(process.cwd())
const pkgJSON = JSON.parse(readFileSync(join(npmRoot, 'package.json'), { encoding : 'utf8' }))

const engineSpec = pkgJSON.engines || {}
const engineTargets = {}
for (const engine of Object.keys(engineSpec)) {
  const targetVer = semver.minVersion(engineSpec[engine]).raw
  engineTargets[engine] = targetVer
}
if (Object.keys(engineTargets).length > 0) {
  Object.assign(presetEnvOptions, { targets : engineTargets })
}

const pkgOverrides = (pkgJSON['catalyst-scripts'] && pkgJSON['catalyst-scripts']['preset-env']) || {}
Object.assign(presetEnvOptions, pkgOverrides)

const babelPresets = [
  // in testing, we output each file, so we need to convert 'imports', in production, we let rollup handle the imports
  ['@babel/preset-env', presetEnvOptions]
]
/*
if (pkglib.target.isReactish) {
  babelPresets.push('@babel/preset-react')
} */

const babelPlugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-optional-chaining',
  '@babel/plugin-proposal-throw-expressions',
  '@babel/plugin-transform-private-methods',
  ['@babel/plugin-transform-runtime',
    { corejs : false, helpers : true, regenerator : true }
  ],
  '@babel/plugin-syntax-import-assertions',
  'inline-json-import'
]

module.exports.babelPresets = babelPresets
module.exports.babelPlugins = babelPlugins
