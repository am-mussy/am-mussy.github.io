{/* <p> НАЗВАНИЕ ВИДЖЕТА -- это один из виджетов, который заставляет работать ваших менеджеров в заданном русле. </p>

<p> Если в сделке нет задачи, - про это сделку менеджер забудет, забытая сделка - потерянный клиент и потеряные деньги. </p>

<p> Мы вам предлагаем больше никогда не терять клиентов из-за невнимательности менеджеров и быть уверенными в том что о каждом вашем клиенте помнят. </p> */}


define([], function () {
  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию

  const subdomain = location.host.split('.')[0]
  let old_settings;


  //Настройки
  let mm_settings = {
    checked_pipelines: [],
    checked_groups: [],
    email: '',
    phone: '',
  }




  async function toDataBase(dataDB) {
    try {
      const responseDB = await fetch('https://widgets-flax.vercel.app/api/status', {
        method: 'POST',
        body: JSON.stringify(dataDB),
        headers: {
          'Content-Type': 'application/json'
        },
      })

      const responseDBJSON = await responseDB.json()

      //console.log('Успех', JSON.stringify(responseDBJSON.trialStart))

      return Math.round(14 - (Date.now() - responseDBJSON.trialStart) / 86400000)
    } catch (error) {
      //console.log('Error', error)
    }
  }

  async function toDataBasePaid(dataDB) {
    try {
      const responseDB = await fetch('https://widgets-flax.vercel.app/api/status', {
        method: 'POST',
        body: JSON.stringify(dataDB),
        headers: {
          'Content-Type': 'application/json'
        },
      })

      const responseDBJSON = await responseDB.json()

      //console.log('Успех', JSON.stringify(responseDBJSON.trialStart))

      return responseDBJSON.paid
    } catch (error) {
      //console.log('Error', error)
    }
  }



  return {
    onSave: async function () {
      //console.log("external on save")
      await toDataBase(dataDB)
      location.reload()
    },


    settings: async (self) => {

      if ($("input[name = idgroup]").val().length > 0) {
        old_settings = JSON.parse($("input[name = idgroup]").val());
      }

      console.log({old_settings})

      dataDB = {
        subdomain: subdomain,
        name: 'task',
        username: old_settings.email,
        phone: old_settings.phone
      }




      //console.log(dataDB)

      // Разметка настроек

      $(".widget_settings_block__descr").after(
        `
          <div class="mm_mainSettings">
            <div class="userdata">
            <br>
            <p>Данные пользователя:</p>
            </div>
            <div class="mm_piplineSettings">
              <br>
              <br>
              <h3>Как настроить:</h3>
              <br>
              <p>1. Выберите пользователей, на которых будет распространятся данный виджет</p>
              <p>2. Нажмите сохранить</p>
              <br>
            </div>
            <div class="mm_userSettings">

            </div>
          </div>
        `
      );

      if (!await toDataBasePaid(dataDB)) {
        $(".userdata").append(`<h2>Дней до конца тестового периода: ${await toDataBase(dataDB)} </h2>`)
        // $(".mm_piplineSettings").append(`<h2>Дней до конца тестового периода: ${Math.round(14 - (Date.now() - x.trialStart) / 86400000)} </h2>`)
      }




      const linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`;



      // Number(JSON.stringify(await toDataBase(dataDB).trialStart)



      // Получаем список воронок, записываем их в массив, что бы потом сформировать список в настройках
      async function getSalesF(linkPiplines) {
        let response = await fetch(linkPiplines);
        let salesFunnels = await response.json();
        salesFunnels = salesFunnels._embedded.items;
        return salesFunnels;
      }

      //Записываем список ВОРОНОК в piplines
      const pipelines = await getSalesF(linkPiplines);

      const pipelines_arr = [];

      for (let i of Object.keys(pipelines)) { //дублирование кода?
        pipelines_arr.push({
          option: pipelines[i].name,
          name: pipelines[i].name,
          is_checked: () => {
            try {
              return old_settings.checked_pipelines.includes(String(pipelines[i].id));
            } catch (error) {
              return false;
            }
          },
          id: pipelines[i].id,
          prefix: `pipelinechkbx${pipelines[i].id}`
        })
      }

      // var data = self.render(
      //   { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
      //   {
      //     items: pipelines_arr
      //   }
      // );
      // $(".mm_piplineSettings").append("<br>" + data + "<br>");

      var data = self.render(
        { ref: "/tmpl/controls/input.twig" },
        {
          placeholder: "Ваш email:",
          class_name: "mail"
        }
      );
      $(".userdata").append("<br>" + data + "<br>");

      var data = self.render(
        { ref: "/tmpl/controls/input.twig" },
        {
          placeholder: "Номер телефона:",
          class_name: "userphone"
        }
      );
      $(".userdata").append("<br>" + data + "<br>");

      //соглашение
      var data = self.render(
        { ref: "/tmpl/controls/checkbox.twig" },
        {
          text: "Я согласен с лицензионным соглашением и передачей данных аккаунта amoCRM (адрес электронной почты, API-ключ, URL аккаунта)",
          checked: true
        }
      );
      $(".userdata").append("<br>" + data + "<br>");


      //Получаем группы и записываем их в массив, что бы потом сформировать список в настройках
      const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;

      async function getGroups(linkGroups) {
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.groups;
        return Groups;
      }

      const groups = await getGroups(linkGroups);
      const groups_arr = [];

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





      //console.log(self.get_settings());


      $(".userphone").val(old_settings.phone)
      $(".mail").val(old_settings.email)

      $(".mm_mainSettings").change(function () {

        mm_settings.checked_groups = []
        mm_settings.checked_pipelines = []





        mm_settings.phone = $(".userphone").val()
        mm_settings.email = $(".mail").val()


        $('[ID *= "cbx_drop_pipelinechkbx"]').each(function (index) {

          if ($(this).parent().parent().hasClass('is-checked')) {
            mm_settings.checked_pipelines.push($(this).attr('value'));
          }
        })

        $('[ID *= "cbx_drop_groupschkbx"]').each(function (index) {

          if ($(this).parent().parent().hasClass('is-checked')) {
            mm_settings.checked_groups.push($(this).attr('value'));
          }
        })

        old_settings = mm_settings;

        $("input[name = idgroup]").val(JSON.stringify(old_settings));
        // $("input[name = idgroup]").val(old_settings);
      });


      $(".mm_mainSettings").trigger("change");

    }
  };
});
