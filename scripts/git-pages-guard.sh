#!/bin/sh
# Docusaurus 3.8.1 asks for a force push; publish only a fast-forward instead.
set -eu
case "${KVIDAI_DOCS_REAL_GIT:-}" in
  /*) [ -x "$KVIDAI_DOCS_REAL_GIT" ] || exit 1 ;;
  *) exit 1 ;;
esac
if [ "${1:-}" = push ]; then
  [ "$#" -eq 4 ] && [ "$2" = --force ] && [ "$3" = origin ] || exit 1
  branch="$4"
  case "$branch" in ''|-*|+*|*[!a-zA-Z0-9._/-]*) exit 1 ;; esac
  case "$branch" in main|develop|refs/heads/main|refs/heads/develop) exit 1 ;; esac
  "$KVIDAI_DOCS_REAL_GIT" check-ref-format --branch "$branch" >/dev/null || exit 1
  exec "$KVIDAI_DOCS_REAL_GIT" -c remote.origin.mirror=false -c push.followTags=false \
    push origin "HEAD:refs/heads/$branch"
fi
# Only Docusaurus 3.8.1's non-push commands are allowed; global options,
# aliases and future commands fail closed instead of bypassing the push guard.
case "${1:-}" in
  --version|remote|rev-parse|clone|checkout|rm|add|config|commit)
    exec "$KVIDAI_DOCS_REAL_GIT" "$@" ;;
  *) exit 1 ;;
esac
