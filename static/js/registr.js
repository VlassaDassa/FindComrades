// Кнопка "Регистрация"
$(function() {$("form").on('change input paste', 'input', function(e) {
    $("#submit").prop('disabled', !$("#id_username").val() || !$("#id_password1").val() || !$("#id_password2").val());
  });
});


// Глазок, скрывающий пароль
$(document).ready(function(){
    $('body').on('click', '.password-control', function(){
        if ($('#id_password1').attr('type') == 'password'){
            $(this).addClass('view');
            $('#id_password1').attr('type', 'text');
        } else {
            $(this).removeClass('view');
            $('#id_password1').attr('type', 'password');
        }
        return false;
    });
});


// Ajax forms
function appointmentForm() {
    const formId = '#myForm'
    var id_username = '#id_username'
    var id_password1 = '#id_password1'
    var id_password2 = '#id_password2'
    var elements_id = [id_username, id_password1, id_password2];


    $(document).on('submit', '#myForm', function(e){
        e.preventDefault()

        $.ajax({
            url: '/registration',
            type: 'POST',
            dataType: 'json',
            data: {
                username: $(id_username).val(),
                password1: $(id_password1).val(),
                password2: $(id_password2).val(),
            },

            success: (data) => {
                // Убираюк класс ошибки у полей, которые стали верными
               for (let key in elements_id) {
                    $(formId).find('input[name="' + elements_id[key].slice(4) + '"]').removeClass('is-invalid')
                    }

                $(formId).find('input[name="' + 'password1' + '"]').removeClass('is-valid')
               if ('errors' in data) {
                    $(formId + 'input' + formId + ' textarea').each((index, el) => {
                        $(el).removeClass('is-invalid').addClass('is-valid')

                    })

                    $(formId + ' .invalid-feedback').each((index, el) => {
                        $(el).remove()
                    })

                    for (let key in data['errors']) {
                        document.getElementById('id_' + key).value = ''
                        document.getElementById('submit').disabled = true
                        $(formId).find('input[name="' + key + '"]').removeClass('is-valid').addClass('is-invalid')

                        if (key == 'username'){
                            var pass_control = document.querySelector('.password-control');
                            pass_control.setAttribute('id', 'error_username');
                        }
                        else{
                            var pass_control = document.querySelector('.password-control');
                            pass_control.removeAttribute('id', 'error_username');
                        }


                        $(formId).find('input[name="' + key + '"]').after(() => {
                            let result = ''
                            for (let k in data['errors'][key]) {
                                result += data['errors'][key][k] + '<br>'
                            }
                            return '<div class="invalid-feedback">' + result + '</div>'
                        })

                    }
               }
               if ('success' in data){
                    $(formId + ' .invalid-feedback').each((index, el) => {
                        $(el).remove()
                    })

                    for (let key in elements_id) {
                        $(formId).find('input[name="' + elements_id[key].slice(4) + '"]').removeClass('is-invalid').addClass('is-valid')
                        }

                    window.location.href = '/main';

               }
            },
        })
    })
}

appointmentForm();










