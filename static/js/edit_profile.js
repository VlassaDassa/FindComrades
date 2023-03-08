// Загрузка изображения при нажатии на кнопку
function pro1(){
            document.getElementById("form-file").click();
        }


// Вывод списка городов из БД
$(function () {
            $("#id_city").autocomplete({
            source: '/edit_profile',
            minLength: 2
        });
    });


// disabled button
function disabled_button() {
    var first_name = document.getElementById('id_first_name')
    var last_name = document.getElementById('id_last_name')
    var bio = document.getElementById('id_bio')
    var city = document.getElementById('id_city')
    var age = document.getElementById('id_age')
    var skills = document.getElementById('id_skills')


	 if ((first_name.value === '' && last_name.value === '') && (bio.value === '' && city.value === '') && (age.value === '' && skills.value === '')) {
            document.getElementById('submit').disabled = true;

            }
     if ((first_name.value != '' && last_name.value != '') && (bio.value != '' && city.value != '') && (age.value != '' && skills.value != '')) {
        document.getElementById('submit').disabled = false;
    }
}


// Ajax forms
function appointmentForm() {
    const formId = '#image-form'
    var first_name_id = '#id_first_name'
    var last_name_id = '#id_last_name'
    var id_bio = '#id_bio'
    var id_city = '#id_city'
    var id_age = '#id_age'
    var id_skills = '#id_skills'
    var id_avatar = '#id_avatar'
    var elements_id = [first_name_id, last_name_id, id_bio, id_city, id_age, id_skills, id_avatar];


    $(document).on('submit', '#image-form', function(e){
        e.preventDefault()

        $.ajax({
            url: '/edit_profile',
            type: 'POST',
            dataType: 'json',
            data: {
                first_name: $(first_name_id).val(),
                last_name: $(last_name_id).val(),
                bio: $(id_bio).val(),
                city: $(id_city).val(),
                age: $(id_age).val(),
                skills: $(id_skills).val(),
                avatar: $(id_avatar).val(),
            },

            success: (data) => {
                for (let key in elements_id) {
                        $(formId).find('input[name="' + elements_id[key].slice(4) + '"]').removeClass('is-invalid')
                    }

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
                        $(formId).find('textarea[name="' + key + '"]').removeClass('is-valid').addClass('is-invalid')
                        $(formId).find('input[name="' + key + '"]').removeClass('is-valid').addClass('is-invalid')


                        $(formId).find('input[name="' + key + '"]').after(() => {
                            let result = ''
                            for (let k in data['errors'][key]) {
                                result += data['errors'][key][k] + '<br>'
                            }
                            return '<div class="invalid-feedback">' + result + '</div>'
                        })

                        $(formId).find('textarea[name="' + key + '"]').after(() => {
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
                        $(formId).find('textarea[name="' + elements_id[key].slice(4) + '"]').removeClass('is-invalid').addClass('is-valid')
                        $(formId).find('input[name="' + elements_id[key].slice(4) + '"]').removeClass('is-invalid').addClass('is-valid')
                        }

                    window.location.href = '/profile/'+data['success'];

               }
            },
        })
    })
}

appointmentForm();


// redirect if user is active
var count=4;
var counter=setInterval(is_active, 1000);

function is_active() {
    const user_active = JSON.parse(document.getElementById('user_active').textContent);
    if (!user_active){
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


// Crop
const imagebox = document.getElementById('image-box')
const crop_btn = document.getElementById('crop-btn')
const input = document.getElementById('form-file')

input.addEventListener('change', ()=>{
  const img_data = input.files[0]
  const url = URL.createObjectURL(img_data)

  imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%;">`

  const image = document.getElementById('image')

  document.getElementById('image-box').style.display = 'block'
  document.getElementById('image-box').style.width = '500px'
  document.getElementById('crop-btn').style.display = 'block'

  const cropper = new Cropper(image, {
  autoCropArea: 1,
  viewMode: 1,
  scalable: false,
  zoomable: false,
  movable: false,
  minCropBoxWidth: 100,
  minCropBoxHeight: 100,
  })

  crop_btn.addEventListener('click', ()=>{
    cropper.getCroppedCanvas().toBlob((blob)=>{

      let fileInputElement = document.getElementById('form-file');
      let file = new File([blob], img_data.name,{type:"image/*", lastModified:new Date().getTime()});
      let container = new DataTransfer();
      container.items.add(file);
      fileInputElement.files = container.files;

      document.getElementById('image-box').style.display = 'none'
      document.getElementById('crop-btn').style.display = 'none'

      const url_2 = URL.createObjectURL(file)
      const link_image = document.getElementById('link_image')

      link_image.innerHTML = `<img src="${url_2}" id='image_file' onclick='pro1()'>`
      });
    });
});


// test
//var newInput = document.getElementById('id_first_name');
//
//newInput.oninput = function () {
//  if (newInput.value.indexOf(',') > -1){
//        console.log('Запятая');
//    }
//  };