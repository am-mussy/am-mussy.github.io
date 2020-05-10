define([], function () {

  return {
    onSave: function () {
      console.log("external on save");

    },
    settings: async (self) => {
      let mm_settings = {
        checked_pipelines: []
      }
      const subdomain = "amotestredbox"; //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию
      let old_settings;
      old_settings = JSON.parse($("input[name = idgroup]").val());


      $(".widget_settings_block__descr").after(
        `
          <div class="mm_mainSettings">
            <div class="mm_piplineSettings">
              
            </div>
            <div class="mm_userSettings">
               
            </div>
          </div>
        `
      );

      const linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`;

      //GET на получение списка ВОРОНОК
      async function getSalesF(linkPiplines) {
        let response = await fetch(linkPiplines);
        let salesFunnels = await response.json();
        salesFunnels = salesFunnels._embedded.items;

        return salesFunnels;
      }

      //Записываем список ВОРОНОК в piplines
      const pipelines = await getSalesF(linkPiplines);

      const pipelines_arr = []
      //ВОРОНКИ
      for (let i of Object.keys(pipelines)) {
        pipelines_arr.push({
          option: pipelines[i].name,
          name: pipelines[i].name,
          is_checked: old_settings.checked_pipelines.includes(String(pipelines[i].id)),
          id: pipelines[i].id,
          prefix: `pipelinechkbx${pipelines[i].id}`
        })
      }


      // //GET на получение списка ГРУПП
      // const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;
      // async function getGroups(linkGroups) {
      //   let response = await fetch(linkGroups);
      //   let Groups = await response.json();
      //   Groups = Groups._embedded.groups;

      //   return Groups;
      // }
      // let allPiplinesCheckBox = $('[ID *= "cbx_drop_pipelinechkbx"]');



      console.log("Все воронки:", pipelines_arr)
      console.log(`Сохраненные настройки:`, old_settings);

      console.log(pipelines_arr);
      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          items: pipelines_arr
        }
      );
      $(".mm_piplineSettings").append("<br>" + data + "<br>");
      $(".mm_mainSettings").change(function () {
        mm_settings = {
          checked_pipelines: []
        }

        $('[ID *= "cbx_drop_pipelinechkbx"]').each(function (index) {

          if ($(this).parent().parent().hasClass('is-checked')) {
            mm_settings.checked_pipelines.push($(this).attr('value'));
          }

        })

        old_settings = mm_settings;

        $("input[name = idgroup]").val(JSON.stringify(old_settings));
        console.log($("input[name = idgroup]").val());

      });


      $(".mm_mainSettings").trigger("change");
    }
  };
});
