from django.shortcuts import render
from .models import Card, Category
from rest_framework.response import Response
from .serializers import CardSerializer, CategorySerializer
from rest_framework.decorators import api_view
from . import models

@api_view(['GET'])
def list_cards(request):
    category_id = request.GET.get('category', None)
    
    if category_id:
        cards = Card.objects.filter(category_id=category_id)
    else:
        cards = Card.objects.all()
    
    serializer = CardSerializer(cards, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(['GET'])
def list_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def search_products(request):
    query = request.GET.get('q', '')

    if query:
        products = Card.objects.filter(name__icontains=query)
    else:
        products = Card.objects.none()

    serializer = CardSerializer(products, many=True, context={"request": request})
    return Response(serializer.data)