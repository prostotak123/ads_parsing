#!/bin/bash
set -e

echo "➡️ Entrypoint запущено з командою: $@"

# Встановлюємо браузери перед будь-чим (бо потрібні й для celery, і для runserver)
echo "🔧 Installing Playwright browsers if needed..."
python3 -m playwright install --with-deps || true

# Якщо запускається Celery — не виконуємо міграції
if [[ "$@" == *"celery"* ]]; then
  echo "🚀 Запускається Celery — пропускаємо міграції."
  exec "$@"
fi

echo "🛠️  Виконуємо міграції..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "✅ Запускаємо команду: $@"
exec "$@"
