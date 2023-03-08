from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist

from main.models import FriendRequest, User, FriendList
import json

import datetime
from django.utils.timezone import utc


# Friend request notification
'''
Для отправки и отображения уведомления
у получателя внутри профиля
'''

@database_sync_to_async
def get_request_id(receiver, sender):
    try:
        friend_request = FriendRequest.objects.get(receiver=receiver, sender=sender, is_active=True).id
    except ObjectDoesNotExist:
        return False
    else:
        return friend_request


@database_sync_to_async
def get_user(username):
    # Есть ли такой пользователь
    try:
        return User.objects.get(username=username)
    except:
        return False


@database_sync_to_async
def create_friend_request(receiver, sender):
    try:
        FriendRequest.objects.get(receiver=receiver, sender=sender, is_active=True)
    except ObjectDoesNotExist:
        FriendRequest.objects.create(receiver=receiver, sender=sender)
        return True
    else:
        return False

@database_sync_to_async
def count_notifications(receiver):
    return str(len(FriendRequest.objects.filter(receiver=receiver, is_active=True)))


@database_sync_to_async
def del_friend(sender, receiver):
    friend_list = FriendList.objects.get(user=sender)
    return friend_list.unfriend(receiver)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def websocket_connect(self, event):
        self.group_name = 'notifications'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    # Get from interface
    async def websocket_receive(self, event):
        data_to_get = json.loads(event['text'])
        user_receiver = await get_user(data_to_get['receiver_username'])
        user_sender = await get_user(data_to_get['sender_username'])
        result = True


        # Cancel friend request by sender
        if data_to_get['cancel']:
            action = 'cancel'

            if user_sender and user_receiver and await cancel_friend_request(await get_request_id(user_receiver, user_sender)):
                result = True
            else:
                result = False

            channel_layer = get_channel_layer()

            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Send to interface
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_friend_request",
                    "value": {
                        'result': result,
                        'user_receiver': str(user_receiver),
                        'user_sender': str(user_sender),
                        'avatar': str(user_sender.avatar),
                        'first_name': str(user_sender.first_name),
                        'last_name': str(user_sender.last_name),
                        'count_notifications': await count_notifications(user_receiver),
                        'friend_request_id': await get_request_id(user_receiver, user_sender),
                    }
                }
                )

        # Add friend
        elif data_to_get['add']:
            action = 'add'
            if user_sender and user_receiver and await create_friend_request(user_receiver, user_sender):
                result = True
            else:
                result = False

            channel_layer = get_channel_layer()

            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Send to interface
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_friend_request",
                    "value": {
                        'result': result,
                        'user_receiver': str(user_receiver),
                        'user_sender': str(user_sender),
                        'avatar': str(user_sender.avatar),
                        'first_name': str(user_sender.first_name),
                        'last_name': str(user_sender.last_name),
                        'count_notifications': await count_notifications(user_receiver),
                        'friend_request_id': await get_request_id(user_receiver, user_sender),
                    }
                }
                )

        elif data_to_get['remove_friend']:
            action = 'remove_friend'
            await del_friend(user_sender, user_receiver)



    # Send to interface
    async def send_friend_request(self, event):
        await self.send(json.dumps({
            "type": "notifications",
            'data': event,
        }))
# /Friend request notification




'''
Для принятия/отмена запроса
и отображения решения у отправителя
'''

# Accept/cancel friend request
@database_sync_to_async
def add_friend(pk):
    try:
        friend_request = FriendRequest.objects.get(id=int(pk))
    except ObjectDoesNotExist:
        return False
    else:
        friend_request.accept()
        return True


@database_sync_to_async
def cancel_friend_request(pk):
    try:
        friend_request = FriendRequest.objects.get(id=int(pk), is_active=True)
    except ObjectDoesNotExist:
        return False
    else:
        friend_request.cancel()
        return True



