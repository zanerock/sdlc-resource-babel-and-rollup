# Developer Notes

## Policy configuration notes

As noted in the [README.md polyfilles section](./README.md#polyfills), we were unable to find a configuration that actually optimized polyfills. Polyfills were included for both unused and unnecessary functions (that were natively supported in the targets). Hopefully the situation will be improved in Babel 8. To document what we tried:

- if 'core-js' is found in the target package's runtime dependencies, we tried:
  - setting '@babel/plugin-transform-runtime' configuration `corejs` to the discovered version,
  - setting the '@babel/preset-env' `useBuiltIns` to `true` and `corejs` to the discover version,
  - adding 'babel-plugin-polyfill-corejs3', setting `version` to the discovered version and trying `method` 'usage-global' and 'usage-pure'.
- we also attempted to set the rollup `plugins.babel().babelHelpers` to 'bundled' with various combinations of Babel configurations, but this either result in 'Error: You have declared using "bundled" babelHelpers, but transforming [the entry point] resulted in "runtime", or it failed to actually include the necessary polyfills.