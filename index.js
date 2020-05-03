define([], function () {
  return {
    onSave: function () {
      console.log("external on save");
      let x = document.getElementsByClassName("is-checked");
      console.log(x);
    },
    settings: async (self) => {
      $(".widget_settings_block__descr").after(
        `
          <div class="widget_settings_block__item_field" id="users">
          <br>
          
          <p>ID Группы пользователей:</p>
          <input name="group" id="group" class="inputGroupID" type="number" placeholder="id group" />

          <div class="mm_mainSettings">
            <div class="mm_piplineSettings">
              
            </div>
            <div class="mm_userSettings">
               
            </div>
          </div>
        `
      );
      const subdomain = "amotestredbox"; //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию
      const linkPiplines = `https://${subdomain}.amocrm.ru/api/v2/pipelines`;
      // Отправляем GET на получение списка воронок
      async function getSalesF(linkPiplines) {
        let response = await fetch(linkPiplines);
        let salesFunnels = await response.json();
        salesFunnels = salesFunnels._embedded.items;
        return salesFunnels;
      }
      //Записываем список воронок в piplines
      const pipelines = await getSalesF(linkPiplines);
      //Формируем чек-боксы из воронок
      for (const key in pipelines) {
        pipelines[key].option = pipelines[key].name;
      }

      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          name: pipelines,
          items: pipelines,
          value: pipelines,
          title_empty: "Выбрате воронку",
          text: pipelines,
        }
      );

      $(".mm_piplineSettings").append("<br>" + data + "<br>");

      // Отправляем GET на получение списка групп
      const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;
      async function getGroups(linkGroups) {
        let response = await fetch(linkGroups);
        let Groups = await response.json();
        Groups = Groups._embedded.groups;

        return Groups;
      }

      const Groups = await getGroups(linkGroups);

      //Формируем чек-боксы из групп
      for (const key in Groups) {
        Groups[key].option = Groups[key].name;
      }
      var data = self.render(
        { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
        {
          name: Groups,
          items: Groups,
          value: Groups,
          title_empty: "Выбрате группу пользователей",
          text: Groups,
        }
      );
      $(".mm_userSettings").append("<br>" + data + "<br>");
      console.log(Groups);
      console.log(pipelines);

      $(".inputGroupID").val($("input[name = idgroup]").val());

      let inputGroupID;
      $(".inputGroupID").change(function () {
        inputGroupID = $(".inputGroupID").val();
        inputGroupID = Number.parseInt(inputGroupID);
        console.log("tix");
        console.log($(".is-checked"));

        $("input[name = idgroup]").val(inputGroupID);
      });

      //$(".inputGroupID").val($("input[name = idgroup]").val());
      $('input[name="group"]').trigger("change");
    },
  };
});