class AcceptFriend(AsyncWebsocketConsumer):
    async def websocket_connect(self, event):
        self.group_name = 'accept_friend_request'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    # Get from interface
    async def websocket_receive(self, event):
        data_to_get = json.loads(event['text'])
        action = data_to_get['action']
        friend_request_id = data_to_get['friend_request_id']
        user_receiver = await get_user(data_to_get['receiver_username'])
        user_sender = await get_user(data_to_get['sender_username'])

        # Accept or cancel in DB
        if action == 'add':
            confirm_add_friend = await add_friend(friend_request_id)

            channel_layer = get_channel_layer()

            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Send to interface
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_confirm_accept",
                    "value": {
                        'user_receiver': data_to_get['receiver_username'],
                        'user_sender': data_to_get['sender_username'],
                        'first_name': str(user_receiver.first_name),
                        'last_name': str(user_receiver.last_name),
                        'action': 'add'
                    }
                }
            )

        elif action == 'cancel':
            confirm_cancel_friend_req = await cancel_friend_request(friend_request_id)

            channel_layer = get_channel_layer()

            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Send to interface
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_confirm_cancel",
                    "value": {
                        'user_receiver': data_to_get['receiver_username'],
                        'user_sender': data_to_get['sender_username'],
                        'first_name': str(user_receiver.first_name),
                        'last_name': str(user_receiver.last_name),
                        'action': 'cancel',
                    }
                }
            )

    # Send to interface
    async def send_confirm_accept(self, event):
        await self.send(json.dumps({
            "type": "accept_friend_request",
            'data': event,
        }))


    # Send to interface
    async def send_confirm_cancel(self, event):
        await self.send(json.dumps({
            "type": "cancel_friend_request",
            'data': event,
        }))

# \Accept/cancel friend request








# Comrades friend request
'''
Отправка запроса в друзья и отображения уведомления у получателя
'''
class ComradesFriendRequest(AsyncWebsocketConsumer):
    async def websocket_connect(self, event):
        self.group_name = 'comrades_friend_request'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    # Get from interface
    async def websocket_receive(self, event):
        data_to_get = json.loads(event['text'])

        # Отправка в интерфейс
        channel_layer = get_channel_layer()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Получение пользователей
        user_sender = await get_user(data_to_get['sender_username'])
        user_receiver = await get_user(data_to_get['receiver_username'])


        # Создание запроса в друзья
        if data_to_get['btn_type'] == 'add_friend':
            await create_friend_request(user_receiver, user_sender)

            # Отправка в интерфейс
            total_count_notifications = await count_notifications(user_receiver)
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_friend_request_comrade",
                    "value": {
                        'user_receiver': str(user_receiver),
                        'user_sender': str(user_sender),
                        'avatar': str(user_sender.avatar),
                        'first_name': str(user_receiver.first_name),
                        'last_name': str(user_receiver.last_name),
                        'count_notifications': int(total_count_notifications),
                        'friend_request_id': await get_request_id(user_receiver, user_sender),
                        'request_type': data_to_get['btn_type'],
                    }
                }
                )

        # Удаление из друзей
        elif data_to_get['btn_type'] == 'delete_friend':
            await del_friend(user_sender, user_receiver)

            # Отправка в интерфейс
            total_count_notifications = await count_notifications(user_receiver)
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_friend_request_comrade",
                    "value": {
                        'user_receiver': str(user_receiver),
                        'user_sender': str(user_sender),
                        'avatar': str(user_sender.avatar),
                        'first_name': str(user_receiver.first_name),
                        'last_name': str(user_receiver.last_name),
                        'count_notifications': int(total_count_notifications),
                        'friend_request_id': await get_request_id(user_receiver, user_sender),
                        'request_type': data_to_get['btn_type'],
                    }
                }
            )

        # Отмена запроса
        elif data_to_get['btn_type'] == 'cancel_friend_request':
            # Отправка в интерфейс
            total_count_notifications = await count_notifications(user_receiver)
            await channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_friend_request_comrade",
                    "value": {
                        'user_receiver': str(user_receiver),
                        'user_sender': str(user_sender),
                        'avatar': str(user_sender.avatar),
                        'first_name': str(user_receiver.first_name),
                        'last_name': str(user_receiver.last_name),
                        'count_notifications': int(total_count_notifications) - 1,
                        'friend_request_id': await get_request_id(user_receiver, user_sender),
                        'request_type': data_to_get['btn_type'],
                    }
                }
            )

            await cancel_friend_request(await get_request_id(user_receiver, user_sender))



    # Отправка в интерфейс
    async def send_friend_request_comrade(self, event):
        await self.send(json.dumps({
            "type": "send_friend_request_comrade",
            'data': event,
        }))
# /Comrades friend request






@database_sync_to_async
def update_user_last_action(current_user):
    user = User.objects.get(username=str(current_user.username))
    User.objects.filter(username=user.username).update(last_online=datetime.datetime.now())


# Online
class Online(AsyncWebsocketConsumer):
    async def connect(self):
        await update_user_last_action(self.scope['user'])


    async def websocket_disconnect(self, _):
        await update_user_last_action(self.scope['user'])




