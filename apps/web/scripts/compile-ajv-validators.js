/* eslint-env node */
/**
 * Generates standalone Ajv validators for token lists.
 *
 * Uses createRequire(apps/web/package.json) so `ajv` / `@uniswap/token-lists` resolve
 * reliably on Vercel and in Yarn workspaces (hoisted node_modules).
 */

const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')

const appRoot = path.join(__dirname, '..')
const pkgPath = path.join(appRoot, 'package.json')
const requireApp = createRequire(pkgPath)

function debug(...args) {
  if (process.env.CI || process.env.VERCEL) {
    // eslint-disable-next-line no-console
    console.error('[compile-ajv-validators][debug]', ...args)
  }
}

function loadSchema() {
  try {
    return requireApp('@uniswap/token-lists/dist/tokenlist.schema.json')
  } catch (e1) {
    try {
      return requireApp('@uniswap/token-lists/src/tokenlist.schema.json')
    } catch (e2) {
      console.error(
        '[compile-ajv-validators] Failed to load token list schema:',
        e1 && e1.message,
        '|',
        e2 && e2.message
      )
      throw e2
    }
  }
}

function main() {
  debug('node', process.version)
  debug('cwd', process.cwd())
  debug('appRoot', appRoot)
  debug('pkgPath exists', fs.existsSync(pkgPath))

  const Ajv = requireApp('ajv')
  const standaloneMod = requireApp('ajv/dist/standalone')
  const standaloneCode = typeof standaloneMod === 'function' ? standaloneMod : standaloneMod.default || standaloneMod
  const addFormats = requireApp('ajv-formats')
  const schema = loadSchema()

  const outDir = path.join(appRoot, 'src/utils/__generated__')
  debug('outDir', outDir)
  fs.mkdirSync(outDir, { recursive: true })
  debug('outDir exists', fs.existsSync(outDir))

  const tokenListAjv = new Ajv({ code: { source: true, esm: true } })
  addFormats(tokenListAjv)
  const validateTokenList = tokenListAjv.compile(schema)
  const tokenListModuleCode = standaloneCode(tokenListAjv, validateTokenList)
  fs.writeFileSync(path.join(outDir, 'validateTokenList.js'), tokenListModuleCode)
  debug('wrote validateTokenList.js')

  const tokensAjv = new Ajv({ code: { source: true, esm: true } })
  addFormats(tokensAjv)
  const validateTokens = tokensAjv.compile({ ...schema, required: ['tokens'] })
  const tokensModuleCode = standaloneCode(tokensAjv, validateTokens)
  fs.writeFileSync(path.join(outDir, 'validateTokens.js'), tokensModuleCode)
  debug('wrote validateTokens.js')
}

try {
  main()
} catch (err) {
  console.error('[compile-ajv-validators]', err && err.stack ? err.stack : err)
  process.exit(1)
}
