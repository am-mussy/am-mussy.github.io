define([], function () {
  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через_новую аутентификацию

  return {
    onSave: async function (self) {
      console.log("on save self settings", self.get_settings());

      let trialData = {
        widgetId: "task",
        subdomain: AMOCRM.constant("account").subdomain,
        phone: AMOCRM.constant("user").personal_mobile || "",
        username: AMOCRM.constant("user").name,
        email: AMOCRM.constant("user").login,
        action: "trialStart",
      };

      console.log(trialData);

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

        const trialStartRespons = await bdRespons.json();
        console.log({ trialStartRespons });
      } catch (error) {
        console.log("trialStartRespons:", error);
      }

      console.log("external on save");
    },

    settings: async (self) => {
      console.log("settings");
      const subdomain = AMOCRM.constant("account").subdomain;
      console.log({ setting: self.get_settings() });
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
      //s
      console.log({ initData });

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
        console.log({ groups });
        groups = groups._embedded.groups;
        return groups;
      };

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
      const serverResponse = await bdRespons.json();
      console.log("fetch status:", serverResponse);
      if (serverResponse.status === "new") {
        $(".widget_settings_block__fields .button-input-inner__text").html(
          "Начать пробный период"
        );
      }

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
          class_name: "mm_select",
        }
      );
      console.log({ selectGroups });

      $(".widget_settings_block__descr").append(
        `
          <p style="font-weight:bold; margin-bottom: 5px; margin-top: 10px;">Выберите отделы, для которых будет работать виджет. </p>
          ${selectGroups}`
      );

      //Обновление данных при изменении настроек
      $(".mm_select").change(function () {
        console.log("selector changed");
        mm_settings.checked_groups = [];
        $('[ID *= "cbx_drop_groupschkbx"]').each(function (index) {
          if ($(this).parent().parent().hasClass("is-checked")) {
            mm_settings.checked_groups.push($(this).attr("value"));
          }
        });
        $("input[name = idgroup]").val(JSON.stringify(mm_settings));
        console.log($("input[name = idgroup]").val());
      });

      if (serverResponse.status === "new") {
        console.log("status: new");
      } else if (serverResponse.status === "trial") {
        console.log("status: trile");
        const daysLeft = Math.round(
          14 - (Date.now() - serverResponse.trialStart) / 86400000
        );

        const usermailInput = self.render(
          { ref: "/tmpl/controls/input.twig" },
          {
            placeholder: "Ваш email:",
            value: AMOCRM.constant("user").name,
            class_name: "mail",
          }
        );
        const buyButton = self.render(
          { ref: "/tmpl/controls/button.twig" },
          {
            class_name: "button_buy",
            text: "Купить",
          }
        );
        const userphoneInput = self.render(
          { ref: "/tmpl/controls/input.twig" },
          {
            placeholder: "Номер телефона:",
            value: AMOCRM.constant("user").personal_mobile,
            class_name: "userphone",
          }
        );
        $(".widget_settings_block").append(`
            <div style="border-top: 1px solid rgb(211, 214, 215); margin: 20px -30px 0px;"></div>
            <div class="mm_header"> 
              <div style="margin-bottom: 10px">
                <p> Окончание пробного периода через ${daysLeft} дн. </p>
                <p> Что бы приобрести виджет, нажмите на кнопку "Купить" </p>
              </div>
              <div>
                ${usermailInput}
                ${userphoneInput}
                ${buyButton}
              </div>
            </div>
          `);
      } else if (serverResponse.status === "paid") {
        console.log("status: paid");
        $(".mm_header").after(
          `
            <p>В случае возниковновения проблем пишите нам: support@widgetfactory.digitel</p>
          `
        );
      }

      console.log({ self: self.get_settings() });
    },
  };
});
