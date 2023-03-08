import datetime

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext as _
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.contrib.humanize.templatetags.humanize import naturaltime


# Расширение пользовательской модели
class User(AbstractUser):
    GENDER_MALE = 1
    GENDER_FEMALE = 2
    GENDER_CHOICES = [
        (GENDER_MALE, _("Мужской")),
        (GENDER_FEMALE, _("Женский")),
    ]

    first_name = models.CharField(max_length=50, blank=True, null=True, verbose_name='Имя', default='Безымянный')
    last_name = models.CharField(max_length=50, blank=True, null=True, verbose_name='Имя', default='товарищ')
    full_name = models.CharField(max_length=60, blank=True, null=True, verbose_name='Полное имя', default='Безымянный товарищ')
    avatar = models.ImageField(blank=True, null=True, upload_to='profile_images', default='default.jpg')
    bio = models.TextField(max_length=500, blank=True, null=True, verbose_name='Описание')
    city = models.CharField(max_length=30, blank=True, null=True, verbose_name='Город')
    age = models.CharField(max_length=10, blank=True, null=True, verbose_name='Возраст')
    skills = models.CharField(max_length=100, blank=True, null=True, verbose_name='Умения')
    gender = models.PositiveSmallIntegerField(choices=GENDER_CHOICES, null=True, blank=True, verbose_name='Пол', default=1)
    last_online = models.DateTimeField(blank=True, null=True, default=datetime.datetime(2009, 10, 5, 21, 3, 55, 827787))
    online = models.IntegerField(blank=True, null=True, default=0)
    


class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user')
    friends = models.ManyToManyField(User, blank=True, related_name='friends')

    class Meta:
        verbose_name_plural = "Список друзей"

    def __str__(self):
        return self.user.username


    def add_friend(self, account):
        if account not in self.friends.all():
            self.friends.add(account)


    def remove_friend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)


    def unfriend(self, removee):
        remover_friend_list = self

        remover_friend_list.remove_friend(removee)

        friends_list = FriendList.objects.get(user=removee)
        friends_list.remove_friend(self.user)


    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False



class FriendRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    is_active = models.BooleanField(blank=True, null=False, default=True)
    timestamp = models.DateTimeField(auto_now_add=True)


    class Meta:
        verbose_name_plural = "Запросы в друзья"


    def __str__(self):
        return self.sender.username


    def accept(self):
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False
                self.save()


    def decline(self):
        self.is_active = False
        self.save()


    def cancel(self):
        self.is_active = False
        self.save()



class City(models.Model):
    city_name = models.CharField(max_length=30, blank=True, null=True, verbose_name='Город')

    class Meta:
        verbose_name = 'Город'
        verbose_name_plural = 'Города'

    def __str__(self):
        return self.city_name

