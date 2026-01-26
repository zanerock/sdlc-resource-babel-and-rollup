// Test mixed JS/TS imports - JavaScript file importing TypeScript module
import { testTypescript } from './typescript-features.ts'

// Additional JS-only functionality
function jsFunction() {
  return 'from JavaScript'
}

// Combined test that uses both JS and TS code
function testMixedImports() {
  const tsResult = testTypescript()
  const jsResult = jsFunction()

  return {
    success   : tsResult.success && jsResult === 'from JavaScript',
    tsResults : tsResult.results,
    jsResult
  }
}

export { testMixedImports }
