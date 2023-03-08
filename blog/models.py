from django.db import models
from comrades import settings
from main.models import User
from django.utils.translation import gettext as _

class Articles(models.Model):
    it = 1
    frontend = 2
    backend = 3
    python = 4
    js = 5
    any = 6
    CATEGORY_CHOICES = [
        (it, _("IT")),
        (frontend, _("FrontEnd")),
        (python, _("Python")),
        (backend, _("BackEnd")),
        (js, _("JavaScript")),
        (any, _("Любая")),
    ]

    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name='author')
    title = models.CharField(max_length=50, blank=True, null=True, verbose_name='Заголовок')
    content = models.TextField(blank=True, null=True, verbose_name='Контент')
    category = models.PositiveSmallIntegerField(choices=CATEGORY_CHOICES, null=True, blank=True, verbose_name='Категория', default=6)
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Дата публикации')
    tags = models.CharField(max_length=100, blank=True, null=True, verbose_name='Метки')
    likes = models.ManyToManyField(User, related_name='likes_comments', verbose_name='Лайки')

    class Meta:
        verbose_name_plural = "Статья"

    def __str__(self):
        return self.title


class Comments(models.Model):
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name='Автор')
    article = models.ForeignKey(Articles, on_delete=models.CASCADE, related_name='Статья')
    content = models.TextField(blank=True, null=True, verbose_name='Комментарий')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Дата публикации комментария')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='Ответ')
    likes = models.ManyToManyField(User, related_name='likes_articles', verbose_name='Лайки')

    class Meta:
        verbose_name_plural = "Комментарии"


    def __str__(self):
        return self.author.username
