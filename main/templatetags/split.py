from django import template
from main.models import User

register = template.Library()


@register.filter
def split_(splitable, split_at):
    return splitable.split(split_at)

@register.filter
def strip_(stripable):
    return stripable.strip()

@register.filter
def title_(title):
    return title.title()

@register.filter
def name_by_username(username):
    user_obj = User.objects.get(username=username)
    if user_obj.full_name:
        return user_obj.full_name.split(' ')[0].title()
    else:
        return user_obj.username
    
@register.filter
def get_dict_value(us_dict, key):
    return us_dict.get(key)

@register.filter
def get_limit_char(content):
    return content[0:300] + '...'

