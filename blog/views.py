import datetime
from django.http import JsonResponse
from django.shortcuts import render

from .models import User
from .forms import CreateArticle
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Articles, Comments
import json
from django.core import serializers


category_dict = {
                  'IT': 1,
                  'FrontEnd': 2,
                  'BackEnd': 3,
                  'Python': 4,
                  'JavaScript': 5
                }

# Поиск по категории
@csrf_exempt
def articles_category_search(request):
    if request.POST:
        category = request.POST['category']
        count_articles = 5
        articles = Articles.objects.all()
        count_articles_all = articles.count()
        
        # Отображение количества подгружаемых статей
        if (count_articles_all-count_articles) < 5 and (count_articles_all-count_articles) > 0:
            remain_pages = count_articles_all-count_articles
        elif (count_articles_all-count_articles) <= 0:
            remain_pages = 'finish'
        else:
            remain_pages = False

        # Показывать ли кнопку подгрузки
        if count_articles_all <= 5:
            show_btn_continuation = False
        else:
            show_btn_continuation = True

        if category == 'all':
            articles = serializers.serialize("json", articles[count_articles-5:count_articles])
        else:
            articles = serializers.serialize("json", Articles.objects.filter(category=category_dict[category]))

        return JsonResponse({'articles': json.loads(articles), 'show_btn_continuation': show_btn_continuation, 'remain_pages': remain_pages})

    return render(request, 'articles.html')

# Все статьи
@csrf_exempt
def articles(request):
    articles = Articles.objects.all()
    count_articles_all = articles.count()

    # Показывать ли кнопку подгрузки
    if count_articles_all <= 5:
        show_btn_continuation = False
    else:
        show_btn_continuation = True
    
    
    if request.method == 'POST':
        category = request.POST['category']
        search = request.POST['search']
        try:
            pagination = request.POST['pagination']
        except:
            pagination = 1
        
        count_articles = 5 * int(pagination)

        # Отображение количества подгружаемых статей
        if (count_articles_all-count_articles) < 5 and (count_articles_all-count_articles) > 0:
            remain_pages = count_articles_all-count_articles
        elif (count_articles_all-count_articles) <= 0:
            remain_pages = 'finish'
        else:
            remain_pages = False

        # Запрос
        if category == 'all':
            json_articles = serializers.serialize("json", articles.filter(title__istartswith = str(search).title())[count_articles-5:count_articles])
        elif search == "":
            json_articles = serializers.serialize("json", articles.filter(title__istartswith = str(search).title(), category=category_dict[category])[count_articles-5:count_articles])
        else:
            json_articles = serializers.serialize("json", articles.filter(title__istartswith = str(search).title(), category=category_dict[category]))

        return JsonResponse({'articles': json.loads(json_articles), 'remain_pages': remain_pages, 'show_btn_continuation': show_btn_continuation})

    return render(request, 'articles.html', context={'articles': articles[:5], 'show_btn_continuation': show_btn_continuation})

# Статья пользователя
@csrf_exempt
def user_article(request, pk):
    # Комментарии и ответы
    if request.method == 'POST':
        if request.POST['type'] == 'comment':
            article_id = request.POST['article_id']
            comment_author = request.POST['comment_author']
            comment_content = request.POST['comment_content']

            article = Articles.objects.get(pk=int(article_id))
            author = User.objects.get(username=comment_author)

            comment = Comments.objects.create(article=article, author=author, content=comment_content)
            comment_id = comment.id
            comment_timestamp = format_date(comment.timestamp)
            comment_content = comment.content
            author_avatar = str(author.avatar)
            author_first_name = author.first_name.title()
            author_username = author.username


            return JsonResponse({
                'comment_id': comment_id,
                'author_avatar': author_avatar,
                'author_first_name': author_first_name,
                'author_username': author_username,
                'comment_timestamp': comment_timestamp,
                'comment_content': comment_content,
                })
        
        elif request.POST['type'] == 'answer':
            article_id = request.POST['article_id']
            comment_id = request.POST['comment_id']
            answer_author = request.POST['answer_author']
            answer_content = request.POST['answer_content']

            comment = Comments.objects.get(pk=comment_id)
            answer_author = User.objects.get(username=answer_author)
            article = comment.article

            answer = Comments.objects.create(content=answer_content, parent=comment, author=answer_author, article=article)

            return JsonResponse({
                'answer_id': answer.id,
                'comment_id': comment_id,
                'author_first_name': answer.author.first_name,
                'author_avatar': str(answer.author.avatar),
                'author_username': answer.author.username,
                'answer_timestamp': format_date(answer.timestamp),
                'answer_content': answer.content,
                })
        
        elif request.POST['type'] == 'like_article':
            article = Articles.objects.get(pk=request.POST['article_id'])
            author = User.objects.get(username=request.POST['author_like'])

            if author not in article.likes.all():
                article.likes.add(author)
                article.save()
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False})
        
        elif request.POST['type'] == 'like_comment':
            comment = Comments.objects.get(pk=request.POST['comment_id'])
            auhor_like = User.objects.get(username=request.POST['author_like'])

            if auhor_like not in comment.likes.all():
                comment.likes.add(auhor_like)
                comment.save()
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False})
        
    else:
        article = Articles.objects.get(pk=pk)
        comments = Comments.objects.filter(article=article)

        # Формирование словаря из комментариев и ответов на комментарии
        comments_context = []
        for comment in comments:
            if not comment.parent:
                answers = Comments.objects.filter(article=article, parent=comment)
                comments_context.append({'comment': comment, 'answers': answers})

        # Форматирование даты
        comments_date = {}
        for i in comments:
            comments_date[i.id] = format_date(i.timestamp)

    return render(request, 'user_article.html', context={
                                                        'article': article,
                                                        'count_comments': comments.count(),
                                                        'comments': comments_context,
                                                        'comments_data': comments_date,
                                                        })

# Создание статьи
@csrf_exempt
def create_article(request):
    if request.method == "POST":
        form = CreateArticle(request.POST)
        if form.is_valid():
            form.instance.author = request.user
            form.save()
            return JsonResponse({'success': True, 'article_id': form.save().id})
        else:
          return JsonResponse({
              'success': False,
              'errors': form.errors
              }) 

    form = CreateArticle()
    return render(request, 'new_article.html', {'form': form})






# Форматирование даты
def format_date(date):
    a = str(date).split(' ')[0].replace('-', '/')
    b = a.split('/')
    c = b[2] + '/' + b[1] + '/' + b[0]
    return c
    