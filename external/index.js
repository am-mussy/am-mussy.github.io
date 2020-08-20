define([], function () {
  //Потом нужно будет либо выводить это в настройки, либо автоматом поцеплять через_новую аутентификацию

  const getLeadsCount = async (responsible_user_id) => {
    console.log("getLeadsCount");
    const piplines_req = "/api/v4/leads/pipelines";

    let pipelines_res = await fetch(piplines_req);
    let piplinesList = await pipelines_res.json();

    const statuses = piplinesList._embedded.pipelines.reduce(
      (acc, pipeline) => {
        return [
          ...acc,
          ...pipeline._embedded.statuses
            .filter((status) => ![142, 143].includes(status.id))
            .map((status) => {
              return {
                pipeline_id: pipeline.id,
                status_id: status.id,
              };
            }),
        ];
      },
      []
    );

    // console.log({ statuses });
    // const getURL = await fetch("https://widgets-flax.vercel.app/api/getquery", {
    //   method: "POST",
    //   body: JSON.stringify({ filter: { statuses } }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    // const s = await getURL.json();
    // console.log({ s });

    let getLeadsUrl =
      "/api/v4/leads?" + $.param({ filter: { statuses } }) + `&filter[tasks]=1`;

    if (responsible_user_id)
      getLeadsUrl += `&filter[responsible_user_id]=${responsible_user_id}`;
    console.log({ getLeadsUrl });
    const getLeadsResult = await fetch(getLeadsUrl);
    const leads = await getLeadsResult.json();
    console.log({ leads });
  };

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
        const daysLeft = Math.ceil(
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
            <div style="border-top: 1px solid rgb(211, 214, 215); margin: 20px -30px 20px;"></div>
            <div class="mm_header"> 
              <div style="margin-bottom: 10px">
                ${
          daysLeft > 0
            ? "<p> Окончание пробного периода через " +
            daysLeft +
            " дн. </p>"
            : "<p> Пробный период окончен </p>"
          }
                <p> Что бы приобрести виджет, нажмите на кнопку "Купить" </p>
              </div>
              <div class='imputBuy'>
                ${usermailInput}
                ${userphoneInput}
                ${buyButton}
              </div>
            </div>
          `);




        let buttonBuy = document.getElementsByClassName('button_buy')

        async function buyResponsF() {

          const buyData = {
            subdomain: subdomain,
            widgetId: "task",
            username: self.get_settings().idgroup
              ? self.get_settings().idgroup.email
              : AMOCRM.constant("user").login,
            phone: self.get_settings().idgroup
              ? self.get_settings().idgroup.phone
              : AMOCRM.constant("user").personal_mobile,
            action: "buy",
          };

          const buyRespons = await fetch(
            "https://widgets-flax.vercel.app/api/status",
            {
              method: "POST",
              body: JSON.stringify(buyData),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          $(".imputBuy").css({ "display": "none" });

          $(".imputBuy").append('<p>Ваша заявка получена, с вами свяжется наш менеджер</p>');

        }


        buttonBuy[0].addEventListener("click", buyResponsF)

      } else if (serverResponse.status === "paid") {
        console.log("status: paid");
        $(".widget_settings_block").append(
          ` <div style="border-top: 1px solid rgb(211, 214, 215); margin: 20px -30px 20px;"></div>
            <p>В случае возниковновения проблем пишите нам: support@widgetfactory.digital</p>
          `
        );
      }

      $(".widget_settings_block").append(
        ` <div style="border-top: 1px solid rgb(211, 214, 215); margin: 20px -30px 20px;"></div>
          <p>Продукт компании <a href="https://widgetfactory.digital" target="_blank"> WidgetFactory </a> </p>
          <p style="margin-bottom: -33px">В случае возниковновения проблем пишите нам: support@widgetfactory.digital</p>
        `
      );

      console.log({ self: self.get_settings() });




    },

    render: async (self, Modal) => {
      console.log("rend");
      getLeadsCount(6217741);
      //функцию рендера повешенная на листемера, если мы находимся в сделке и в ней нет задачи и модальное окно не открыто
      const mRender = () => {
        if (
          !(
            AMOCRM.data.current_entity === "leads" &&
            AMOCRM.data.is_card &&
            !self.modalIsOpen &&
            !$(".card-task-wrapper").length
          )
        )
          return;

        let mm_button = self.render(
          { ref: "/tmpl/controls/button.twig" },
          {
            class_name: "mm_button",
            text: "Хорошо!",
            id: "mm_button",
          }
        );

        const mm_modalData =
          `${
          AMOCRM.constant("user").name
          }, в этой сделки нет задачи. Поставь её! \n` + mm_button;

        self.modalIsOpen = true;

        //console.log('Модальное окно открыто');
        modal = new Modal({
          class_name: "modal-window",
          init: function ($modal_body) {
            var $this = $(this);
            $modal_body
              .trigger("modal:loaded") // запускает отображение модального окна
              .html(mm_modalData)
              .trigger("modal:centrify") // настраивает модальное окно
              .append("");
            $("#mm_button").css({ width: "100%", "margin-top": "50px" });
            $(".modal-body").css({ "text-align": "center" });
            $(".modal-body").css({
              "text-align": "center",
              border: "1.5px solid rgb(243, 117, 117)",
              "font-size": "18px",
            });
          },
          destroy: function () {
            self.modalIsOpen = false;
            //console.log('Модальное окно закрыто');
          },
        });

        document.getElementById("mm_button").addEventListener("click", () => {
          modal.destroy();
        });
      };

      const removeListeners = () => {
        document.body.removeEventListener("mouseleave", mRender);
        document
          .getElementById("common--arrow-left")
          .removeEventListener("mouseover", mRender);
        document
          .getElementById("nav_menu")
          .removeEventListener("mouseover", mRender);
        document
          .getElementById(AMOCRM.constant("user").id)
          .removeEventListener("mouseover", mRender);
      };
      const subdomain = AMOCRM.constant("account").subdomain; //субдомен амо
      removeListeners();
      clearInterval(self.systemInterval);
      clearInterval(self.leadInterval);

      dataDB = {
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

      const responseDB = await fetch(
        "https://widgets-flax.vercel.app/api/status",
        {
          method: "POST",
          body: JSON.stringify(dataDB),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const widgetServerSettings = await responseDB.json();

      if (widgetServerSettings.status === "new") return true;

      const work =
        widgetServerSettings.paid ||
        Math.ceil(
          14 - (Date.now() - widgetServerSettings.trialStart) / 86400000
        ) > 0;

      //если виджет не оплчен или закончился триал
      if (!work) {
        let message_params = {
          header: "Виджет:",
          text: "Обязательные сделки",
          date: new Date(),
          icon: "https://image.flaticon.com/icons/svg/165/165031.svg",
        };
        AMOCRM.notifications.show_message(message_params);

        setTimeout(() => {
          var message_params = {
            header: "Оплатите виджет:",
            text: "Напишите нам redbox@gmail.com",
            date: new Date(),
            icon: "https://image.flaticon.com/icons/svg/165/165031.svg",
          };
          AMOCRM.notifications.show_message(message_params);
        }, 3000);
        return true;
      }

      //Глобальный интервал, проверяет сделки без задачи в системе
      self.systemInterval = setInterval(async () => {
        if (AMOCRM.data.is_card && AMOCRM.data.current_entity === "leads")
          return;

        try {
          const getNoTaskUrl = `https://${subdomain}.amocrm.ru/api/v4/leads?filter[tasks]=1&filter[responsible_user_id]=${
            AMOCRM.constant("user").id
            }`; //Сделки без задач
          const response = await fetch(getNoTaskUrl);
          let mm_noTask = await response.json();
          console.log({ mm_noTask });
          mm_noTask = mm_noTask._embedded.items;

          document.location.href = `https://${subdomain}.amocrm.ru/leads/detail/${
            Object.keys(mm_noTask)[0].id
            }`;
        } catch (error) {
          //Может вернуть пустоту
        }
      }, 5000);

      //Если нет настроек групп - выходим
      if (
        !(
          self.get_settings().idgroup &&
          self.get_settings().idgroup.checked_groups &&
          self.get_settings().idgroup.checked_groups.length
        )
      )
        return;

      //Проверяем группу текущего пользователя (настройки)
      const getUsersUrl = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`; //Список пользователей
      const response = await fetch(getUsersUrl);
      const mm_users = await response.json();
      const amo_users = mm_users._embedded.users;

      let isUser;
      for (let i of Object.keys(amo_users)) {
        if (amo_users[i].id === AMOCRM.constant("user").id) {
          for (let j of Object.keys(
            self.get_settings().idgroup.checked_groups
          )) {
            if (
              String(amo_users[i].group_id) ===
              self.get_settings().idgroup.checked_groups[j]
            ) {
              isUser = true;
            }
          }
        }
      }

      if (!isUser) return;

      if (!(AMOCRM.data.is_card && AMOCRM.data.current_entity === "leads"))
        return;

      self.leadInterval = setInterval(() => {
        //Если в сделке нет задачи
        if (!$(".card-task-wrapper").length) {
          $(".js-switcher-task").trigger("click"); //эмулируем нажатие кнопки, для отображения интерфейса поставноки задачи
          $(".feed-compose_task-future").css({
            border: "2px solid rgb(243, 117, 117)",
          }); //Краная рамка вокруг окна задач

          if (self.listenersAdded) return;

          document.body.addEventListener("mouseleave", mRender); //Уход курсора за body
          document
            .getElementById("common--arrow-left")
            .addEventListener("mouseover", mRender); //Навели курсор на кнопку назад в сделке
          document
            .getElementById("nav_menu")
            .addEventListener("mouseover", mRender); //Навели курсор на боковое меню
          document
            .getElementById(AMOCRM.constant("user").id)
            .addEventListener("mouseover", mRender); //Навели курсор на фото профиля

          self.listenersAdded = true;
        } else {
          //Возвращаем UI обратно
          $(".feed-compose").css({ border: "0px" });
          removeListeners();
        }
      }, 3000);
    },
  };
});
