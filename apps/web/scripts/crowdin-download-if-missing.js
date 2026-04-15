/* eslint-env node */
'use strict'

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const scriptDir = __dirname
const appDir = path.join(scriptDir, '..')
const rootDir = path.join(appDir, '..', '..')
const defaultLocaleFile = path.join(appDir, 'src/i18n/locales/source/en-US.json')

function runNpx(args) {
  const result = spawnSync('npx', args, {
    cwd: appDir,
    shell: true,
    stdio: 'inherit',
  })
  if (result.error) {
    throw result.error
  }
  process.exit(result.status === null ? 1 : result.status)
}

process.chdir(appDir)

// If-missing entrypoint: skip when the default locale is already present (same as crowdin.sh with ONLY_IF_MISSING=1).
if (fs.existsSync(defaultLocaleFile)) {
  console.log('Default locale exists already, skipping Crowdin download')
  process.exit(0)
}

const crowdinNames = ['crowdin.yml', 'crowdin.yaml', '.crowdin.yml', '.crowdin.yaml']
const hasCrowdinConfig = crowdinNames.some((n) => fs.existsSync(path.join(appDir, n)))
if (!hasCrowdinConfig) {
  console.log(`No Crowdin config found in ${appDir}, skipping`)
  process.exit(0)
}

if (process.env.CROWDIN_WEB_ACCESS_TOKEN) {
  console.log(`Running crowdin download for project ID: ${process.env.CROWDIN_WEB_PROJECT_ID}`)
  runNpx(['crowdin', 'download'])
} else {
  const dotenvFile = path.join(rootDir, '.env.defaults.local')
  console.log('Running crowdin using dotenv')
  runNpx(['dotenv', '-e', dotenvFile, '--', 'npx', 'crowdin', 'download'])
}
