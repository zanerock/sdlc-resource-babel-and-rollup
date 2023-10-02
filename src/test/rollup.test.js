const loadConfigFile = require('rollup/dist/loadConfigFile.js').loadConfigFile
const path = require('path')
const rollup = require('rollup')

const configFile = path.resolve(__dirname, '..', '..', 'dist', 'rollup', 'rollup.config.mjs')

const testInput = path.resolve(__dirname, 'throw-expression.mjs')

const testStagingPath = path.resolve(__dirname, '..', '..', 'test-staging')

const testOutputPath = path.resolve(__dirname, '..', '..', 'test-staging', 'test-output.js')

const testOutput = { 
    file : testOutputPath,
    format: 'cjs',
    generatedCode: 'es2015',
    sourcemap: 'inline' 
  }

loadConfigFile(configFile, { input: testInput, output: testOutput })
  .then(({options, warnings}) => {
    // "warnings" wraps the default `onwarn` handler passed by the CLI.
    // This prints all warnings up to this point:
    // console.log(`We currently have ${warnings.count} warnings`)

    // This prints all deferred warnings
    warnings.flush()
    
    // options is an "inputOptions" object with an additional "output"
    // property that contains an array of "outputOptions".
    // The following will generate all outputs and write them to disk the same
    // way the CLI does it:
    options.map(async options => {
        const bundle = await rollup.rollup(options)
        await Promise.all(options.output.map(bundle.write))

        const test = require(testOutputPath).test

        // TEST 1
        process.stdout.write('throw expression default parameter: ')
        try {
          test()
          process.stdout.write('FAILED (no throw)\n')
          process.exit(1)
        }
        catch (e) {
          if (e.message === 'required!') {
            process.stdout.write('PASSED\n')
          }
          else {
            process.stdout.write('FAILED (unexpected message: ' + e.message + ')')
            process.exit(1)
          }
        }

        // TEST 2
        process.stdout.write('throw expression || (throw condition): ')
        try {
          test(false)
          process.stdout.write('FAILED (no throw)\n')
          process.exit(1)
        }
        catch (e) {
          if (e.message === 'Falsy!') {
            process.stdout.write('PASSED\n')
          }
          else {
            process.stdout.write('FAILED (unexpected message: ' + e.message + ')')
            process.exit(1)
          }
        }
        // TEST 3
        process.stdout.write('throw expression || (no throw condition): ')
        try {
          test(true)
          process.stdout.write('PASSED\n')
        }
        catch (e) {
          process.stdout.write('FAILED (unexpected throw: ' + e.message + ')')
          process.exit(1)
        }
      })
  })