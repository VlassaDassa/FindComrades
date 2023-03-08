import datetime
from django.http import JsonResponse
from django.shortcuts import render
from main.models import User
from chat.models import PrivateChat
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def chatPage(request, username):
        user_obj = User.objects.get(username=username)

        if request.user.id > user_obj.id:
            thread_name = f'chat_{request.user.id}-{user_obj.id}'
        else:
            thread_name = f'chat_{user_obj.id}-{request.user.id}'

        message_objs = PrivateChat.objects.filter(thread_name=thread_name)

        # Online
        last_online = int(round(
            (datetime.datetime.now().replace(tzinfo=None) - user_obj.last_online.replace(tzinfo=None)).total_seconds() / 60, 0))
        if last_online > 1:
            online_status = None
        else:
            online_status = True


        # Формирование контекста, в котором будет находиться информация об уже начатых диалогах
        started_dialogues = []
        chat_obj = PrivateChat.objects.filter(Q(sender=request.user.username) | Q(receiver=request.user.username))
        companion_list = []

        for i in chat_obj:
            if i.receiver == request.user.username:
                companion_list.append(i.sender)
            else:
                companion_list.append(i.receiver)

        for i in set(companion_list):
            message = PrivateChat.objects.filter(Q(sender=request.user.username, receiver=i) | Q(sender=i, receiver=request.user.username)).last()

            if message.receiver == request.user.username:
                username = message.sender
            else:
                username = message.receiver

            fullname = User.objects.get(username=username).full_name

            default_message = message.message
            if len(message.message) >= 17:
                message = message.message[0:17] + '...'
            else:
                message = message.message

            sender_message = PrivateChat.objects.filter(message=default_message).last().sender

            count_unread_msg_alien = PrivateChat.objects.filter(sender=i, receiver=request.user.username, read=False).count()
            count_unread_msg_my = PrivateChat.objects.filter(sender=request.user.username, receiver=i, read=False).count()


            started_dialogues.append({'last_message': message, 'username': username, 'fullname': fullname.title(), 'sender_message': sender_message, 'count_unread_msg_alien': count_unread_msg_alien, 'count_unread_msg_my': count_unread_msg_my})


        return render(request, 'personal_chat.html', context={'user': user_obj, 'online_status': online_status, 'messages': message_objs, 'started_dialogues': started_dialogues})



