from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create superuser if it does not exist'

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@ecommerce.com', 'yourpassword123')
            self.stdout.write(self.style.SUCCESS('Superuser created: admin / yourpassword123'))
        else:
            self.stdout.write(self.style.WARNING('Superuser already exists'))
