# @liquid-labs/sdlc-resource-babel-and-rollup

Configures Babel and Rollup to support modern syntax and proposals in source code while producing optimized, backwards compatible output code.

## Install

```bash
npm i @liquid-labs/sdlc-resource-babel-and-rollup
```

## Running

```bash
npx rollup $(npm explore @liquid-labs/sdlc-resource-babel-and-rollup -- pwd)/dist/rollup/rollup.config.mjs
```

## Usage

### Polyfills

After extensive experimentation with different settings, it appears that Babel cannot really produce optimized polyfills. Even with 'usage' based configurations, it may include polyfills that are in fact not used and the polyfill logic also seems to ignore the `targets` setting (e.g., even when the target platform supports a function natively, Babel will still include the polyfill for it). See the [polyfill configuration notes in DEVELOPER_NOTES.md](./DEVELOPER_NOTES#polyfill-configuration-notes) for further details.