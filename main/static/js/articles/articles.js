// Открыть меню
function open_menu(){
    const username = JSON.parse(document.getElementById('json-username').textContent);
    body = document.querySelector('body')
    theme = document.querySelector('.current_theme').innerHTML

    // Отображение
    if (username){
        link_to_profile = '/profile/' + username
        // Смена темы
        if (theme == 'blue'){
            body.innerHTML += `<div class="menu color_menu">
                                        <a class="element-menu" href="${link_to_profile}">Профиль</a>
                                        <a class="element-menu" href="/blog/articles">Публикации</a>
                                        <a class="element-menu" href="#">Товарищи</a>
                                        <a class="element-menu" href="#">Сообщения</a>
                                        <a class="element-menu" href="/exit">Выйти</a>
                                        <a class="element-menu" href="#" onclick="change_theme()">Сменить тему</a>
                                    </div>`
        }
        else{
            body.innerHTML += `<div class="menu">
                                        <a class="element-menu" href="${link_to_profile}">Профиль</a>
                                        <a class="element-menu" href="/blog/articles">Публикации</a>
                                        <a class="element-menu" href="#">Товарищи</a>
                                        <a class="element-menu" href="#">Сообщения</a>
                                        <a class="element-menu" href="/exit">Выйти</a>
                                        <a class="element-menu" href="#" onclick="change_theme()">Сменить тему</a>
                                    </div>`
        }
    }
    else{
        if (theme == 'blue'){
            body.innerHTML += `<div class="menu color_menu">
                                    <a class="element-menu" href="/blog/articles">Публикации</a>
                                    <a class="element-menu" href="#">Товарищи</a>
                                    <a class="element-menu" href="#">Сообщения</a>
                                    <a class="element-menu" href="/exit">Выйти</a>
                                    <a class="element-menu" href="#" onclick="change_theme()">Сменить тему</a>
                                </div>`
        }
        else{
            body.innerHTML += `<div class="menu">
                                    <a class="element-menu" href="/blog/articles">Публикации</a>
                                    <a class="element-menu" href="#">Товарищи</a>
                                    <a class="element-menu" href="#">Сообщения</a>
                                    <a class="element-menu" href="/exit">Выйти</a>
                                    <a class="element-menu" href="#" onclick="change_theme()">Сменить тему</a>
                                </div>`
        }
        
    }


    body.innerHTML += '<div class="blackout" onclick="close_menu()"></div>'

    menu = document.querySelector('.menu')
    blackout = document.querySelector('.blackout')

    // Анимация
    menu.style.top = '-100px';
    setTimeout(() => {menu.style.top = '0px';}, 500);

    blackout.style.right = '-1920px';
    setTimeout(() => {blackout.style.right = '0px';}, 500);
}

// Закрыть меню
function close_menu(){
    body = document.querySelector('body')
    menu = document.querySelector('.menu')
    blackout = document.querySelector('.blackout')

    // Анимация
    menu.style.top = '0px';
    setTimeout(() => {menu.style.top = '-100px';}, 500);

    blackout.style.right = '0px';
    setTimeout(() => {blackout.style.right = '-1920px';}, 500);

    setTimeout(() => {
        body.removeChild(menu)
        body.removeChild(blackout)
    }, 1500);
    
}

// Анимация
function change_opacity_up(elem, i){
    elem.style.opacity = '0%'
    setTimeout(function() {elem.style.opacity = '100%'}, 200*i);
}

// Анимация
function change_opacity_down(elem, i, total_count){
    elem.style.opacity = '100%'
    setTimeout(function() {elem.style.opacity = '0%'}, (total_count*200)-200*i);
}

// Открытие уведомлений
function open_notifications(){
    notif = document.querySelector('.popup-notification')
    fr_req = document.getElementsByClassName('friend_request')
    if (notif.className.includes('hide')){
        notif.classList.remove('hide')
        
        // Анимация
        notif.style.height = '0px';
        setTimeout(() => {notif.style.height = fr_req.length*100+30 + 'px';}, 100);
    
        for (var i = 0; i <= fr_req.length - 1; i++ ) {
            change_opacity_up(fr_req[i], i)
        }
    }
    
    else{
        notif.style.height = fr_req.length*100+30 + 'px'
        setTimeout(() => {notif.style.height = '0px'}, 100);
        
        // Анимация
        for (var i = fr_req.length-1; i >= 0; i-- ) {
            change_opacity_down(fr_req[i], i, fr_req.length)
        }
        
        setTimeout(() => {notif.classList.add('hide')}, 1000);
        
    }
    
    
}

