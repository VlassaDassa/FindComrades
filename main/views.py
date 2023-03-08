import datetime

import requests
from django.shortcuts import render, redirect, HttpResponseRedirect, HttpResponse
from .forms import RegisterUserForm, AuthenticationForm, EditProfile, LoginForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView
from .models import User, City, FriendRequest, FriendList
from blog.models import Articles, Comments
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .other.other import term_filter
from django.core.exceptions import ObjectDoesNotExist
import time



# Main page
'''
Главная страница
'''
def index(request):
    article = Articles.objects.all()[0]
    comments_count = Comments.objects.filter(article=article).count
    return render(request, 'main/main.html', context={'article': Articles.objects.all()[0], 'count_comments': comments_count})


# Friends
'''
Отображение трёх вкладок пользователей
Прогрузка посредством Ajax
'''
@csrf_exempt
def comrades(request):
    # Find friends
    if request.POST:
        gender_dict = {
            'male': 1,
            'female': 2
        }

        if request.POST['form'] == 'find':
            fullname = request.POST['fullname']
            skills = request.POST['skills']
            city = request.POST['city']
            start_interval = request.POST['start_interval']
            end_interval = request.POST['end_interval']
            gender = request.POST['gender']

            # Filter
            if not start_interval:
                start_interval = 0

            if not end_interval:
                end_interval = 99

            if not gender or (len(gender.split(',')) == 2):
                users = User.objects.filter(full_name__istartswith=fullname).filter(city__istartswith=city).filter(
                    age__range=(start_interval, end_interval))
            else:
                users = User.objects.filter(full_name__istartswith=fullname).filter(city__istartswith=city).filter(
                    age__range=(start_interval, end_interval)).filter(gender__iexact=gender_dict[gender])

            context_user = {'Users': []}
            if skills:
                skills = [i.lower() for i in skills.split(',')]
                for user in users:
                    user_skills = [i.lower() for i in user.skills.split(',')]
                    for skill in skills:
                        if skill in user_skills:
                            last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
                            if last_online > 5:
                                online_status = False
                            else:
                                online_status = True

                            context_user['Users'].append({
                                'avatar': str(user.avatar),
                                'first_name': user.first_name,
                                'last_name': user.last_name,
                                'username': user.username,
                                'online_status': online_status,
                            })

                            break
            else:
                friends = FriendList.objects.get(user=User.objects.get(username=request.user)).friends.all()

                for user in users:
                    if user != request.user and user not in friends:
                        last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
                        if last_online > 5:
                            online_status = False
                        else:
                            online_status = True

                        context_user['Users'].append({
                            'avatar': str(user.avatar),
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'username': user.username,
                            'online_status': online_status,
                        })

            if not context_user['Users']:
                context_user = {'success': False}

            return JsonResponse(context_user)


        # My friends
        elif request.POST['form'] == 'comrades':
            fullname = request.POST['fullname']
            users = FriendList.objects.get(user=User.objects.get(username=request.user)).friends.filter(
                full_name__istartswith=fullname)
            context_user = {'Users': []}

            for user in users:
                last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))

                if last_online > 5:
                    online_status = False
                else:
                    online_status = True

                context_user['Users'].append({
                    'avatar': str(user.avatar),
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'online_status': online_status,
                })

            if not context_user['Users']:
                context_user = {'success': False}

            return JsonResponse(context_user)


        # Online friends
        elif request.POST['form'] == 'free':
            fullname = request.POST['fullname']
            users = User.objects.filter(full_name__istartswith=fullname)
            context_user = {'Users': []}

            for user in users:
                last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
                if last_online > 5:
                    online_status = False
                else:
                    online_status = True

                context_user['Users'].append({
                    'avatar': str(user.avatar),
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'online_status': online_status,
                })

            if not context_user['Users']:
                context_user = {'success': False}

            return JsonResponse(context_user)

    context_users = []
    context_free_comrades = []
    context_comrades = []

    users = User.objects.all().exclude(username=request.user.username)[:5]
    comrades = FriendList.objects.get(user=User.objects.get(username=request.user)).friends.all()
    free_comrades = User.objects.all()[:5]

    # Формирование для 'Find comrades'
    for user in users:
        if user in comrades:
            status = 'friend'
        else:
            try:
                FriendRequest.objects.get(receiver=user, sender=request.user, is_active=True).id
            except ObjectDoesNotExist:
                status = 'add'
            else:
                status = 'request'

        last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60,0))
        if last_online > 1:
            online_status = None
        else:
            online_status = True


        context_users.append({'user': user, 'status': status, 'online_status': online_status})


    # Формирование для 'Free comrades'
    for user in comrades:
        last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
        if last_online <= 1:
            context_free_comrades.append({'user': user})


    # Формирование для "Comrades"
    for user in comrades:
        last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
        if last_online > 1:
            online_status = None
        else:
            online_status = True

        context_comrades.append({'user': user, 'online_status': online_status})


    return render(request, 'comrades/comrades.html', context={'users': context_users,
                                                              'comrades': context_comrades,
                                                              'free_comrades': context_free_comrades})



