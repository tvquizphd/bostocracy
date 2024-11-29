rm bostocracy/migrations/*.py
touch bostocracy/migrations/__init__.py
rm db.sqlite3 

python manage.py makemigrations bostocracy
python manage.py migrate
