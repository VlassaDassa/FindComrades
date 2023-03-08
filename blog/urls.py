from django.urls import path
from blog import views


urlpatterns = [
    path('articles', views.articles, name='articles'),
    path('user_article/<int:pk>', views.user_article, name='user_article'),
    path('create_article', views.create_article, name='create_article'),
    path('category_search', views.articles_category_search),
]

