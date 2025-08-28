# auth_service/Dockerfile

FROM python:3.12-slim

# Уникаємо інтерактивного режиму та кешування .pyc файлів
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Ставимо system-залежності (якщо потрібно)
# RUN apt-get update && apt-get install -y build-essential

# Спочатку копіюємо лише requirements — для кешування layer-ів
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Далі копіюємо весь код
COPY . .

RUN mkdir -p /app/static

# Додаємо entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Вказуємо entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Запускаємо gunicorn
# CMD ["gunicorn", "auth_project.wsgi:application", "--bind", "0.0.0.0:8000"]