#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/../.." && pwd)"
DEFAULT_LOCALE_FILE="$APP_DIR/src/i18n/locales/source/en-US.json"

cd "$APP_DIR"

if [ -n "$ONLY_IF_MISSING" ] && [ -e "$DEFAULT_LOCALE_FILE" ]; then
  echo "Default locale exists already, skipping Crowdin download"
  exit 0
fi

if [ ! -f "$APP_DIR/crowdin.yml" ] && [ ! -f "$APP_DIR/crowdin.yaml" ] && [ ! -f "$APP_DIR/.crowdin.yml" ] && [ ! -f "$APP_DIR/.crowdin.yaml" ]; then
  echo "No Crowdin config found in $APP_DIR, skipping"
  exit 0
fi

if ! which crowdin >/dev/null 2>&1; then
  echo "Installing"
  npm i -g @crowdin/cli@3.14.0
fi

if [ -n "$CROWDIN_WEB_ACCESS_TOKEN" ]; then
  echo "Running crowdin $@ for project ID: $CROWDIN_WEB_PROJECT_ID"
  npx crowdin "$@"
else
  echo "Running crowdin using dotenv"
  npx dotenv -e "$ROOT_DIR/.env.defaults.local" -- npx crowdin "$@"
fi
