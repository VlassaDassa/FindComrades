/*
    Отображение уведомления у получателя во вкладке, при клике на:
    "Добавить", "Отменить запрос"
*/

// Show notifications a receiver
let fr_req_url = `ws://${window.location.host}/ws/friend_request_comrades/`
const fr_req_socket = new WebSocket(fr_req_url)

// Отображение уведомления
fr_req_socket.onmessage = function(e){
    let data = JSON.parse(e.data).data.value
    current_user = document.querySelector('.dropbtn').innerHTML

    // Если текущий пользователь это получатель
    if (String(current_user) == String(data.user_receiver)){
        if (!(data.request_type == 'cancel_friend_request') || !(data.request_type == 'delete_friend')){
            var audio = new Audio('/media/vk.mp3');
            audio.play()
        }

        document.querySelector('.total_notif').innerHTML = '';
        document.querySelector('.total_notif').innerHTML = data.count_notifications;

        if ((data.count_notifications == 0 ) && !(data.request_type == 'delete_friend')){
            const none_notif = document.createElement('div');
            none_notif.className = 'none_notif';
            none_notif.innerHTML = 'Сегодня уведомлений не было замечено'
            document.querySelector('.notifications-content').appendChild(none_notif)
        }


        // Добавление уведомления
        if (data.request_type === 'add_friend'){
            // Убрать надпись об отсутствии уведомлений
            if (document.querySelector(".none_notif")){
                document.querySelector(".notifications-content").removeChild(document.querySelector(".none_notif"))
                }

            const div = document.createElement('div');
            div.className = 'friend_request_notification';
            div.setAttribute('id', 'notif_' + data.friend_request_id)

            // Если есть имя и фамилия
            if (data.last_name){
                div.innerHTML = `
                                <a href="/profile/${data.user_sender}"><img height="100" id="receiver_avatar" src="/media/${data.avatar}"></a>
                                <p id="title_friend_request">Отправлен запрос на дружбу!</p>
                                <p class="sender_username" style="display: none">${data.user_sender}</p>
                                <p id="description_friend_request">${data.first_name} ${data.last_name}<br>Хочет стать вашим товарищем</p>
                                <a id="accept_${data.friend_request_id}" class="friend_request_btn">Добавить</a>
                                <a id="cancel_${data.friend_request_id}" class="friend_request_btn">Отмена</a>`;
            }
            else{
                div.innerHTML = `
                                <a href="/profile/${data.user_sender}"><img height="100" id="receiver_avatar" src="/media/${data.avatar}"></a>
                                <p id="title_friend_request">Отправлен запрос на дружбу!</p>
                                <p class="sender_username" style="display: none">${data.user_sender}</p>
                                <p id="description_friend_request">${data.user_sender}<br>Хочет стать вашим товарищем</p>
                                <a id='accept_${data.friend_request_id}' class="friend_request_btn">Добавить</a>
                                <a id='cancel_${data.friend_request_id}' class="friend_request_btn">Отмена</a>`;
                }

            document.querySelector('#notif_content').appendChild(div);
        }

        // Удаление уведомления
        else if (data.request_type === 'cancel_friend_request' || data.request_type === 'add_friend'){
            $("#notif_" + data.friend_request_id).remove()
        }
    }
}



// Send to consumers
if (!document.URL.includes('comrades')){
}
else{
    $(document).on("click", ".friend_request", function(e){
        e.preventDefault()

        // Определяем тип кнопки
        btn_class = $(e.target)[0].className
        if (btn_class.includes('delete_friend')){
            type_btn = 'delete_friend'

            // Изменение кнопки
            $(e.target)[0].className = 'friend_request add_friend'
            $(e.target)[0].innerHTML = 'Добавить'
        }

        else if (btn_class.includes('cancel_friend_request')){
            type_btn = 'cancel_friend_request'

            // Изменение кнопки
            $(e.target)[0].className = 'friend_request add_friend'
            $(e.target)[0].innerHTML = 'Добавить'

            $(e.target)[0].parentNode.style.left = '-20px'
        }

        else if (btn_class.includes('add_friend')){
            type_btn = 'add_friend'

            // Изменение кнопки
            $(e.target)[0].className = 'friend_request cancel_friend_request'
            $(e.target)[0].innerHTML = 'Отменить запрос'

            $(e.target)[0].parentNode.style.left = '0px'
        }

        // Определяем username получателя
        receiver_username = $(e.target)[0].id

        // Определяем username отправителя
        sender_username = document.querySelector('.dropbtn').innerHTML


        // Отправка информации в consumers
        fr_req_socket.send(JSON.stringify({
            'type': 'data_to_get',
            'btn_type': type_btn,
            'receiver_username': receiver_username,
            'sender_username': sender_username,
        }))
    })
}
// /Show notifications a receiver

