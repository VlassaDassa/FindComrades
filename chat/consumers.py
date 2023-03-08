import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from chat.models import PrivateChat
from main.models import User
from django.db.models import Q



class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        my_id = self.scope['user'].id
        other_user_id = self.scope['url_route']['kwargs']['user_id']
        if int(my_id) > int(other_user_id):
            self.room_name = f'{my_id}-{other_user_id}'
        else:
            self.room_name = f'{other_user_id}-{my_id}'

        self.room_group_name = 'chat_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        if 'type' in data:
            message_id = data['message_id']
            sender = data['sender']
            receiver = data['receiver']

            await self.update_read_status(message_id)
            count_unread_msg = await self.get_count_unread(sender, receiver)


            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'read_unread',
                    'message_id': message_id,
                    'sender': sender,
                    'receiver': receiver,
                    'count_unread_msg': count_unread_msg,
                }
            )

        else:
            message = data['message']
            username = data['username']
            fullname = await self.get_fullname_by_username(username)

            other_username = await self.get_username_by_id(self.scope['url_route']['kwargs']['user_id'])

            if len(message.rstrip('\n')) != 0:
                if await self.exist_dialog(username, other_username):
                    exist_status = 'old'
                else:
                    exist_status = 'new'

                message_id = await self.save_message(username, other_username, self.room_group_name, message.rstrip('\n').lstrip('\n'))
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message.rstrip('\n').lstrip('\n'),
                        'sender_username': username,
                        'receiver_username': other_username,
                        'fullname': fullname,
                        'exist_status': exist_status,
                        'message_id': message_id,
                    }
                )

    async def chat_message(self, event):
        message = event['message']
        sender_username = event['sender_username']
        receiver_username = event['receiver_username']
        receiver_fullname = await self.get_fullname_by_username(receiver_username)
        sender_fullname = event['fullname']
        exist_status = event['exist_status']
        message_id = event['message_id']
        count_unread_msg = await self.get_count_unread(sender_username, receiver_username)

        await self.send(text_data=json.dumps({
            'message': message,
            'sender_username': sender_username,
            'sender_fullname': sender_fullname.title(),
            'sender_first_name': sender_fullname.split(' ')[0].title(),
            'sender_last_name': sender_fullname.split(' ')[1].title(),

            'exist_status': exist_status,
            'message_id': message_id,
            'count_unread_msg': count_unread_msg,

            'receiver_username': receiver_username,
            'receiver_fullname': receiver_fullname.title(),
            'receiver_first_name': receiver_fullname.split(' ')[0].title(),
            'receiver_last_name': receiver_fullname.split(' ')[1].title(),

        }))

    async def read_unread(self, event):
        message_id = event['message_id']
        sender = event['sender']
        receiver = event['receiver']
        count_unread_msg = event['count_unread_msg']

        await self.send(text_data=json.dumps({
            'message_id': message_id,
            'sender': sender,
            'receiver': receiver,
            'count_unread_msg': count_unread_msg,
            'type': 'read_unread',
        }))


    async def disconnect(self, code):
        self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def save_message(self, username, receiver, thread_name, message):
        return PrivateChat.objects.create(sender=username, receiver=receiver, message=message, thread_name=thread_name).id

    @database_sync_to_async
    def exist_dialog(self, sender, receiver):
        if PrivateChat.objects.filter(Q(sender=sender, receiver=receiver) | Q(receiver=sender, sender=receiver)):
            return True
        return False


    @database_sync_to_async
    def get_username_by_id(self, user_id):
        return User.objects.get(pk=int(user_id)).username


    @database_sync_to_async
    def get_fullname_by_username(self, username):
        return User.objects.get(username=username).full_name


    @database_sync_to_async
    def update_read_status(self, message_id):
        return PrivateChat.objects.filter(id=message_id).update(read=True)

    @database_sync_to_async
    def get_count_unread(self, receiver, sender):
        return PrivateChat.objects.filter(sender=receiver, receiver=sender, read=False).count()
