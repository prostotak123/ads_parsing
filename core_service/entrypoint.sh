#!/bin/bash

echo "➡️ Entrypoint запущено з командою: $@"

# Якщо це Celery worker — НЕ виконуємо міграції
if [[ "$@" == *"celery"* ]]; then
  echo "🚀 Запускається Celery — пропускаємо міграції."
  exec "$@"
fi

# Якщо це runserver/debugpy/gunicorn — виконуємо підготовку
echo "🛠️  Виконуємо міграції..."
# Генеруємо міграції (якщо потрібно)
python manage.py makemigrations --noinput
python manage.py migrate --noinput


echo "✅ Запускаємо команду: $@"
exec "$@"