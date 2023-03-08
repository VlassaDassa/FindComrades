from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions


# Регистрация
class RegisterUserForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')

        help_texts = {
            'username': None,
            'password1': None,
        }


    def __init__(self, *args, **kwargs):
        super(RegisterUserForm, self).__init__(*args, **kwargs)

        for key in self.fields:
            self.fields[key].help_text = None
            self.fields[key].required = True
            self.fields[key].widget.attrs['class'] = 'form-control'


class LoginForm(forms.Form):
    username = forms.CharField(label='Логин')
    password = forms.CharField(widget=forms.PasswordInput, label='Пароль')

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)

        for key in self.fields:
            self.fields[key].help_text = None
            self.fields[key].required = True
            self.fields[key].widget.attrs['class'] = 'form-control'

        self.fields['username'].widget.attrs['id'] = 'id_username'
        self.fields['password'].widget.attrs['id'] = 'id_password'


# Редактирования профиля
class EditProfile(forms.ModelForm):
    class Meta:
        model = User
        fields = ('avatar', 'first_name', 'last_name', 'bio', 'city', 'age', 'skills', 'gender', 'full_name')


    def __init__(self, *args, **kwargs):
        super(EditProfile, self).__init__(*args, **kwargs)

        for key in self.fields:
            self.fields[key].help_text = None
            self.fields[key].required = True
            self.fields[key].widget.attrs['class'] = 'form-control'
            self.fields[key].widget.attrs['autocomplete'] = 'off'

        self.fields['avatar'].label = ''
        self.fields['avatar'].widget.attrs['id'] = 'form-file'
        self.fields['gender'].required = False
        self.fields['avatar'].required = False
        self.fields['skills'].required = False
        self.fields['full_name'].required = False
        self.fields['full_name'].widget = forms.HiddenInput()
        self.fields['full_name'].label = ''

        # Validators
        self.fields['avatar'].validators = [file_size]
        self.fields['age'].validators = [age_validator]
        self.fields['skills'].validators = [skills_validator]
        self.fields['bio'].validators = [bio_validator]
        self.fields['first_name'].validators = [first_name_validator]
        self.fields['last_name'].validators = [last_name_validator]
        self.fields['city'].validators = [city_validator]



# File size
def file_size(image):
    limit = 400
    w, h = get_image_dimensions(image)
    if (w < limit) or (h < limit):
        raise ValidationError('Минимальное разрешение изображения - 400x400')


# Age
alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
def age_validator(value):
    try:
        int(value)
    except:
        raise ValidationError('Неверный возраст')
    else:
        if (int(value) <= 0) or (int(value) >= 100):
            raise ValidationError('Неверный возраст')
        elif ('.' in value) or (',' in value):
            raise ValidationError('Неверный возраст')


# Skills
def skills_validator(value):
    if ',' not in value:
        raise ValidationError('Необходимо как минимум 2 умения')


# First name
def first_name_validator(value):
    if not value.isalpha():
        raise ValidationError('Имя не должно содержать лишних символов')

    if any(word.lower() in alphabet for word in value):
        raise ValidationError('Имя не должно содержать английских букв')



# Last name
def last_name_validator(value):
    if not value.isalpha():
        raise ValidationError('Фамилия не должна содержать лишних символов')

    if any(word.lower() in alphabet for word in value):
        raise ValidationError('Фамилия не должна содержать английских букв')


# Bio
def bio_validator(value):
    if len(value) < 101:
        raise ValidationError('Содержание не должно содержать меньше 100 символов')

    elif len(value) > 500:
        raise ValidationError('Максимальное количество символов - 500')


# City
def city_validator(value):
    if len(value) > 25:
        raise ValidationError('Слишком длинное название')

    elif not value.isalpha():
        raise ValidationError('Город не может содержать лишних символов')

    elif any(word.lower() in alphabet for word in value):
        raise ValidationError('Город не должен содержать английских букв')















