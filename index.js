{/* <p> НАЗВАНИЕ ВИДЖЕТА -- это один из виджетов, который заставляет работать ваших менеджеров в заданном русле. </p>

<p> Если в сделке нет задачи, - про это сделку менеджер забудет, забытая сделка - потерянный клиент и потеряные деньги. </p>

<p> Мы вам предлагаем больше никогда не терять клиентов из-за невнимательности менеджеров и быть уверенными в том что о каждом вашем клиенте помнят. </p> */}


define([], function () {

  //Настройки
  let mm_settings = {
    checked_pipelines: [],
    checked_groups: [],
  }

  let old_settings;

  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию
  const subdomain = "redboxamo1";




  return {
    onSave: function () {
      console.log("external on save");
      console.log(mm_settings);
      mm_settings.time = new Date().getTime();
      mm_settings.demo = 1;
      mm_settings.id = AMOCRM.constant('account').id;
      old_settings = mm_settings;
      $("input[name = idgroup]").val(old_settings);


      //post  https://redbox-back.now.sh/api/index.js'

      await fetch('https://redbox-back.now.sh/api/index.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(mm_settings)
      })




    },
    settings: async (self) => {



      if ($("input[name = idgroup]").val().length > 0) {
        old_settings = JSON.parse($("input[name = idgroup]").val());
      }



      // Разметка настроек
      $(".widget_settings_block__descr").after(
        `
          <div class="mm_mainSettings">
            <div class="mm_piplineSettings">
              <h3>Как настроить:</h3>
              <br>
              <p>1. Выберите пользователей, на которых будет распространятся данный виджет</p>
              <p>2. Нажмите на кнопку начать "Начать пробный период"</p>
              <p>3. Нажмите сохранить</p>

            </div>
            <div class="mm_userSettings">

            </div>
          </div>
        `
      );

      const linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`;







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

      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          items: pipelines_arr
        }
      );
      $(".mm_piplineSettings").append("<br>" + data + "<br>");










      //Получаем группы и записываем их в массив, что бы потом сформировать список в настройках
      const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;

      async function getGroups(linkGroups) {  //дублирование кода?
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.groups;
        return Groups;
      }

      const groups = await getGroups(linkGroups);
      const groups_arr = [];

      for (let i of Object.keys(groups)) { //дублирование кода?
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



      console.log(self.get_settings());


      $(".mm_mainSettings").change(function () {

        mm_settings.checked_groups = [];
        mm_settings.checked_pipelines = [];

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

        // $("input[name = idgroup]").val(JSON.stringify(old_settings));
        $("input[name = idgroup]").val(old_settings);
      });


      $(".mm_mainSettings").trigger("change");

    }
  };
});
