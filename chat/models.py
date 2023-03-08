from django.db import models
from django.utils import timezone


class PrivateChat(models.Model):
    sender = models.CharField(max_length=100, default=None)
    receiver = models.CharField(max_length=100, default=None)
    message = models.TextField(null=True, blank=True)
    thread_name = models.CharField(null=True, blank=True, max_length=50)
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)


    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return self.message
