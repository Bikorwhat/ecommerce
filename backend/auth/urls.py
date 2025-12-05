from . import views
from django.urls import path,include

urlpatterns=[
    path('callback', views.callback, name='callback'),
    path('login', views.login, name='login'),
]