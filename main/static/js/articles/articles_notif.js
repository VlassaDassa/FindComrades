// Получение, отмена запроса (со стороны отправителя) в друзья
let url = `ws://${window.location.host}/ws/notification_friend_request/`
const chatSocket = new WebSocket(url)

chatSocket.onmessage = function(e){
    // Данные полученные из consumers
    let data = JSON.parse(e.data).data.value
    current_user = document.querySelector('.login').innerHTML
    user_receiver = data.user_receiver
    user_sender = data.user_sender
    friend_request_id = data.friend_request_id
    count_notifications = data.count_notifications

    if (current_user == user_receiver){
        // Приём запроса
        if (friend_request_id){
            parent = document.querySelector('.popup-notification')

            // Стирание none надписи
            if (document.querySelector('.label-none')){
                parent.classList.remove('none')
                parent.innerHTML = ''
            }

            // Отображение запроса
            print_fr_req(parent, data)
        }

        // Отмена запроса со стороны отправителя
        else{
            // Удаление запроса в друзья
            del_fr_req(parent, user_sender)

            // Если ни одного запроса не осталось
            if (count_notifications == 0){
                notif_label = document.querySelector('.notifications')
                circle = document.querySelector('.circle')
                notif_label.removeChild(circle)

                const none_p = document.createElement('p')
                none_p.className = 'label-none'
                none_p.innerHTML = 'Ничего нет'
                parent.className += ' none'
                parent.appendChild(none_p)
            }
        }
    }
}

// Вывод запроса в друзья
function print_fr_req(parent, data){
    const div = document.createElement('div')
    div.className = 'friend_request'
    div.id = data.friend_request_id

    div.innerHTML = `
                    <div class="img_fullname">
                        <img class="sender_avatar" src="/media/${data.avatar}">
                        <p class="fr_req_text">
                            <span id="${data.user_sender}" class="fullname">${data.first_name} ${data.last_name}</span><br>
                            Предлагает вам дружбу
                        </p>
                    </div>
                    <div class="fr_req_btn">
                        <div class="friend_request_btn accept_fr_req">Дружить</div>
                        <div class="friend_request_btn decline_fr_req">Отклонить</div>
                    </div>
                    `
    parent.appendChild(div)

    if (!document.querySelector('.circle')){
        parent = document.querySelector('.notifications') 
        const circle_div = document.createElement('div')
        circle_div.className = 'circle'
        parent.appendChild(circle_div)
    }
}

// Удаление запроса
function del_fr_req(parent, user_sender){
    fr_req = document.querySelector('#' + user_sender).parentNode.parentNode.parentNode
    parent.removeChild(fr_req)
}




// Отмена и принятие запроса со стороны получателя
// Accept friend request
let url_friend_request_accept = `ws://${window.location.host}/ws/accept_friend_request/`
const friend_req_acceptSocket = new WebSocket(url_friend_request_accept)

$(document).on("click", ".friend_request_btn", function(e){
    e.preventDefault()
    parent = document.querySelector('.popup-notification')
    var receiver_username = document.querySelector('.login').innerHTML
    var friend_request_id = e.target.parentNode.parentNode.id
    var sender_username = e.target.parentNode.parentNode.querySelector('.fullname').id

    if (e.target.className.includes('decline')){
        action = 'cancel'
        }
    else{
        action = 'add'
    }

    friend_req_acceptSocket.send(JSON.stringify({
        'type': 'data_to_get',
        'action': action,
        'sender_username': sender_username,
        'friend_request_id': friend_request_id,
        'receiver_username': receiver_username,
    }))

    // Удаление запроса
    parent.removeChild(e.target.parentNode.parentNode)

    if (!document.querySelector('.friend_request')){
        notif_label = document.querySelector('.notifications')
        circle = document.querySelector('.circle')
        notif_label.removeChild(circle)

        const none_p = document.createElement('p')
        none_p.className = 'label-none'
        none_p.innerHTML = 'Ничего нет'
        parent.className += ' none'
        parent.appendChild(none_p)
    }
})