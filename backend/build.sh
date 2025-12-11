#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Creating superuser (if not exists)..."
python manage.py createsuperuser --noinput || true

echo "Loading initial data (if database is empty)..."
python manage.py load_initial_data

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!"
