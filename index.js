define([], function () {
  return {
    onSave: function () {
      console.log("external on save");
    },
    settings: async (self) => {
      console.log($("input[name = idgroup]").val());

      let mm_settings = {
        piplines: [],
        groups: [],
      };

      let allPiplinesCheckBox = $(".pipelines .control-checkbox__body .js-item-checkbox");
      let allGroupsCheckBox = $(".groups .control-checkbox__body .js-item-checkbox");


      // console.log(JSON.parse($("input[name = idgroup]").val()).piplines[value]);
      for (const value in JSON.parse($("input[name = idgroup]").val()).piplines) {
        for (const id in allPiplinesCheckBox) {
          if (JSON.parse($("input[name = idgroup]").val()).piplines[value] === allPiplinesCheckBox[id]) {
            console.log("нашли:" + allPiplinesCheckBox[id]);
          }
        }
      }




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
        mm_settings.piplines = [];
        pipelinesArr.push(
          $(
            ".pipelines .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox"
          )
        );
        pipelinesArr = pipelinesArr[0];

        for (const key in pipelinesArr) {
          if (pipelinesArr[key].value != undefined) {
            mm_settings.piplines.push(pipelinesArr[key].value);
          }
        }

        console.log(mm_settings);
        $("input[name = idgroup]").val(JSON.stringify(mm_settings));
      });

      $(".groups").change(function () {
        groupsArr = [];
        mm_settings.groups = [];
        groupsArr.push(
          $(
            ".groups .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox"
          )
        );

        groupsArr = groupsArr[0];

        for (const key in groupsArr) {
          if (groupsArr[key].value != undefined) {
            mm_settings.groups.push(groupsArr[key].value);
          }
        }
        $("input[name = idgroup]").val(JSON.stringify(mm_settings));
      });

      $(".mm_mainSettings").trigger("change");
    },
  };
});
