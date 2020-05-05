define([], function () {

  return {
    onSave: function () {
      console.log("external on save");

    },
    settings: async (self) => {
      const subdomain = "amotestredbox"; //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию

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
      //ыВОРОНКИ
      for (const key in pipelines) {
        pipelines_arr.push({
          option: pipelines[key].name,
          name: pipelines[key].name,
          checked: false,
          id: pipelines[key].id,
          prefix: 'pipelinechkbx' + pipelines[key].id
        })
      }

      console.log({ pipelines_arr })
      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          items: pipelines_arr
        }
      );


      $(".mm_piplineSettings").append("<br>" + data + "<br>");

      //GET на получение списка ГРУПП
      const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;
      async function getGroups(linkGroups) {
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.groups;

        return Groups;
      }

      let allPiplinesCheckBox = $('[ID *= "cbx_drop_pipelinechkbx"]');

      $(".mm_mainSettings").change(function () {

        hecked_pipelines = [];

        $('[ID *= "cbx_drop_pipelinechkbx"]').each(function (index) {

          if ($(this).parent().parent().hasClass('is-checked')) {
            hecked_pipelines.push($(this).attr('value'));
          }

        })

        console.log(hecked_pipelines);
        //$("input[name = idgroup]").val(JSON.stringify(mm_settings));
      });


      $(".mm_mainSettings").trigger("change");
    },
  };
});
