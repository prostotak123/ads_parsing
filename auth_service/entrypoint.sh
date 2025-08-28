#!/usr/bin/env bash
set -euo pipefail

echo "➡️ auth entrypoint: $*"

: "${APPLY_MIGRATIONS:=1}"
: "${MIGRATE_MAX_RETRIES:=20}"
: "${MIGRATE_SLEEP:=3}"

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

# ❌ НЕ генеруємо міграції в проді
# python manage.py makemigrations --noinput  # ← прибрано

if [ "$APPLY_MIGRATIONS" = "1" ]; then
  echo "🛠️  Applying migrations (with retries)..."
  run_migrate_with_retry
else
  echo "⚠️  APPLY_MIGRATIONS=0 — skipping migrate."
fi

echo "🧰 collectstatic..."
python manage.py collectstatic --noinput || true

# Ідемпотентне створення суперюзера
: "${DJANGO_SUPERUSER_NAME:=admin}"
: "${DJANGO_SUPERUSER_EMAIL:=admin@example.com}"
: "${DJANGO_SUPERUSER_PASSWORD:=admin1234}"

python manage.py shell <<PY
from django.contrib.auth import get_user_model
User = get_user_model()
name = "${DJANGO_SUPERUSER_NAME}"
email = "${DJANGO_SUPERUSER_EMAIL}"
pwd = "${DJANGO_SUPERUSER_PASSWORD}"
u = User.objects.filter(username=name).first()
if not u:
    print("👤 Creating superuser:", name)
    User.objects.create_superuser(username=name, email=email, password=pwd)
else:
    print("👤 Superuser exists:", name)
PY

echo "✅ exec: $*"
exec "$@"
