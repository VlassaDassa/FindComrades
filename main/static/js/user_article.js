// Открыть форму для написания комментария
function show_write_comment(){
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]
    var label = document.querySelector('.write_comment')
    var parent = document.querySelector('.comments-list')

    parent.removeChild(label)

    parent.innerHTML += `
                        <div id="write_comm" class="input_comment">
                            <form action="/blog/user_article/${article_id}" id="send-comm-form">
                            <textarea class="input_comm" cols="30" rows="10"></textarea>
                            <div class="comment_btn">
                                <input class="send_comm" id="send_comment_${article_id}" type="submit">
                                <div class="close_write_comment" onclick="close_write_comment()">Закрыть</div>
                            </div>
                            </form>
                        </div>
                        `
}

// Открыть форму для ответа на комментарий
function show_answer_comment(el){
    var comment_id = el.parentNode.parentNode.parentNode.id
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]

    var old_input = document.querySelector('#write_comm')
    var old_input_2 = document.querySelector('#answer_comm')
    var label = document.querySelector('.write_comment')
    var parent = document.querySelector('.comments-list')

    if (label){
        parent.removeChild(label)
    }

    if (old_input){
        parent.removeChild(old_input)
    }

    if (old_input_2){
        parent.removeChild(old_input_2)
    }

    parent.innerHTML += `<div id="answer_comm" class="input_comment">
                            <form action="/blog/user_article/${article_id}" id="send-answer-form">
                                <textarea class="input_comm" cols="30" rows="10"></textarea>
                                <div class="comment_btn">
                                    <input class="send_comm" id="send_answer_${comment_id}" type="submit">
                                    <div class="close_write_comment" onclick="close_write_comment()">Закрыть</div>
                                </div>
                        </div>
                        `

    window.scrollTo(0, document.body.scrollHeight);
}

// Закрыть форму отправки комментария или ответа
function close_write_comment(){
    var write_comm = document.querySelector('#write_comm')
    var answer_comm = document.querySelector('#answer_comm')
    var parent = document.querySelector('.comments-list')

    if (write_comm){
        parent.removeChild(write_comm)
    }

    if (answer_comm){
        parent.removeChild(answer_comm)
    }

    parent.innerHTML += '<p onclick="show_write_comment()" class="write_comment">Написать комментарий</p>'
}

// Создание комментария в БД
function send_comm() {
    const form_id= '#send-comm-form'
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]
    var parent = document.querySelector('.comments-list')

    $(document).on('submit', form_id, function(e){
        e.preventDefault()

        var comment_author = document.querySelector('.dropbtn').innerHTML
        var comment_content = document.querySelector('.input_comm').value

        // Если пусто, просто закрыть
        if (comment_content.length == 0){
            close_write_comment()
        }

        else{
            $.ajax({
                url: '/blog/user_article/' + article_id,
                type: 'POST',
                dataType: 'json',
                data: {
                    'article_id': article_id,
                    'comment_author': comment_author,
                    'comment_content': comment_content,
                    'type': 'comment',
                },

                success: function (data) {
                    // Отрисовка комментария
                    if (document.querySelector('.none-comments')){
                        parent.removeChild(document.querySelector('.none-comments'))
                    }
                    close_write_comment()
                    print_comment(data)
                }
            })
        }
    })
}
send_comm()

// Отрисовка комментария
function print_comment(data){
    parent = document.querySelector('.comments-list')
    var div = document.createElement('div')
    div.className = 'user_comment'
    div.id = data.comment_id

    div.innerHTML = `
                        <div class="user_info">
                            <div class="av_name">
                                <a href="/profile/${data.author_username}"><img src="/media/${data.author_avatar}"></a>
                                <a href="/profile/${data.author_username}" class="name">${data.author_first_name}</a>
                            </div>
                            <p class="date_pub">${data.comment_timestamp}</p>
                        </div>

                        <div class="comment_content">${data.comment_content}</div>

                        <div class="comment_footer">
                            <div class="comment_likes">
                                <div class="comment_like">Нравится</div>
                                <div class="total_comment_likes">0</div>
                            </div>

                            <div class="comment_answers">
                                <div class="comment_answer" onclick="show_answer_comment(this)">Ответить</div>
                                <div class="total_answers_comment">0</div>
                            </div>
                        </div>
                    `
    p_btn_write = document.querySelector('.write_comment')
    parent.removeChild(document.querySelector('.write_comment'))
    parent.appendChild(div)
    parent.appendChild(p_btn_write)

    document.querySelector('.total_comments').innerHTML = Number(document.querySelector('.total_comments').innerHTML) + 1
}

