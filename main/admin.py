from django.contrib import admin
from .models import User, City, FriendRequest, FriendList
from chat.models import PrivateChat


admin.site.register(User)
admin.site.register(City)
admin.site.register(FriendRequest)
admin.site.register(FriendList)
admin.site.register(PrivateChat)



