from django.core.exceptions import ObjectDoesNotExist

from .models import FriendRequest, User

def friend_request_notification(request):
    if request.user.is_authenticated:
        try:
            receivers_username = FriendRequest.objects.filter(receiver=User.objects.get(username=request.user.username))
        except ObjectDoesNotExist:
            payload = {'result': 'error'}
        else:

            payload = {'Receivers': []}
            receivers = []

            for res_username in receivers_username:
                if res_username.is_active:
                    receivers.append(User.objects.get(username=str(res_username)))

            for rec in receivers:
                try:
                    friend_request = FriendRequest.objects.get(receiver=request.user, sender=rec, is_active=True)
                except ObjectDoesNotExist:
                    payload['count_friend_requests'] = len(payload['Receivers'])
                else:
                    if rec.first_name == '':
                        rec.first_name = 'Аноним'

                    payload['Receivers'].append({
                        'receiver_avatar': str(rec.avatar),
                        'receiver_first_name': rec.first_name,
                        'receiver_last_name': rec.last_name,
                        'receiver_username': rec.username,
                        'friend_request_id': FriendRequest.objects.get(receiver=request.user, sender=rec, is_active=True).id,
                        'sender_username': str(friend_request.sender),
                    })


            payload['count_friend_requests'] = len(payload['Receivers'])
            return payload

    else:
        return {'error_requests': True}

