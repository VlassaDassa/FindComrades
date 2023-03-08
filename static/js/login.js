// Кнопка "Войти"
$(function() {$("form").on('change input paste', 'input', function(e) {
    $("#submit").prop('disabled', !$("#id_username").val() || !$("#id_password").val());
  });
});


// Глазок, скрывающий пароль
$(document).ready(function(){
    $('body').on('click', '.password-control', function(){
        if ($('#id_password').attr('type') == 'password'){
            $(this).addClass('view');
            $('#id_password').attr('type', 'text');
        } else {
            $(this).removeClass('view');
            $('#id_password').attr('type', 'password');
        }
        return false;
    });
});



// Ajax forms
function appointmentForm() {
    const formId = '#myForm'
    var id_username = '#id_username'
    var id_password = '#id_password'
    var elements_id = [id_username, id_password]

    $(document).on('submit', '#myForm', function(e){
        e.preventDefault()

        $.ajax({
            url: '/login',
            type: 'POST',
            dataType: 'json',
            data: {
                username: $(id_username).val(),
                password: $(id_password).val(),
            },


            success: (data) => {
                var block_errors = document.getElementById('invalid-feedback');
                $(formId).find('input[name="' + elements_id[0].slice(4) + '"]').removeClass('is-invalid')



                if (block_errors){
                    block_errors.remove();
                }


                if ('errors' in data){
                     // Красная рамка
                     $(formId).find('input[name="' + elements_id[0].slice(4) + '"]').addClass('is-invalid')


                     // Добавление блока с ошибкой
                     $(formId).before(() => {
                        return '<div id="invalid-feedback">' + data['errors'] + '</div>'
                     })

                    // Добавление класса глазку для стабилизации
                    var pass_control = document.querySelector('.password-control');
                    pass_control.setAttribute('id', 'error_eye');

                                    }
                if ('success' in data){
                    window.location.href = '/main';
                    var pass_control = document.querySelector('.password-control');
                    pass_control.removeAttribute('id', 'error_eye');

                                      }
                                             }



                })
                                            })

                            }
appointmentForm();


// redirect if user is active
var count=4;
var counter=setInterval(is_active, 1000);

function is_active() {
    const user_active = JSON.parse(document.getElementById('user_active').textContent);
    if (user_active){
        console.log(user_active);
        document.getElementById('popup1').className += " target";

        count=count-1;
        if (count <= 0)
            {
             document.getElementById("timer").innerHTML='<p>'+count+'</p>';
             clearInterval(counter);
             window.location.replace('/login');
             return;
            }

        document.getElementById("timer").innerHTML='<p>'+count+'</p>';
                    }
    else{
        clearInterval(counter);
        counter = null;
    }
}

is_active();


// rotating circle with counter
const elements = document.querySelectorAll('.with-border-gradient');

const steps = Array.from({ length: 360 }, (_, index) => ({ '--border-rotate': index }));
const options = { duration: 1000, iterations: Infinity };

elements.forEach(element => element.animate(steps, options));



