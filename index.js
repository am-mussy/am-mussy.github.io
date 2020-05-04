define([], function () {
  return {
    onSave: function () {
      console.log("external on save");
    },
    settings: async (self) => {
      let mm_settings = {
        pipelines: [],
        groups: [],
      };

      let pipelinesArr = [];
      let groupsArr = [];

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

      //ВОРОНКИ
      for (const key in pipelines) {
        pipelines[key].option = pipelines[key].name;
      }

      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          class_name: "pipelines",
          items: pipelines,
          value: pipelines,
          title_empty: "Выбрате воронку", // Название списка
          text: pipelines,
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

      //Записываем список ГРУПП в Groups
      const Groups = await getGroups(linkGroups);

      //ГРУППЫ
      for (const key in Groups) {
        Groups[key].option = Groups[key].name;
      }
      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          class_name: "groups",
          name: Groups,
          items: Groups,
          value: Groups,
          title_empty: "Выбрате группу пользователей",
          text: Groups,
        }
      );
      $(".mm_userSettings").append("<br>" + data + "<br>");

      $(".pipelines").change(function () {
        pipelinesArr = [];
        pipelinesArr.push(
          $(
            ".pipelines .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox"
          )
        );
        pipelinesArr = pipelinesArr[0];

        for (const key in pipelinesArr) {
          if (pipelinesArr[key].value != undefined) {
            mm_settings.pipelines.push(pipelinesArr[key].value);
            console.log(pipelinesArr[key].value);
          }
        }

        //console.log(pipelinesArr);
      });

      $(".groups").change(function () {
        groupsArr = [];
        groupsArr.push(
          $(
            ".groups .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox"
          )
        );

        groupsArr = groupsArr[0];

        for (const key in groupsArr) {
          if (pipelinesArr[key].value != undefined) {
            mm_settings.groups.push(pipelinesArr[key].value);
            console.log(groupsArr[key].value);
          }
        }

        //console.log(groupsArr);
      });

      $(".mm_mainSettings").trigger("change");
    },
  };
});
