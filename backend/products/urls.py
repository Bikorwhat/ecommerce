from django.urls import path
from .views import list_cards, list_categories, search_products

urlpatterns = [
    path('cards/', list_cards),
    path('categories/', list_categories),
    path('search/', search_products),
]