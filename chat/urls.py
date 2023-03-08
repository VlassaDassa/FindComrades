from django.urls import path
from chat.views import chatPage


urlpatterns = [
    path('<str:username>/', chatPage, name='chat'),
]
