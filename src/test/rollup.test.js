// TODO: I tried to implement this with jest, but couldn't get it to work. Not clear why. Did have to enable module
// support, but that seemed insufficient. We might consider rewriting 'rollup.config.mjs' as cjs and trying agaian.

const loadConfigFile = require('rollup/dist/loadConfigFile.js').loadConfigFile // eslint-disable-line import/extensions
const { readFileSync } = require('node:fs')
const path = require('node:path')
const rollup = require('rollup')

const configFile = path.resolve(__dirname, '..', '..', 'dist', 'rollup', 'rollup.config.mjs')

const testInput = path.resolve(__dirname, 'throw-expression.mjs')
const tsTestInput = path.resolve(__dirname, 'typescript-features.ts')
const mixedTestInput = path.resolve(__dirname, 'mixed-entry.mjs')

const testStagingPath = path.resolve(__dirname, '..', '..', 'test-staging')

const testOutputPath = path.resolve(testStagingPath, 'test-output.cjs')
const tsTestOutputPath = path.resolve(testStagingPath, 'ts-test-output.cjs')
const mixedTestOutputPath = path.resolve(testStagingPath, 'mixed-test-output.cjs')

const testOutput = {
  file          : testOutputPath,
  format        : 'cjs',
  generatedCode : 'es2015',
  sourcemap     : 'inline'
}

loadConfigFile(configFile, { input : testInput, output : testOutput })
  .then(({ options, warnings }) => {
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
      // TEST 4
      process.stdout.write("appends 'src/file-header.txt': ")
      const testOutputContents = readFileSync(testOutputPath, { encoding : 'utf8' })
      if (testOutputContents.match(/Copyright 2023/m)) {
        process.stdout.write('PASSED\n')
      }
      else {
        process.stdout.write('FAILED\n')
      }
    })
  })

// TypeScript tests
const tsTestOutput = {
  file          : tsTestOutputPath,
  format        : 'cjs',
  generatedCode : 'es2015',
  sourcemap     : 'inline'
}

loadConfigFile(configFile, { input : tsTestInput, output : tsTestOutput })
  .then(({ options, warnings }) => {
    warnings.flush()

    options.map(async options => {
      const bundle = await rollup.rollup(options)
      await Promise.all(options.output.map(bundle.write))

      // Clear require cache for fresh load
      delete require.cache[require.resolve(tsTestOutputPath)]
      const { testTypescript } = require(tsTestOutputPath)

      // TEST 5: TypeScript transpilation works
      process.stdout.write('TypeScript transpilation: ')
      try {
        const result = testTypescript()
        if (result.success === true && result.results.length === 4) {
          process.stdout.write('PASSED\n')
        }
        else {
          process.stdout.write('FAILED (unexpected result)\n')
          process.exit(1)
        }
      }
      catch (e) {
        process.stdout.write('FAILED (error: ' + e.message + ')\n')
        process.exit(1)
      }

      // TEST 6: TypeScript types are stripped (no TS syntax in output)
      process.stdout.write('TypeScript types stripped: ')
      const tsOutputContents = readFileSync(tsTestOutputPath, { encoding : 'utf8' })
      // Check that TypeScript-specific syntax is not in the output
      const hasInterface = tsOutputContents.includes('interface User')
      const hasTypeAnnotation = tsOutputContents.match(/:\s*string\s*[;,)]/)
      const hasGenericSyntax = tsOutputContents.match(/<T>\s*\(/)

      if (!hasInterface && !hasTypeAnnotation && !hasGenericSyntax) {
        process.stdout.write('PASSED\n')
      }
      else {
        process.stdout.write('FAILED (TypeScript syntax found in output)\n')
        process.exit(1)
      }

      // TEST 7: TypeScript output executes correctly
      process.stdout.write('TypeScript output execution: ')
      try {
        const result = testTypescript()
        const expectedMessages = [
          'Hello, Alice! You are active.',
          'identity number: 42, string: hello',
          'container value: 100',
          'assertion result: 123'
        ]
        const allMessagesPresent = expectedMessages.every((msg, idx) => result.results[idx] === msg)
        if (allMessagesPresent) {
          process.stdout.write('PASSED\n')
        }
        else {
          process.stdout.write('FAILED (unexpected output: ' + JSON.stringify(result.results) + ')\n')
          process.exit(1)
        }
      }
      catch (e) {
        process.stdout.write('FAILED (error: ' + e.message + ')\n')
        process.exit(1)
      }
    })
  })

// Mixed JS/TS import tests
const mixedTestOutput = {
  file          : mixedTestOutputPath,
  format        : 'cjs',
  generatedCode : 'es2015',
  sourcemap     : 'inline'
}

loadConfigFile(configFile, { input : mixedTestInput, output : mixedTestOutput })
  .then(({ options, warnings }) => {
    warnings.flush()

    options.map(async options => {
      const bundle = await rollup.rollup(options)
      await Promise.all(options.output.map(bundle.write))

      // Clear require cache for fresh load
      delete require.cache[require.resolve(mixedTestOutputPath)]
      const { testMixedImports } = require(mixedTestOutputPath)

      // TEST 8: Mixed JS/TS imports work
      process.stdout.write('Mixed JS/TS imports: ')
      try {
        const result = testMixedImports()
        if (result.success === true && result.jsResult === 'from JavaScript' && result.tsResults.length === 4) {
          process.stdout.write('PASSED\n')
        }
        else {
          process.stdout.write('FAILED (unexpected result: ' + JSON.stringify(result) + ')\n')
          process.exit(1)
        }
      }
      catch (e) {
        process.stdout.write('FAILED (error: ' + e.message + ')\n')
        process.exit(1)
      }
    })
  })
