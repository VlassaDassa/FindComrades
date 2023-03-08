# FindComrades
Social Nerwork for find friends

Учебный проект для понимания основных концепций в веб-разработке с использованием Django

# Функционал:
 - Блог
 - Чат
 - Уведомления с помощью Django-channels и WebSockets
 - Ajax-формы
 - Онлайн
 - Друзья

# Установка:
python -m venv venv

python venv/Scripts/activate

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py runserver

_Также необходимо скачать Redis-client для работы функций, реализованных с помощью Django-channels и запустить redis-cli и redis-server_
