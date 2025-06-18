#!/bin/bash

# Застосовуємо всі наявні міграції
# Генеруємо міграції (якщо потрібно)
python manage.py makemigrations users --noinput

# Застосовуємо всі міграції
python manage.py migrate --noinput

python manage.py collectstatic --noinput


DJANGO_SUPERUSER_NAME=${DJANGO_SUPERUSER_NAME:-admin}
DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-admin@example.com}
DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-admin1234}

echo "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_NAME').exists():
    User.objects.create_superuser(
        username='$DJANGO_SUPERUSER_NAME',
        email='$DJANGO_SUPERUSER_EMAIL',
        password='$DJANGO_SUPERUSER_PASSWORD'
    )
" | python manage.py shell

exec "$@"
