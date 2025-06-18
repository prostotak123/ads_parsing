#!/bin/bash

# Застосовуємо всі наявні міграції
# Генеруємо міграції (якщо потрібно)
python manage.py makemigrations --noinput

# Застосовуємо всі міграції
python manage.py migrate --noinput

exec "$@"
