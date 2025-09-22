from django.urls import path
from . import views

urlpatterns = [
    path('api/calculate_trip/', views.calculate_trip, name='calculate_trip'),
]
