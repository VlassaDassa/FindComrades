// Replace content
const replace_content = event => {
    const btn_id = event.target.id
    if (btn_id) {
        const relation = {
            'btn-comrades': 'content-comrades',
            'btn-online': 'content-free',
            'btn-find': 'content-find'
                        }

        //Change color button's
        for (let key in Object.keys(relation)) {
            document.getElementById(Object.keys(relation)[key]).classList.remove("selected");
            }
        document.getElementById(btn_id).classList.add("selected");

        // Change content
        for (let key in Object.values(relation)) {
            document.getElementsByClassName(Object.values(relation)[key])[0].classList.add("hide");
            }

        document.getElementsByClassName(relation[btn_id])[0].classList.remove("hide");
    }
}

// Listener for "Replace content"
document.querySelector(".tabs").addEventListener("click", replace_content)




// Autocomplete skills
$(function () {
            $("#skills_tag").autocomplete({
            source: '/comrades_tags',
            minLength: 1
        });
    });


// Autocomplete city
$(function () {
            $("#city").autocomplete({
            source: '/comrades_city',
            minLength: 1
        });
    });







// Filter and searchbar in "Find comrades"
function find_comrades() {
    const formId = '#form_for_find'
    var fullname_id = '#search_for_find'
    var skills_id = '#skills_tag'
    var city_id = '#city'
    var start_interval_id = '#start-interval'
    var end_interval_id = '#end-interval'

    $(document).on('input', formId, function(e){
        e.preventDefault()
        var formData = new FormData();

        formData.append('form', 'find')
        formData.append('fullname', $(fullname_id).val())
        formData.append('city',  $(city_id).val())
        formData.append('start_interval', $(start_interval_id).val())
        formData.append('end_interval', $(end_interval_id).val())
        formData.append('gender', [...document.querySelectorAll('.gender_check:checked')].map(e => e.value))
        formData.append('skills', [...document.querySelectorAll('.tag-text')].map(e => e.textContent))

        $.ajax({
            url: '/comrades',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',

            success: function (data) {
                if ('Users' in data) {
                  document.querySelector('.people').innerHTML = '';
                  for (let key in data['Users']){

                    const div = document.createElement('div');

                    div.className = 'comrade new';

                    // Online status
                    if (data['Users'][key]['online_status']){
                        online_class = 'circle'
                    }
                    else{
                        online_class = 'circle offline'
                    }

                    div.innerHTML = `
                                        <a href="/profile/${data['Users'][key]['username']}"><img class="comrade-avatar" src="/media/${data['Users'][key]['avatar']}"><div class="${online_class}"></div></a>

                                        <div class="full-name">
                                            <p class="first_name">${data['Users'][key]['first_name']}</p>
                                            <p class="last_name">${data['Users'][key]['last_name']}</p>
                                        </div>

                                        <div class="comrade-btn">
                                            <button class="send_message" id="${data['Users'][key]['username']}">Написать</button>
                                            <button class="friend_request add_friend" id="${data['Users'][key]['username']}">Добавить</button>
                                        </div>
                                `;

                    document.querySelector('.people').appendChild(div);
                                                }
                }

                else {
                    document.querySelector('.people').innerHTML = '<p class="none_friend">Пусто<p>';
                }
            }
    });
});
}

find_comrades();



// Filter and searchbar in "Comrades"
function comrades() {
    const formId = '#form_for_comrades'
    var fullname_id = '#search_for_comrades'

    $(document).on('input', formId, function(e){
        e.preventDefault()
        var formData = new FormData();

        formData.append('form', 'comrades')
        formData.append('fullname', $(fullname_id).val())

        $.ajax({
            url: '/comrades',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',

            success: function (data) {
                if ('Users' in data) {
                  document.querySelector('.comrades-people').innerHTML = '';
                  for (let key in data['Users']){

                    const div = document.createElement('div');

                    div.className = 'comrade';

                    // Online status
                    if (data['Users'][key]['online_status']){
                        online_class = 'circle'
                    }
                    else{
                        online_class = 'circle offline'
                    }

                    div.innerHTML = `
                                        <a href="/profile/${data['Users'][key]['username']}"><img class="comrade-avatar" src="/media/${data['Users'][key]['avatar']}"><div class="${online_class}"></div></a>

                                        <div class="full-name">
                                            <p class="first_name">${data['Users'][key]['first_name']}</p>
                                            <p class="last_name">${data['Users'][key]['last_name']}</p>
                                        </div>

                                        <div class="comrade-btn">
                                            <button class="send_message" id="${data['Users'][key]['username']}">Написать</button>
                                            <button class="friend_request delete_friend" id="${data['Users'][key]['username']}">Убрать</button>
                                        </div>
                                `;

                    document.querySelector('.comrades-people').appendChild(div);
                                                }
                }

                else {
                    document.querySelector('.comrades-people').innerHTML = '<p class="none_friend_comfree">Пусто<p>';
                }
            }
    });
});
}

comrades();




// Filter and searchbar in "Free"
function comrades_free() {
    const formId = '#form_for_free'
    var fullname_id = '#search_for_free'

    $(document).on('input', formId, function(e){
        e.preventDefault()
        var formData = new FormData();

        formData.append('form', 'free')
        formData.append('fullname', $(fullname_id).val())

        $.ajax({
            url: '/comrades',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',

            success: function (data) {
                if ('Users' in data) {
                  document.querySelector('.comrades-free').innerHTML = '';
                  for (let key in data['Users']){

                    const div = document.createElement('div');

                    div.className = 'comrade';

                    // Online status
                    if (data['Users'][key]['online_status']){
                        online_class = 'circle'
                    }
                    else{
                        online_class = 'circle offline'
                    }

                    div.innerHTML = `
                                        <a href="/profile/${data['Users'][key]['username']}"><img class="comrade-avatar" src="/media/${data['Users'][key]['avatar']}"><div class="${online_class}"></div></a>

                                        <div class="full-name">
                                            <p class="first_name">${data['Users'][key]['first_name']}</p>
                                            <p class="last_name">${data['Users'][key]['last_name']}</p>
                                        </div>

                                        <div class="comrade-btn">
                                            <button class="send_message" id="${data['Users'][key]['username']}">Написать</button>
                                            <button class="friend_request delete_friend" id="${data['Users'][key]['username']}">Убрать</button>
                                        </div>
                                `;

                    document.querySelector('.comrades-free').appendChild(div);
                                                }
                }

                else {
                    document.querySelector('.comrades-free').innerHTML = '<p class="none_friend_comfree">Пусто<p>';
                }
            }
    });
});
}

comrades_free();


