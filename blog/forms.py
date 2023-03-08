from django import forms
from .models import Articles, Comments
from django.core.exceptions import ValidationError


class CreateArticle(forms.ModelForm):
    class Meta:
        model = Articles
        fields = ('title', 'content', 'category', 'tags')

    def __init__(self, *args, **kwargs):
        super(CreateArticle, self).__init__(*args, **kwargs)

        for key in self.fields:
            self.fields[key].help_text = None
            self.fields[key].required = True
            self.fields[key].widget.attrs['class'] = 'form-control'

        self.fields['title'].label = 'Заголовок'
        self.fields['tags'].label = 'Метки'
        self.fields['content'].label = 'Содержимое'
        self.fields['category'].label = 'Категория'

        self.fields['content'].widget.attrs['id'] = 'article-content'
        
        self.fields['category'].required = False

        # Validators
        self.fields['title'].validators = [title_validator]
        self.fields['content'].validators = [content_validator]
        self.fields['tags'].validators = [tags_validator]


# Validators
def title_validator(title):
    if len(title) < 5 or len(title) >= 50:
        raise ValidationError('Неверное количество символов')

def content_validator(content):
    if len(content) < 150:
        raise ValidationError('Минимальное количество символов - 150')
    
def tags_validator(tags):
    if (',' not in tags) or (len(tags.split(',')) )< 2 or (len(tags) == 0):
        raise ValidationError('Минимальнок количество меток - 2')