// Изменение темы
function change_theme(){
    body = document.querySelector('body')
    category = document.getElementsByClassName('category')
    menu = document.querySelector('.menu')
    current_theme = document.querySelector('.current_theme').innerHTML
    
    if (current_theme == 'gray'){
        body.className += ' body_color'
        menu.className += ' menu_color'

        for (var i = 0; i < category.length; i++) {
            category[i].className += ' category_color'
        }
        
        document.querySelector('.current_theme').innerHTML = 'blue'
    }

    else{
        body.classList.remove('body_color') 
        menu.classList.remove('menu_color') 

        for (var i = 0; i < category.length; i++) {
            category[i].classList.remove('category_color')
        }
        
        document.querySelector('.current_theme').innerHTML = 'gray'
    }

}

// Выпадающий элемент с кнопками "Войти, регистрация"
function login_dropdown(){
    login_reg = document.querySelector('.login_reg')

    if (login_reg.className.includes('hide')){
        login_reg.classList.remove('hide')

        // Анимация
        login_reg.style.height = '0px';
        setTimeout(() => {login_reg.style.height = '90px';}, 100);
    }
    else{
        // Анимация
        login_reg.style.height = '90px';
        setTimeout(() => {login_reg.style.height = '0px';}, 100);

        setTimeout(() => {login_reg.classList.add('hide')}, 500);
        
    }
}

// Выпадающий элемент с кнопкой "Выйти"
function username_dropdown(){
    exit = document.querySelector('.exit')

    if (exit.className.includes('hide')){
        exit.classList.remove('hide')

        // Анимация
        exit.style.height = '0px';
        setTimeout(() => {exit.style.height = '60px';}, 100);
    }
    else{
        // Анимация
        exit.style.height = '60px';
        setTimeout(() => {exit.style.height = '0px';}, 100);

        setTimeout(() => {exit.classList.add('hide')}, 500);
        
    }
}

// Вывод статей
function print_articles(parent, articles) {
    for (key in articles){
        article = articles[key].fields
        const div = document.createElement('div')
        div.className = 'article'
        div.innerHTML = `
            <div class="article-header"><a href="user_article/${articles[key].pk}">${article.title}</a></div>
                <p class="article-content">
                    ${article.content.slice(0, 300) + '...'} <span class="read_continuation"><a href="user_article/${articles[key].pk}">Читать дальше</a></span>
                </p>

                <div class="likes">
                    <img src="/static/images/like_pub.png" alt="Лайк" class="heart">
                    <span class="total_likes">${article.likes}</span>
            </div>
        `
        parent.appendChild(div)
    }
}

// Строка реузльтата
function sting_result(parent, search_value, articles_length){
    // Строка результата
    const find_result = document.createElement('div')
    find_result.className = 'find_result'
    category = document.querySelector('.current_category')

    if (search_value == ""){
        if (category.innerHTML == "all")
            find_result.innerHTML = "Все статьи"
        else{
            find_result.innerHTML = 'Все результаты в категории ' + document.querySelector('.current_category').innerHTML
        }
    }
    else{
        find_result.innerHTML = `По запросу "${search_value}" было найдено ${articles_length}`
    }

    parent.appendChild(find_result)

}

