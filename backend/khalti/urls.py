from django.urls import path
from . import views

urlpatterns = [
    path("initiate/", views.khalti_initiate, name="khalti_initiate"),
    path("verify/",   views.khalti_verify,   name="khalti_verify"),
    path("history/",  views.get_purchase_history, name="purchase_history"),
]