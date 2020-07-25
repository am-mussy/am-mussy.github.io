define([], function () {
  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через новую аутентификацию

  return {
    onSave: async function (self) {
      console.log(self.get_settings());

      let trialData = {
        widgetId: "task",
        subdomain: AMOCRM.constant("account").subdomain,
        phone: $(".mail").val(),
        username: AMOCRM.constant("user").name,
        email: $(".userphone").val(),
        action: "trialStart",
      };

      try {
        const bdRespons = await fetch(
          "https://widgets-flax.vercel.app/api/status",
          {
            method: "POST",
            body: JSON.stringify(trialData),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await bdRespons.json();
        console.log(data);
      } catch (error) {
        console.log(error);
      }

      console.log("external on save");
    },

    settings: async (self) => {
      console.log("settings");
      const subdomain = AMOCRM.constant("account").subdomain;
      const initData = {
        subdomain: subdomain,
        widgetId: "task",
        username: self.get_settings().idgroup
          ? self.get_settings().idgroup.email
          : AMOCRM.constant("user").login,
        phone: self.get_settings().idgroup
          ? self.get_settings().idgroup.phone
          : AMOCRM.constant("user").personal_mobile,
        action: "status",
      };

      let mm_settings = {
        phone: AMOCRM.constant("user").personal_mobile,
        username: AMOCRM.constant("user").name,
        email: AMOCRM.constant("user").login,
        checked_groups: [],
      };

      let old_settings;
      try {
        old_settings = JSON.parse(self.get_settings().idgroup);
      } catch (error) {
        old_settings = self.get_settings().idgroup;
      }
      console.log({ old_settings });
      //
      //Получаем список групп
      const getGroups = async () => {
        console.log("groups");
        const linkGroups = `/api/v2/account?with=groups`;
        let response = await fetch(linkGroups);
        let groups = await response.json();
        console.log(groups);
        groups = groups._embedded.groups;
        return groups;
      };

      try {
        const bdRespons = await fetch(
          "https://widgets-flax.vercel.app/api/status",
          {
            method: "POST",
            body: JSON.stringify(initData),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await bdRespons.json();
        console.log("fetch status:", data);
        //Отображение настроек, описания и т.д в зависимоти от статуса
        if (data.status === "new") {
          console.log("status: new");
          $(".widget_settings_block__fields .button-input-inner__text").html(
            "Начать пробный период"
          );

          //Вставка видео
          $(".widget_settings_block__descr").append(`
            <div>
              <iframe width="593" height="333" src="https://www.youtube.com/embed/Oap2be7bR0c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `);

          //Вставка селектора групп
          const groups = await getGroups();
          console.log({ groups });
          const groups_arr = [];
          for (let i of Object.keys(groups)) {
            console.log({ i });
            groups_arr.push({
              option: groups[i].name,
              name: groups[i].name,
              is_checked: () => {
                return (
                  old_settings &&
                  old_settings.checked_groups.includes(String(groups[i].id))
                );
              },
              id: groups[i].id,
              prefix: `groupschkbx${groups[i].id}`,
            });
          }
          console.log({ groups_arr });
          //Список групп
          const selectGroups = self.render(
            { ref: "/tmpl/controls/checkboxes_dropdown.twig" },
            {
              items: groups_arr,
            }
          );
          console.log({ selectGroups });

          $(".widget_settings_block__descr").append(
            `
            <p>Выбередите отделы, для которых будет работать виджет. </p>
            <br> ${selectGroups} <br>`
          );

          //Обновление данных при изменении настроек
          $(".mm_mainSettings").change(function () {
            mm_settings.checked_groups = [];
            $('[ID *= "cbx_drop_groupschkbx"]').each(function (index) {
              if ($(this).parent().parent().hasClass("is-checked")) {
                mm_settings.checked_groups.push($(this).attr("value"));
              }
            });
            $("input[name = idgroup]").val(JSON.stringify(mm_settings));
            console.log($("input[name = idgroup]").val());
          });

          $(".widget_settings_block__descr").append(`
            <div class="mm_header">
              <br>
                <p> ● Проверьте правильно ли введен ваше имя и номер телефона</p>
                <p> ● Выберите группу пользователей для которой будет работать данный виджет</p>
                <p> ● Нажмите "Начать пробный период"</p>
              <br>
            </div>
          `);

          $(".mm_header").after(
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
          );
        } else if (data.status === "trial") {
          console.log("status: trile");
          $(".widget_settings_block__descr").append(`
            <div class="mm_header">
            <br>
            <p> На данный момент, в тестовом режиме! </p>
            <p> Что бы приобрести виджет нажминте на кнопку "Купить" </p>
            <br>
            </div>
          `);
          $(".mm_header").after(
            `
              <div class="mm_mainSettings">
                <div class="userdata">
                <br>
                <p>Данные пользователя:</p>
                </div>
                <hr>
                <div class="mm_piplineSettings">
                <p> test </p>
                </div>
                <div class="mm_userSettings">
                </div>
              </div>
            `
          );

          const button = self.render(
            { ref: "/tmpl/controls/button.twig" },
            {
              class_name: "button_buy",
              text: "Купить",
            }
          );
          $(".userdata").append("<br>" + button + "<br>");
        } else if (data.status === "paid") {
          console.log("status: paid");
          $(".mm_header").after(
            `
              <div class="mm_mainSettings">
                <p>Форма обратной связи</p>
              </div>
            `
          );
        }
      } catch (error) {
        console.log("widget.settings error", error);
      }
      console.log({ self: self.get_settings() });

      // const usermail = self.render(
      //   { ref: "/tmpl/controls/input.twig" },
      //   {
      //     placeholder: "Ваш email:",
      //     value: AMOCRM.constant("user").name,
      //     class_name: "mail",
      //   }
      // );

      // $(".userdata").append("<br>" + usermail + "<br>");

      // const userphone = self.render(
      //   { ref: "/tmpl/controls/input.twig" },
      //   {
      //     placeholder: "Номер телефона:",
      //     value: AMOCRM.constant("user").personal_mobile,
      //     class_name: "userphone",
      //   }
      // );
      // $(".userdata").append("<br>" + userphone + "<br>");
    },
  };
});
