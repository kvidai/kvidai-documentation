#!/usr/bin/env bash
# Publish the same static build that passed the non-UI pre-deploy checks.
set -euo pipefail
case "${1:-}" in
  preview) ;;
  prod) ;;
  github-pages) ;;
  *) echo "Usage: $0 <preview|prod|github-pages>" >&2; exit 2 ;;
esac
target_dir=''
if [ "$1" = github-pages ] && [ "$#" -eq 3 ] && [ "$2" = --target-dir ]; then
  target_dir="$3"
  case "$target_dir" in ''|-*|/*|*[!a-zA-Z0-9._/-]*|*/|*//*) echo 'Invalid target directory' >&2; exit 2 ;; esac
  if [ "$target_dir" != . ]; then
    case "/$target_dir/" in */./*|*/../*|*/.[gG][iI][tT]/*) echo 'Invalid target directory' >&2; exit 2 ;; esac
  fi
elif [ "$#" -ne 1 ]; then
  echo 'Unexpected deployment arguments' >&2
  exit 2
fi
cd "$(dirname "${BASH_SOURCE[0]}")/.."
umask 077
candidate_root="$(mktemp -d "${TMPDIR:-/tmp}/kvidai-docs-deploy.XXXXXXXX")"
trap 'rm -rf -- "$candidate_root"' EXIT
if [ "$1" = github-pages ]; then
  real_git="$(command -v git)"
  case "$real_git" in /*) ;; *) echo 'Git must have an absolute executable path' >&2; exit 1 ;; esac
  node_binary="$(command -v node)"
  case "$node_binary" in /*) ;; *) echo 'Node must have an absolute executable path' >&2; exit 1 ;; esac
  docusaurus_cli="$("$node_binary" -e 'const p=require.resolve("@docusaurus/core/package.json"); if(require(p).version!=="3.8.1") process.exit(1); console.log(require("node:path").join(require("node:path").dirname(p),"bin/docusaurus.mjs"))')"
  KVIDAI_DOCS_REAL_GIT="$real_git" "$node_binary" scripts/check-pages-target.js > "$candidate_root/target"
  {
    IFS= read -r target_organization
    IFS= read -r target_project
    IFS= read -r target_host
    IFS= read -r target_port
    IFS= read -r target_branch
  } < "$candidate_root/target"
fi
mkdir "$candidate_root/static"
(
  # Numbered Git configuration may itself contain credentials. Keep it for
  # the deployment child, but do not pass it to the build and test child.
  for name in ${!GIT_CONFIG_KEY_@} ${!GIT_CONFIG_VALUE_@}; do unset "$name"; done
  env -u GIT_PASS -u GIT_USER -u GITHUB_TOKEN -u GITHUB_APP_TOKEN -u GH_TOKEN -u GH_ENTERPRISE_TOKEN \
    -u NETLIFY_AUTH_TOKEN -u NETLIFY_SITE_ID -u SSH_AUTH_SOCK -u SSH_ASKPASS -u GIT_ASKPASS \
    -u GIT_SSH -u GIT_SSH_COMMAND -u GIT_CONFIG_COUNT -u GIT_CONFIG_PARAMETERS \
    -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY -u AWS_SESSION_TOKEN \
    GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_TERMINAL_PROMPT=0 \
    KVIDAI_DOCS_BUILD_DIR="$candidate_root/build" KVIDAI_DOCS_STATIC_DIR="$candidate_root/static" pnpm run test:predeploy
)
if [ "$1" = github-pages ]; then
  mkdir "$candidate_root/bin" "$candidate_root/tmp"
  cp scripts/git-pages-guard.sh "$candidate_root/bin/git"
  chmod 700 "$candidate_root/bin/git"
  if [ -n "$target_dir" ]; then
    KVIDAI_DOCS_REAL_GIT="$real_git" DOCUSAURUS_DEPLOY_DEBUG='' ORGANIZATION_NAME="$target_organization" PROJECT_NAME="$target_project" \
      GITHUB_HOST="$target_host" GITHUB_PORT="$target_port" DEPLOYMENT_BRANCH="$target_branch" PATH="$candidate_root/bin:$PATH" TMPDIR="$candidate_root/tmp" \
      "$node_binary" "$docusaurus_cli" deploy --skip-build --out-dir "$candidate_root/build" --target-dir "$target_dir"
  else
    KVIDAI_DOCS_REAL_GIT="$real_git" DOCUSAURUS_DEPLOY_DEBUG='' ORGANIZATION_NAME="$target_organization" PROJECT_NAME="$target_project" \
      GITHUB_HOST="$target_host" GITHUB_PORT="$target_port" DEPLOYMENT_BRANCH="$target_branch" PATH="$candidate_root/bin:$PATH" TMPDIR="$candidate_root/tmp" \
      "$node_binary" "$docusaurus_cli" deploy --skip-build --out-dir "$candidate_root/build"
  fi
elif [ "$1" = prod ]; then
  pnpm exec netlify deploy "--dir=$candidate_root/build" --prod
else
  pnpm exec netlify deploy "--dir=$candidate_root/build"
fi