// Поиск статей по заголовку
function search_articles() {
    const formId = '#search-form'
    const searchbar = ".searchbar"

    $(document).on('input', formId, function(e){
        e.preventDefault()
        var formData = new FormData();
        search_value =  document.querySelector(searchbar).value
        current_category = document.querySelector('.current_category').innerHTML
        formData.append('search', search_value)
        formData.append('category', current_category)

        $.ajax({
            url: '/blog/articles',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',

            success: function (data) {
                var parent = document.querySelector('.articles')
                var articles = data.articles
                category = document.querySelector('.current_category')
                parent.innerHTML = ""

                // Строка результата
                sting_result(parent, search_value, data.articles.length)
                
                // Вывод статей
                print_articles(parent, articles)
                
                // Надпись "Пусто"
                if (data.articles.length == 0){
                    const none_div = document.createElement('div')
                    none_div.className = 'none_content'
                    none_div.innerHTML = 'Пусто'
                    parent.appendChild(none_div)
                }

                // Кнопка подрузки статей
                if (data.show_btn_continuation){
                    if ((current_category == "all") && !(data.articles.length == 0) && (search_value.length == 0)){
                        const continuation_div = document.createElement('div')
                        continuation_div.className = 'continuation'
                        continuation_div.setAttribute("onclick","load_articles()");
                        continuation_div.id = 1
                        if (data.remain_pages && !(data.remain_pages == 'finish')){
                            continuation_div.innerHTML = 'Ещё +' + data.remain_pages
                            parent.appendChild(continuation_div)
                        }
                        else if (data.remain_pages == "finish"){}
                        else{
                            continuation_div.innerHTML = 'Ещё +5'
                            parent.appendChild(continuation_div)
                        }
                    }
                }
            }
        })
    })
}
search_articles()

// Выбор категории
let categories = document.querySelectorAll(".category");
categories.forEach(function(elem) {
    elem.addEventListener("click", function() {
        document.querySelector('.searchbar').value = ''
        current_category = document.querySelector('.current_category')
        find_result = document.querySelector('.find_result')
        
        // Изменение строки результата
        current_category.innerHTML = elem.id

        // Данные для отправки на сервер
        var formData = new FormData();
        formData.append('category', current_category.innerHTML)
        
        // Отображение статей из этой категории
        $.ajax({
            url: '/blog/category_search',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',

            success: function (data) {
                var parent = document.querySelector('.articles')
                var articles = data.articles
                var search_value =  document.querySelector('.searchbar').value
                
                parent.innerHTML = ""

                // Строка результата
                sting_result(parent, search_value, data.articles.length)

                // Вывод статей
                print_articles(parent, articles)
                
                // Надпись "Пусто"
                if (data.articles.length == 0){
                    const none_div = document.createElement('div')
                    none_div.className = 'none_content'
                    none_div.innerHTML = 'Пусто'
                    parent.appendChild(none_div)
                }
                
                console.log(data.remain_pages)

                // Кнопка подрузки статей
                if (data.show_btn_continuation){
                    if (current_category.innerHTML == "all" && (search_value.length == 0)){
                        const continuation_div = document.createElement('div')
                        continuation_div.className = 'continuation'
                        continuation_div.setAttribute("onclick","load_articles()");
                        continuation_div.id = 1
                        if (data.remain_pages && !(data.remain_pages == 'finish')){
                            continuation_div.innerHTML = 'Ещё +' + data.remain_pages
                            parent.appendChild(continuation_div)
                        }
                        else if (data.remain_pages == "finish"){}
                        else{
                            continuation_div.innerHTML = 'Ещё +5'
                            parent.appendChild(continuation_div)
                        }
                    }
                }
            }
        })

    });
});

// Подгрузка по щелчку
function load_articles(){
    pagination = document.querySelector('.continuation')
    parent = document.querySelector('.articles')
    current_category = document.querySelector('.current_category').innerHTML
    search_value = document.querySelector('.searchbar').value

    // Изменение пагинации 
    pagination_value = Number(pagination.id) + 1

    // Данные для отправки на сервер
    var formData = new FormData();
    formData.append('category', current_category)
    formData.append('search', search_value)
    formData.append('pagination', pagination_value)

    // Подгрузка статей
    $.ajax({
        url: '/blog/articles',
        type: 'POST',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data',

        success: function (data) {
            var articles = data.articles

            // Подгрузка статей
            print_articles(parent, articles)
            
            // Удаление старой кнопки подгрузки
            parent.removeChild(pagination)

            // Кнопка подрузки статей
            const continuation_div = document.createElement('div')
            continuation_div.className = 'continuation'
            continuation_div.setAttribute("onclick","load_articles()")
            continuation_div.id = pagination_value
            
            if (data.remain_pages && !(data.remain_pages == 'finish')){
                continuation_div.innerHTML = 'Ещё +' + data.remain_pages
                parent.appendChild(continuation_div)
            }
            else if (data.remain_pages == "finish"){}
            else{
                continuation_div.innerHTML = 'Ещё +5'
                parent.appendChild(continuation_div)
            }

            
        }
    })


}

