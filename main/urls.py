from django.urls import path
from . import views
from django.contrib.auth import views as authViews

urlpatterns = [
    path('', views.index),
    path('main', views.index, name='main'),
    path('registration', views.reg_user, name='reg'),
    path('login', views.user_login, name='login'),
    path('exit', authViews.LogoutView.as_view(next_page='main'), name='exit'),
    path('profile/<str:username>/', views.show_profile, name='user_profile'),
    path('edit_profile', views.edit_profile, name='autocomplete'),

    path('comrades', views.comrades, name='comrades'),
    path('comrades_city', views.comrades_city, name='comrades_city'),
    path('comrades_tags', views.comrades_tags, name='comrades_tags'),
]