// Вставить после элемента
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Отрисовка ответа на комментарий
function print_answer(data){
    var parent = document.querySelector('.comments-list')
    var comment = document.getElementById(comment_id)

    var div = document.createElement('div')
    div.className = 'user_comment answer'
    div.id = data.answer_id

    div.innerHTML = `
                        <div class="user_info">
                            <div class="av_name">
                                <a href="/profile/${data.author_username}"><img src="/media/${data.author_avatar}"></a>
                                <a href="/profile/${data.author_username}" class="name">${data.author_first_name}</a>
                            </div>
                            <p class="date_pub">${data.answer_timestamp}</p>
                        </div>

                        <div class="comment_content">${data.answer_content}</div>

                        <div class="comment_footer">
                            <div class="comment_likes">
                                <div class="comment_like">Нравится</div>
                                <div class="total_comment_likes">0</div>
                            </div>
                        </div>
                    `

    // Вставка готового элемента
    p_btn_write = document.querySelector('.write_comment')
    parent.removeChild(document.querySelector('.write_comment'))
    insertAfter(comment, div)
    parent.appendChild(p_btn_write)
    
    // Изменение цифр
    comment.querySelector('.total_answers_comment').innerHTML = Number(comment.querySelector('.total_answers_comment').innerHTML) + 1
    document.querySelector('.content-info').querySelector('.total_comments').innerHTML = Number(document.querySelector('.content-info').querySelector('.total_comments').innerHTML) + 1
    document.querySelector('.title_comments').querySelector('.total_comments').innerHTML = Number(document.querySelector('.title_comments').querySelector('.total_comments').innerHTML) + 1
}

// Ответ на комментарий в БД
function send_answer() {
    const form_id= '#send-answer-form'
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]

    $(document).on('submit', form_id, function(e){
        e.preventDefault()
        comment_id = document.querySelector('.send_comm').id.split('_')[2]
        
        var comment_author = document.querySelector('.dropbtn').innerHTML
        var comment_content = document.querySelector('.input_comm').value

        // Если пусто, просто закрыть
        if (comment_content.length == 0){
            close_write_comment()
        }
        else{
            $.ajax({
                url: '/blog/user_article/' + article_id,
                type: 'POST',
                dataType: 'json',
                data: {
                    'article_id': article_id,
                    'comment_id': comment_id,
                    'answer_author': comment_author,
                    'answer_content': comment_content,
                    'type': 'answer',
                },

                success: function (data) {
                    // // Отрисовка комментария
                    close_write_comment()
                    print_answer(data)
                }
            })
        }
    })
}
send_answer()


// Лайк на статью
$('.like').click(function(e) {
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]
    var like_author = document.querySelector('.dropbtn').innerHTML
    e.preventDefault();

    $.ajax({
      method: "POST",
      url: '/blog/user_article/' + article_id,
      dataType: "json",
      data: {
        "article_id": article_id,
        'author_like': like_author,
        'type': 'like_article'
      },
      success: function(data) {
        if (data.success){
            document.querySelector('.total_likes').innerHTML = Number(document.querySelector('.total_likes').innerHTML) + 1
        }
      }

    })
})


// Лайк на комментарий
$(document).on("click", ".comment_like", function(e){
    var article_id = window.location.href.split('/')[window.location.href.split('/').length - 1]
    var like_author = document.querySelector('.dropbtn').innerHTML
    var comment_id = e.target.parentNode.parentNode.parentNode.id

    e.preventDefault();

    $.ajax({
      method: "POST",
      url: '/blog/user_article/' + article_id,
      dataType: "json",
      data: {
        "article_id": article_id,
        'author_like': like_author,
        'comment_id': comment_id,
        'type': 'like_comment'
      },
      success: function(data) {
        if (data.success){
            e.target.parentNode.querySelector('.total_comment_likes').innerHTML = Number(e.target.parentNode.querySelector('.total_comment_likes').innerHTML) + 1
        }
      }

    })
});





