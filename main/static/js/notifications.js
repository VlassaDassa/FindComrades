// Move element if button innerHTML == 'Отменить запрос'
$('.friend_request').each(function(i, obj) {
    if (obj.innerHTML === 'Отменить запрос'){
        obj.parentNode.style.left = '0px'
        }
    });



// Show notifications on click
function show_notifications(){
    var name_class = document.querySelector('#notif_content').className

    if (name_class.includes('hide')){
        document.querySelector('#notif_content').classList.remove("hide");
    }
    else{
        document.querySelector('#notif_content').classList.add("hide");
    }
}



// Friend request
// Connect socket
let url = `ws://${window.location.host}/ws/notification_friend_request/`
const chatSocket = new WebSocket(url)

// Print data from consumers
chatSocket.onmessage = function(e){
    let data = JSON.parse(e.data).data.value

    // If OK and current user is receiver
    if (String(data.user_receiver) === String(document.querySelector('.dropbtn').innerHTML) && data.result){
        // Show data
        var audio = new Audio('/media/vk.mp3');
        audio.play();


        // Clear oldest data
        if (document.querySelector(".none_notif")){
            document.querySelector(".notifications-content").removeChild(document.querySelector(".none_notif"))
            }


        if (data.count_notifications == 0){
            const none_notif = document.createElement('div');
            none_notif.className = 'none_notif';
            none_notif.innerHTML = 'Сегодня уведомлений не было замечено'
            document.querySelector('.notifications-content').appendChild(none_notif)
        }


        $('.friend_request_notification').each(function(i, obj) {
            if (String(data.user_sender === String(obj.querySelector('.sender_username').innerHTML))){
                parent = document.querySelector('#notif_content')
                parent.removeChild(obj);
            }
        });

        document.querySelector('.total_notif').innerHTML = '';
        document.querySelector('.total_notif').innerHTML = data.count_notifications;

        if (data.friend_request_id){
            // Change count notifications
            const div = document.createElement('div');
            div.className = 'friend_request_notification';
            div.setAttribute('id', 'notif_' + data.friend_request_id)

            // If last_name is not empty
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
    }

}



// Send to consumers
if (!document.URL.includes('profile') || !document.querySelector('.friend_request')){
}
else{
    receiver_username = document.querySelector('.friend_request').id
    sender_username = document.querySelector('.dropbtn').innerHTML

    let button = document.querySelector('.friend_request')
    button.addEventListener('click', (e) => {
        e.preventDefault()

        cancel = false
        if (document.querySelector('.friend_request.cancel')){
            cancel = true
        }

        remove_friend = false
        if (document.querySelector('.friend_request.remove_friend')){
            remove_friend = true
        }

        add = false
        if (!document.querySelector('.friend_request.remove_friend') && !document.querySelector('.friend_request.cancel') && document.querySelector('.friend_request')){
            add = true
        }

        chatSocket.send(JSON.stringify({
            'type': 'data_to_get',
            'receiver_username': receiver_username,
            'sender_username': sender_username,
            'cancel': cancel,
            'remove_friend': remove_friend,
            'add': add,
        }))

        // Change button after the sender clicks
        if (!document.querySelector('.friend_request.cancel') && !document.querySelector('.friend_request.remove_friend') && document.querySelector('.friend_request')){
            document.querySelector('.friend_request').classList.add('cancel')
            document.querySelector('.friend_request').innerHTML = 'Отменить запрос'
        }
        else if (document.querySelector('.friend_request.remove_friend')){
            document.querySelector('.friend_request').className = 'friend_request'
            document.querySelector('.friend_request').innerHTML = 'Отправить запрос'
        }
        else if (cancel){
            document.querySelector('.friend_request').className = 'friend_request'
            document.querySelector('.friend_request').innerHTML = 'Отправить запрос'
        }

        })
        }
// \Friend request





// Accept friend request
let url_friend_request_accept = `ws://${window.location.host}/ws/accept_friend_request/`
const friend_req_acceptSocket = new WebSocket(url_friend_request_accept)

// Print data from consumers
friend_req_acceptSocket.onmessage = function(e){
    let data = JSON.parse(e.data).data.value
    // Show data for sender
    var current_username = document.querySelector('.dropbtn').innerHTML
    // Send to sender
    if (data.user_sender == current_username){
        var audio = new Audio('/media/vk.mp3');
        audio.play();

        if (String(JSON.parse(e.data).data.type) === 'send_confirm_accept'){
            show_accept_fr_req(data);
        }
        else if (String(JSON.parse(e.data).data.type) === 'send_confirm_cancel'){
            show_cancel_fr_req(data);
        }

        change_comrade_btn(data);

        // Change button after the recipient clicks
        if (document.querySelector('.friend_request')){
            if (data.action == 'add'){
                document.querySelector('.friend_request').className = 'friend_request remove_friend'
                document.querySelector('.friend_request').innerHTML = 'Убрать'
            }
            else if (data.action == 'cancel'){
                document.querySelector('.friend_request').className = 'friend_request'
                document.querySelector('.friend_request').innerHTML = 'Отправить запрос'
            }
            else if (document.querySelector('friend_request.remove_friend')){
                document.querySelector('.friend_request').className = 'friend_request'
                document.querySelector('.friend_request').innerHTML = 'Отправить запрос'
            }
        }
    }
}


// Change button in comrades
function change_comrade_btn(data){
    if (document.URL.includes('comrades')){
        action_type = {
            'cancel': ['Добавить', 'friend_request add_friend'],
            'add': ['Убрать', 'friend_request delete_friend'],
        }

        $('.friend_request').each(function(i, obj) {
            if (String(obj.id) === String(data.user_receiver)){
                obj.innerHTML = action_type[data.action][0]
                obj.className = action_type[data.action][1]

                obj.parentNode.style.left = '-20px'
            }
        });

    }
}


function show_accept_fr_req(data){
    // Animation exit block (popup notification)
    const div = document.createElement('div');
    div.className = 'popup_notif';

    const count_el = document.createElement('div');
    count_el.className = 't';
    count_el.style.display = 'none'
    document.querySelector('body').appendChild(count_el);


    // Queue popup notif
    if (document.querySelector('.popup_notif')){
        var count_elements = $('.t').length
        setTimeout(() => {

            if (data.first_name){
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.first_name} ${data.last_name} теперь ваш товарищ!</p>
                    `
                }
            else{
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.user_receiver} теперь ваш товарищ!</p>
                `
            }

            document.querySelector('body').appendChild(div);

            div.style.right = '-500px';

            setTimeout(() => {div.style.right = '25px';}, 1000);
            setTimeout(() => {div.style.right = '-500px';}, 5000);
            setTimeout(() => {
            if (document.querySelector('.popup_notif')){
                var child = document.querySelector(".popup_notif");
                var parent = document.querySelector("body");
                parent.removeChild(child)};
                }, 6000);

             setTimeout(() => {
            if (document.querySelector(".t")){
                var t = document.querySelector(".t");
                var parent = document.querySelector("body");
                parent.removeChild(t);
                }
                            }, 7000)
        }, 6000 * count_elements);

    }
    else{
        if (data.first_name){
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.first_name} ${data.last_name} теперь ваш товарищ!</p>`
                }

        else{
            div.innerHTML = `
                <div class="cross" onclick="close_popup_notif()"></div>
                <p>${data.user_receiver} теперь ваш товарищ!</p>
            `
        }

        document.querySelector('body').appendChild(div);

        div.style.right = '-500px';

        setTimeout(() => {div.style.right = '25px';}, 1000);
        setTimeout(() => {div.style.right = '-500px';}, 5000);
        setTimeout(() => {
        if (document.querySelector('.popup_notif')){
            var child = document.querySelector(".popup_notif");
            var parent = document.querySelector("body");
            parent.removeChild(child)};
            }, 6000);

        setTimeout(() => {
        if (document.querySelector(".t")){
            var t = document.querySelector(".t");
            var parent = document.querySelector("body");
            parent.removeChild(t);
            }
                        }, 7000)
    }
}



function show_cancel_fr_req(data){
    // Animation exit block (popup notification)
    const div = document.createElement('div');
    div.className = 'popup_notif';

    const count_el = document.createElement('div');
    count_el.className = 't';
    count_el.style.display = 'none'
    document.querySelector('body').appendChild(count_el);


    // Queue popup notif
    if (document.querySelector('.popup_notif')){
        var count_elements = $('.t').length
        setTimeout(() => {

            if (data.first_name){
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.first_name} ${data.last_name} отказался от товарищества!</p>
                    `
                }
            else{
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.user_receiver} отказался от товарищества!</p>
                `
            }

            document.querySelector('body').appendChild(div);

            div.style.right = '-500px';

            setTimeout(() => {div.style.right = '25px';}, 1000);
            setTimeout(() => {div.style.right = '-500px';}, 5000);
            setTimeout(() => {
            if (document.querySelector('.popup_notif')){
                var child = document.querySelector(".popup_notif");
                var parent = document.querySelector("body");
                parent.removeChild(child)};
                }, 6000);

             setTimeout(() => {
            if (document.querySelector(".t")){
                var t = document.querySelector(".t");
                var parent = document.querySelector("body");
                parent.removeChild(t);
                }
                            }, 7000)
        }, 6000 * count_elements);

    }
    else{
        if (data.first_name){
                div.innerHTML = `
                    <div class="cross" onclick="close_popup_notif()"></div>
                    <p>${data.first_name} ${data.last_name} отказался от товарищества!</p>`
                }

        else{
            div.innerHTML = `
                <div class="cross" onclick="close_popup_notif()"></div>
                <p>${data.user_receiver} отказался от товарищества!</p>
            `
        }

        document.querySelector('body').appendChild(div);

        div.style.right = '-500px';

        setTimeout(() => {div.style.right = '25px';}, 1000);
        setTimeout(() => {div.style.right = '-500px';}, 5000);
        setTimeout(() => {
        if (document.querySelector('.popup_notif')){
            var child = document.querySelector(".popup_notif");
            var parent = document.querySelector("body");
            parent.removeChild(child)};
            }, 6000);

        setTimeout(() => {
        if (document.querySelector(".t")){
            var t = document.querySelector(".t");
            var parent = document.querySelector("body");
            parent.removeChild(t);
            }
                        }, 7000)
    }
}




// Send to consumers (It is sender)
$(document).on("click", ".friend_request_btn", function(el){
      if ($(el.target)[0].id.includes('cancel')){
            cancel_friend_request(el);
        }
      else if ($(el.target)[0].id.includes('accept')){
            accept_friend_request(el);
      }

      // Remove notif from window, when click 'add' or 'cancel'
      var notif = document.querySelector("#notif_" + String($(el.target)[0].id).split('_')[1]);
      var parent = document.querySelector(".notifications-content");
      parent.removeChild(notif);

      // Add title 'none notifications' if it is true
      if (!document.querySelector('.friend_request_notification')){
            const none_notif = document.createElement('div');
            none_notif.className = 'none_notif';
            none_notif.innerHTML = 'Сегодня уведомлений не было замечено'
            document.querySelector('.notifications-content').appendChild(none_notif)
      }

      // Update title count total notifications
      var total_notifications = document.querySelector('.total_notif').innerHTML
      document.querySelector('.total_notif').innerHTML = total_notifications-1

});


// Send to consumers (It is sender)
function cancel_friend_request(el){
    var receiver_username = document.querySelector('.dropbtn').innerHTML
    var friend_request_id = String($(el.target)[0].id).split('_')[1]
    var sender_username = document.querySelector('#notif_' + friend_request_id).querySelector('.sender_username').innerHTML


    friend_req_acceptSocket.send(JSON.stringify({
            'type': 'data_to_get',
            'action': 'cancel',
            'sender_username': sender_username,
            'friend_request_id': friend_request_id,
            'receiver_username': receiver_username,
        }))
}


// Send to consumers (It is sender)
function accept_friend_request(el){
    var receiver_username = document.querySelector('.dropbtn').innerHTML
    var friend_request_id = String($(el.target)[0].id).split('_')[1]
    var sender_username = document.querySelector('#notif_' + friend_request_id).querySelector('.sender_username').innerHTML

    friend_req_acceptSocket.send(JSON.stringify({
            'type': 'data_to_get',
            'action': 'add',
            'sender_username': sender_username,
            'friend_request_id': friend_request_id,
            'receiver_username': receiver_username,
        }))

}
// \Accept friend request



// Close popup notifications
function close_popup_notif(){
    var child = document.querySelector(".popup_notif");
    var parent = document.querySelector("body");
    parent.removeChild(child);

    var t = document.querySelector(".t");
    parent.removeChild(t);
}


