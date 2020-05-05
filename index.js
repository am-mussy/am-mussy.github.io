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
      //ВОРОНКИ
      for (const key in pipelines) {
        pipelines_arr.push({
          option: pipelines[key].name,
          name: pipelines[key].name,
          checked: true,
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

      /*  //Записываем список ГРУПП в Groups
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
       $(".mm_userSettings").append("<br>" + data + "<br>"); */

      let mm_settings = {
        piplines: [],
        groups: [],
      };

      let pipelinesArr = [];
      let groupsArr = [];





      // for (let i in JSON.parse($("input[name = idgroup]").val()).groups) {
      //   for (let id in allGroupsCheckBox) {
      //     if (JSON.parse($("input[name = idgroup]").val()).groups[i] === allGroupsCheckBox[id].value) {
      //       allGroupsCheckBox[id].checked = true;
      //     }
      //   }
      // }

      // for (let i in JSON.parse($("input[name = idgroup]").val()).piplines) {
      //   for (let id in allPiplinesCheckBox) {
      //     if (JSON.parse($("input[name = idgroup]").val()).piplines[i] === allPiplinesCheckBox[id].value) {
      //       allPiplinesCheckBox[id].checked = true;
      //     }
      //   }
      // }

      $(".mm_mainSettings").change(function () {

        mm_settings.piplines = [];
        mm_settings.groups = [];
        pipelinesArr = [];
        groupsArr = [];

        pipelinesArr.push(
          $(".pipelines .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox")
        );

        pipelinesArr = pipelinesArr[0];

        for (const key in pipelinesArr) {
          if (pipelinesArr[key].value != undefined) {
            mm_settings.piplines.push(pipelinesArr[key].value);
          }
        }

        groupsArr.push(
          $(".groups .is-checked:not(.js-master-checkbox-wrapper) .control-checkbox__body .js-item-checkbox")
        );

        groupsArr = groupsArr[0];

        for (let key in groupsArr) {
          if (groupsArr[key].value != undefined) {
            mm_settings.groups.push(groupsArr[key].value);
          }
        }



        console.log($("input[name = idgroup]").val());
        console.log(JSON.parse($("input[name = idgroup]").val()));
        $("input[name = idgroup]").val(JSON.stringify(mm_settings));
      });


      $(".mm_mainSettings").trigger("change");
    },
  };
});