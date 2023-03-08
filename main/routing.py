from django.urls import re_path
from . import consumers
from chat.consumers import PersonalChatConsumer


websocket_urlpatterns = [
    re_path(r'ws/notification_friend_request/', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/accept_friend_request/', consumers.AcceptFriend.as_asgi()),
    re_path(r'ws/friend_request_comrades/', consumers.ComradesFriendRequest.as_asgi()),
    re_path(r'ws/online/', consumers.Online.as_asgi()),

    # re_path(r'ws/<str:username>/', PersonalChatConsumer.as_asgi())
    re_path(r'^ws/(?P<user_id>[^/]+)/$', PersonalChatConsumer.as_asgi())
]
