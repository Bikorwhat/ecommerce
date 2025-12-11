from django.core.management.base import BaseCommand
from django.core.management import call_command
import os


class Command(BaseCommand):
    help = 'Load initial product data if database is empty'

    def handle(self, *args, **options):
        from products.models import Card, Category
        
        # Check if data already exists
        if Category.objects.exists() or Card.objects.exists():
            self.stdout.write(self.style.WARNING('Data already exists, skipping initial load'))
            return
        
        # Load data from fixture file
        fixture_path = 'products_data.json'
        if os.path.exists(fixture_path):
            self.stdout.write('Loading initial product data...')
            call_command('loaddata', fixture_path)
            self.stdout.write(self.style.SUCCESS('Successfully loaded initial data'))
        else:
            self.stdout.write(self.style.WARNING(f'Fixture file {fixture_path} not found'))
