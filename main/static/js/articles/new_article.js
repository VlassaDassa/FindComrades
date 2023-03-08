// Вывод ошибок рядом с полями
function print_errors(errors){
    for (let key in errors) {
        const div = document.createElement('div');
        div.className = 'error ' + key
        div.innerHTML = errors[key][0]

        if (key == 'content'){
            document.querySelector('#article-' + key).parentNode.appendChild(div)
        }
        else{
            document.querySelector('#id_' + key).parentNode.appendChild(div)
        }
    }
}

// Удаление ошибок
function del_errors(errors){
    var errors = document.querySelectorAll('.error')

    if (errors){
        errors.forEach(function(error) {
            error.parentNode.removeChild(error)
        });
    }
}

// Добавление стилей для неправильных полей
function add_invalid_style(errors){
    for (let key in errors) {
        const div = document.createElement('div');
        div.className = 'error ' + key
        div.innerHTML = errors[key][0]

        if (key == 'content'){
            document.querySelector('#article-' + key).classList.add('invalid-feedback')
        }
        else{
            document.querySelector('#id_' + key).classList.add('invalid-feedback')
        }
    }
}

// Удаление стилей для неправильных полей
function del_style_errors(){
    class_errors = 'invalid-feedback'
    var errors = document.querySelectorAll('.' + class_errors)

    if (errors){
        errors.forEach(function(error) {
            error.classList.remove(class_errors)
        });
    }
}

// Удаление неправильного содержимого
function del_content(errors){
    var field_errors = document.querySelectorAll('.invalid-feedback')

    if (field_errors){
        field_errors.forEach(function(field) {
            if (!(field.id == "article-content")){
                field.value = ""
            }
        });
    }
}

// Счётчик символов
function char_counter(content){
    var len_content = content.length
    var div_char_counter = document.querySelector('.char_counter')

    if (len_content >= 150){
        div_char_counter.classList.add('succes')
    }
    else{
        div_char_counter.classList.remove('succes')
    }

    div_char_counter.innerHTML = len_content + '/150'
}

// Счётчик символов
content = document.querySelector('#article-content')
content.addEventListener('input', function (evt) {
    char_counter(content.value)
});


// Print field errors in form
function save_article() {
    form = document.querySelector('#article-form')
    title = document.querySelector('#id_title')
    content = document.querySelector('#article-content')
    category = document.querySelector('#id_category')
    tags = document.querySelector('#id_tags')

    list_element_ids = ['#id_title', '#article-content', '#id_category', '#id_tags']

    $(document).on('submit', '#article-form', function (e) {
        e.preventDefault()

        btn = document.querySelector('.submit_btn')
        btn.disabled = true

        $.ajax({
            url: '/blog/create_article',
            type: 'POST',
            dataType: 'json',
            data: {
                title: title.value,
                content: content.value,
                category: category.value,
                tags: tags.value,
            },

            success: (data) => {
                errors = data.errors

                del_errors(errors)
                del_style_errors()

                if (data.success) {
                    window.location.href = `/blog/user_article/${data.article_id}`;
                }
                else{
                    btn.disabled = false
                    
                    print_errors(errors)
                    add_invalid_style(errors)
                    del_content(errors)
                }

            }
        })
    })

}

save_article()

$('#id_tags').tagsInput({placeholder: 'Добавить метку'});