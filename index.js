define([], function () {
  return {
    onSave: function () {
      console.log("external on save");
    },
    settings: async (self) => {
      let subdomain = "amotestredbox"; //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию
      let linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`;
      let salesFunnels;
      async function getSalesF(linkPiplines) {
        let response = await fetch(linkPiplines);
        let salesFunnels = await response.json();
        salesFunnels = salesFunnels._embedded.items;
        return salesFunnels;
      }

      const pipelines = await getSalesF(linkPiplines);
      console.log(pipelines);
      let arr = [];

      for (const key in pipelines) {
        console.log(pipelines[key]);
        var data = self.render(
          { ref: "/tmpl/controls/checkbox.twig" },
          {
            note_text: pipelines[key].id,
            text: pipelines[key].name,
            value: "value",
            text_class_name: "text_class_name",
            input_class_name: "mm_chk_" + pipelines[key].id,
            id: "mm_chk_" + pipelines[key].id,
            checked: false,
            small: true,
          }
        );
        arr.push(pipelines[key].name);
        $(".widget_settings_block__descr").append("<br>" + data + "<br>");
      }
      console.log(arr);
      let linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;

      async function getGroups(linkGroups) {
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.roups;
        return Groups;
      }

      const Groups = await getGroups(linkGroups);

      for (const key in Groups) {
        console.log(Groups[key]);
        var data = self.render(
          { ref: "/tmpl/controls/checkbox.twig" },
          {
            note_text: Groups[key].id,
            text: Groups[key].name,
            value: "value",
            text_class_name: "text_class_name",
            input_class_name: "mm_chk_" + Groups[key].id,
            id: "mm_chk_" + Groups[key].id,
            checked: false,
            small: true,
          }
        );
        $(".widget_settings_block__descr").append("<br>" + data + "<br>");
      }

      var data = self.render(
        { ref: "/tmpl/controls/multiselect.twig" },
        {
          values: arr,
          name: "mis2sasslti",
        }
      );
      $(".widget_settings_block__descr").append("<br>" + data + "<br>");

      $(".widget_settings_block__descr").after(
        `
          <div class="widget_settings_block__item_field" id="users">
          <br>
          
          <p>ID Группы пользователей:</p>
          <input name="group" id="group" class="inputGroupID" type="number" placeholder="id group" />

          <div class="mm_mainSettings">
            <div class="mm_piplineSettings">
              test pip
            </div>
            <div class="mm_userSettings">
               test user
            </div>
          </div>
        `
      );
      //$(".widget_settings_block__descr").after(data);
      $(".inputGroupID").val($("input[name = idgroup]").val());

      let inputGroupID;
      $(".inputGroupID").change(function () {
        console.log("change");
        inputGroupID = $(".inputGroupID").val();
        inputGroupID = Number.parseInt(inputGroupID);
        $("input[name = idgroup]").val(inputGroupID);
      });

      //$(".inputGroupID").val($("input[name = idgroup]").val());
      $('input[name="group"]').trigger("change");
    },
  };
});
