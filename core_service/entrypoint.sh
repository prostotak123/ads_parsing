#!/usr/bin/env bash
set -euo pipefail

echo "➡️ core entrypoint: $*"

: "${APPLY_MIGRATIONS:=1}"
: "${MIGRATE_MAX_RETRIES:=20}"
: "${MIGRATE_SLEEP:=3}"

is_celery=0
case "$*" in *"celery"*) is_celery=1 ;; esac

run_migrate_with_retry() {
  local attempt=1
  until python manage.py migrate --noinput; do
    if [ "$attempt" -ge "$MIGRATE_MAX_RETRIES" ]; then
      echo "❌ migrate failed after ${MIGRATE_MAX_RETRIES} attempts"; exit 1
    fi
    echo "🕒 DB not ready or migrate error. Attempt #$attempt. Sleep ${MIGRATE_SLEEP}s..."
    sleep "$MIGRATE_SLEEP"; attempt=$(( attempt + 1 ))
  done
}

if [ "$is_celery" -eq 1 ]; then
  echo "🚀 Celery detected — skipping migrations."
  exec "$@"
else
  if [ "$APPLY_MIGRATIONS" = "1" ]; then
    echo "🛠️  Applying migrations (with retries)..."
    run_migrate_with_retry
  else
    echo "⚠️  APPLY_MIGRATIONS=0 — skipping migrate."
  fi

  echo "✅ exec: $*"
  exec "$@"
fi
