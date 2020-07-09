define([], function () {
  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию

  return {

    onSave: async function (self) {
      console.log(self.get_settings())


      let trialData = {
        widgetId: 'task',
        subdomain: AMOCRM.constant('account').subdomain,
        phone: $('.mail').val(),
        username: AMOCRM.constant('user').name,
        email: $('.userphone').val(),
        action: 'trialStart',
      }

      try {
        const bdRespons = await fetch('https://widgets-flax.vercel.app/api/status', {
          method: 'POST',
          body: JSON.stringify(trialData),
          headers: {
            'Content-Type': 'application/json'
          },
        })

        const data = await bdRespons.json()
        console.log(data)
      } catch (error) {
        console.log(error)
      }





      console.log("external on save")
    },


    settings: async (self) => {



      let mm_settings = {
        phone: AMOCRM.constant('user').personal_mobile,
        username: AMOCRM.constant('user').name,
        email: AMOCRM.constant('user').login,
        checked_groups: [],
      }

      const subdomain = AMOCRM.constant('account').subdomain
      let old_settings;

      let initData = {
        widgetId: 'task',
        subdomain: subdomain,
        phone: AMOCRM.constant('user').personal_mobile ? AMOCRM.constant('user').personal_mobile : 'null',
        username: AMOCRM.constant('user').name,
        email: AMOCRM.constant('user').login,
        action: 'init',
      }

      $(".header").after(
        ` 
          
          <div class="mm_mainSettings">
            <div class="userdata">
            <br>
            <p>Данные пользователя:</p>
            </div>
            <hr>
            <div class="mm_piplineSettings">
            </div>
            <div class="mm_userSettings">

            </div>
          </div>
        `
      )


      try {
        const bdRespons = await fetch('https://widgets-flax.vercel.app/api/status', {
          method: 'POST',
          body: JSON.stringify(initData),
          headers: {
            'Content-Type': 'application/json'
          },
        })

        const data = await bdRespons.json()
        console.log(data)

        //Отображение настроек, описания и т.д в зависимоти от статуса

        if (data.status === 'new') {
          $(".button-input-inner__text").html('Начать пробный период')
          $(".widget_settings_block__descr").after(`
            <div class="header">
            <br>
             <p> ● Проверьте правильно ли введен ваше имя и номер телефона</p>
             <p> ● Выберите группу пользователей для которой будет работать данный виджет</p>
             <p> ● Нажмите "Начать пробный период"</p>
            <br>
            </div>
          `)

        } else if (data.status === 'trial') {

          $(".widget_settings_block__descr").after(`
            <div class="header">
            <br>
            <p> На данный момент, в тестовом режиме! </p>
            <p> Что бы приобрести виджет нажминте на кнопку "Купить" </p>
            <br>
            </div>
          `)


          // var data = self.render(
          //   { ref: "/tmpl/controls/button.twig" },
          //   {
          //     class_name: "button_buy",
          //     text: "Купить"
          //   }
          // );

          // $(".userdata").append("<br>" + data + "<br>");
        }

      } catch (error) {
        console.log('Error', error)
      }

      console.log({ self: self.get_settings() })
      try {
        old_settings = JSON.parse(self.get_settings().idgroup)
      } catch (error) {
        old_settings = self.get_settings().idgroup
      }

      console.log(old_settings)

      // let x = $("input[name = idgroup]").val()

      // if ($("input[name = idgroup]").val().length > 0) {
      //   old_settings = JSON.parse($("input[name = idgroup]").val());
      // }

      // console.log({ x })
      // console.log({ old_settings })

      // dataDB = {
      //   subdomain: subdomain,
      //   name: 'task',
      //   username: old_settings ? old_settings.email : null,
      //   phone: old_settings ? old_settings.phone : null
      // }

      //console.log(dataDB)

      // Разметка настроек



      // if (!await toDataBasePaid(dataDB)) {
      //   $(".userdata").append(`<h2>Дней до конца тестового периода: ${await toDataBase(dataDB)} </h2>`)
      //   // $(".mm_piplineSettings").append(`<h2>Дней до конца тестового периода: ${Math.round(14 - (Date.now() - x.trialStart) / 86400000)} </h2>`)
      // }

      const linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`

      async function getSalesF(linkPiplines) {
        let response = await fetch(linkPiplines)
        let salesFunnels = await response.json()
        salesFunnels = salesFunnels._embedded.items
        return salesFunnels
      }

      var data = self.render(
        { ref: "/tmpl/controls/input.twig" },
        {
          placeholder: "Ваш email:",
          value: AMOCRM.constant('user').name,
          class_name: "mail"
        }
      )

      $(".userdata").append("<br>" + data + "<br>")

      var data = self.render(
        { ref: "/tmpl/controls/input.twig" },
        {
          placeholder: "Номер телефона:",
          value: AMOCRM.constant('user').personal_mobile,
          class_name: "userphone"
        }
      )

      $(".userdata").append("<br>" + data + "<br>")

      //Получаем группы и записываем их в массив, что бы потом сформировать список в настройках
      const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`

      async function getGroups(linkGroups) {
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.groups;
        return Groups;
      }

      const groups = await getGroups(linkGroups)
      const groups_arr = []

      for (let i of Object.keys(groups)) {
        groups_arr.push({
          option: groups[i].name,
          name: groups[i].name,
          is_checked: () => {
            try {
              return old_settings.checked_groups.includes(String(groups[i].id));
            } catch (error) {
              return false;
            }
          },
          id: groups[i].id,
          prefix: `groupschkbx${groups[i].id}`
        })
      }

      //Список групп
      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          items: groups_arr
        }
      );

      $(".mm_piplineSettings").append("<br>" + data + "<br>");



      //Обновление данных при изменении настроек
      $(".mm_mainSettings").change(function () {

        mm_settings.checked_groups = []

        $('[ID *= "cbx_drop_groupschkbx"]').each(function (index) {

          if ($(this).parent().parent().hasClass('is-checked')) {
            mm_settings.checked_groups.push($(this).attr('value'))
          }
        })

        $("input[name = idgroup]").val(JSON.stringify(mm_settings))

        console.log($("input[name = idgroup]").val())
      })


    }
  }
});

