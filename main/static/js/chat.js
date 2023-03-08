const username = JSON.parse(document.getElementById('json-username').textContent);
const message_username = JSON.parse(document.getElementById('json-message-username').textContent);
const socket = new WebSocket(`ws://${window.location.host}/ws/${username}/`);


socket.onmessage = function(e){
    const data = JSON.parse(e.data);

    if (data.type){

        if (message_username == data.sender){
            document.getElementById(data.message_id).className = 'message my_message'

            if (data.count_unread_msg == 0){
                document.getElementById(data.receiver).className = 'dialog'
            }
        }

        else{
            if (document.getElementById(data.sender) && document.getElementById(data.sender).querySelector('.count_unread_msg_alien')){
                if (data.count_unread_msg == 0){
                    parent = document.getElementById(data.sender)
                    parent.className = 'dialog'
                    parent.removeChild(document.querySelector('.count_unread_msg_alien'))
                }
                try {
                  document.getElementById(data.sender).querySelector('.count_unread_msg_alien').innerHTML = data.count_unread_msg
                }
                catch (err) {
                }
            }
        }

    }
    else{
        // Добавление нового диалога в левую область
        if (data.exist_status === 'new'){
            if (document.URL.indexOf(data.sender_username) >= 0){
                var username = data.sender_username
                var fullname = data.sender_fullname
                var message = data.message
            }
            else{
                var username = data.receiver_username
                var fullname = data.receiver_fullname
                var message = 'Я: ' + data.message
            }


             parent = document.querySelector('.started_dialogues')
             const div = document.createElement('div');
             div.className = 'dialog';
             div.setAttribute('id', username)

             if (message.length >= 17){
                msg = message.slice(0, 17) + '...'
             }
             else{
                msg = message
             }

             div.innerHTML = `<a href="chat/${username}"><img src="/media/default.jpg"></a>
                              <a href="chat/${username}" class="link_started_dialogues"><p class="fullname">${fullname}</p></a>
                              <p class="last_message">${msg}</p>
                              `

             if (document.querySelector('.none_started_dialogues')){
                parent.removeChild(document.querySelector('.none_started_dialogues'))
             }

             parent.appendChild(div);
        }
        else{
            if (document.URL.indexOf(data.sender_username) >= 0){
                var username = data.sender_username
                var fullname = data.sender_fullname
                var message = data.message
            }
            else{
                var username = data.receiver_username
                var fullname = data.receiver_fullname
                var message = 'Я: ' + data.message
            }

            if (message.length >= 17){
                msg = message.slice(0, 17) + '...'
             }
             else{
                msg = message
             }

            document.querySelector('.dialog').querySelector('.last_message').innerHTML = msg
        }


        // Убирает лишнюю надпись
        if (document.querySelector('.none-messages')){
            document.querySelector('.messages').innerHTML = ''
        }

        // Отображение сообщения
        if (data['sender_username'] === message_username){
            document.querySelector('.messages').innerHTML += `<div id="${data.message_id}" class="message my_message unread_my">
                                                                <p class="text_message">${data.message}</p>
                                                            </div>`
            document.querySelector('.messages').scrollTo(0, document.querySelector('.messages').scrollHeight);

            // Перекрашивание диалога
            document.getElementById(data['receiver_username']).className += ' unread_dialog_my'
            }
        else{
            var audio = new Audio('/media/vk.mp3');
            audio.play();

            document.querySelector('.messages').innerHTML += `<div id="${data.message_id}" class="alien_message unread_alien">
                                                                <p class="fullname_alien_message"><a href="/profile/${data.sender_username}">${data.sender_first_name}</a></p>
                                                                <div class="message alien_message_">
                                                                    <p class="text_message">${data.message}</p>
                                                                    </div>
                                                                </div>`

            // Перекрашивание диалога
            document.getElementById(data['sender_username']).className += ' unread_dialog_alien'

            // Добавление количества сообщений
            if (document.getElementById(data['sender_username']).querySelector('.count_unread_msg_alien')){
                document.getElementById(data['sender_username']).querySelector('.count_unread_msg_alien').innerHTML = data.count_unread_msg
            }
            else{
                parent = document.getElementById(data['sender_username'])
                const div = document.createElement('div');
                div.className = 'count_unread_msg_alien';
                div.innerHTML = data.count_unread_msg
                parent.appendChild(div)
            }


        }
    }
}


// Отправка сообщения по клику на картинку
document.querySelector('.send_message_btn').onclick = function(e){
    const message_input = document.querySelector('.textareaElement');
    const message = message_input.value;

    if (!(message.length === 0)){
        socket.send(JSON.stringify({
        'message':message,
        'username':message_username,
        }));

        message_input.value = '';
    }
}


// Отправка сообщения по клику на Enter
document.querySelector('.textareaElement').onkeyup = function(e){
    const message_input = document.querySelector('.textareaElement');
    const message = message_input.value;

    if(e.keyCode == 13){
      if (!(message.length === 0)){
         socket.send(JSON.stringify({
         'message':message,
         'username':message_username,
         }));
     }
     $('.textareaElement').val('')
     }
};


// Скролл в самый конец переписки
document.querySelector('.messages').scrollTo(0, document.querySelector('.messages').scrollHeight);



// Прочтение сообщений
$(document).ready(function() {
  var gridTop = 0,
    gridBottom = $('.messages').outerHeight();

  $('.messages').on('scroll', function() {
    $('.alien_message').each(function() {
      var thisTop = $(this).offset().top - 163;

      if (thisTop >= gridTop && (thisTop + $(this).height()) <= gridBottom) {
        if (this.className.includes('unread_alien')){
            socket.send(JSON.stringify({
                'message_id':this.id,
                'sender': $(this).find('a').attr('href').split('/')[2], // хозяин сообщения
                'receiver': message_username, // прочитавший пользователь
                'type': 'read_unread',
            }));

            // Отправка с типом
            $(this).removeClass('unread_alien')
        }

        }
    });
  });
});


// Цвет для чужих непрочитанных диалогов
if (document.querySelector('.count_unread_msg_alien')){
    $('.count_unread_msg_alien').each(function(i, obj) {
        obj.closest('.dialog').className += ' unread_dialog_alien'
    });
}


// Цвет для своих непрочитанных диалогов
if (document.querySelector('.count_unread_msg_my')){
    $('.count_unread_msg_my').each(function(i, obj) {
        obj.closest('.dialog').className += ' unread_dialog_my'
    });
}