# Autocomplete tags
'''
Автозаполнение для тэгов в comrades с помощью Ajax
'''
def comrades_tags(request):
    # Autocomplete tags
    if 'term' in request.GET:
        # Получаем кортеж умений
        list_skills_dirty = []
        for skill_dict in User.objects.values('skills'):
            list_skills_dirty.append(skill_dict['skills'])

        skills_dirty = set(list_skills_dirty)

        # Отделяем запятые
        skills = []
        for user_skill in skills_dirty:
            if user_skill:
                if ',' in user_skill:
                    for i in user_skill.split(','):
                        skills.append(i.strip())
                else:
                    skills.append(user_skill.strip())

        full_skills = list(set(skills))

        return JsonResponse(term_filter(full_skills, request.GET.get('term')), safe=False)

    return render(request, 'comrades/comrades.html')


# Autocomplete city
'''
Автозаполнение города для comrades с помощью Ajax
'''
def comrades_city(request):
    if 'term' in request.GET:
        search_qs = City.objects.filter(city_name__startswith=request.GET['term'])
        results = []
        for r in search_qs:
            results.append(str(r))
        return JsonResponse(results, safe=False)

    return render(request, 'comrades/comrades.html')


# Registration user
'''
Регистрация, валидация с помощью Ajax
'''
def reg_user(request):
    if request.method == "POST":
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            user = authenticate(username=username, password=password)
            login(request, user)

            FriendList.objects.create(user=user)
            return JsonResponse({'success': request.user.username})
        else:
            return JsonResponse({'errors': form.errors})

    form = RegisterUserForm()

    return render(request, 'reg/register.html', {
        'form': form,
    })


# Login user
'''
Валидация с помощью Ajax
'''
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            user = authenticate(username=cd['username'], password=cd['password'])
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return JsonResponse({'success': request.user.username})
                else:
                    return JsonResponse({'errors': 'Вы уже авторизованы'})
            else:
                return JsonResponse({'errors': 'Неверный логин или пароль'})
        else:
            return JsonResponse({'errors': 'Неверные данные'})
    else:
        form = LoginForm()
    return render(request, 'reg/login.html', {'form': form, 'is_active': request.user.is_active})


'''
Показ профиля, как своего, так и чужого
'''
def show_profile(request, username):
    current_username = request.user.username
    owner_user = User.objects.get(username=username)

    # Status profile, my or another
    owner = username == current_username

    # Definition friend request
    if request.user.is_authenticated:
        friend_request_status = FriendRequest.objects.filter(sender=request.user,
                                                             receiver=owner_user)

        try:
            for friend_request in friend_request_status:
                if friend_request.is_active:
                    raise Exception('Вы уже отправили запрос')
        except Exception:
            friend_request_status = True
        else:
            friend_request_status = None

    else:
        friend_request_status = None

    try:
        FriendList.objects.get(user=User.objects.get(username=request.user)).friends.get(username=username)
    except ObjectDoesNotExist:
        remove_friend_status = False
    else:
        remove_friend_status = True


    last_online = int(round((datetime.datetime.now().replace(tzinfo=None) - owner_user.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
    if last_online > 1:
        online_status = None
    else:
        online_status = True

    articles = Articles.objects.filter(author=owner_user)
    return render(request, 'my_profile/my_profile.html', context={'user': owner_user,
                                                                  'online_status': online_status,
                                                                  'owner_profile': owner,
                                                                  'current_auth': request.user.is_authenticated,
                                                                  'request_status': friend_request_status,
                                                                  'remove_friend': remove_friend_status,
                                                                  'articles': articles,
                                                                  })


# Edit profile
'''
Редактирования профиля, Ajax
'''
def edit_profile(request):
    # Для отображения городов
    if 'term' in request.GET:
        # Модель откуда будут доставаться города
        qs = City.objects.filter(city_name__icontains=request.GET.get('term'))
        titles = list()
        for product in qs:
            titles.append(product.city_name)
        return JsonResponse(titles, safe=False)

    # Для сохранения модели
    if request.method == "POST":
        instance = get_object_or_404(User, id=request.user.id)
        form = EditProfile(request.POST, request.FILES, instance=instance)
        if form.is_valid():
            response = form.save(commit=False)
            response.full_name = response.first_name.lower() + ' ' + response.last_name.lower()

            response.save()

            return JsonResponse({'success': request.user.username})
        else:
            return JsonResponse({'errors': form.errors})
    else:
        form = EditProfile()

    return render(request, 'my_profile/edit_profile.html', {
        'form': form,
    })
