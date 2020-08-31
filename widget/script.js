define([
  "jquery",
  "underscore",
  "twigjs",
  "lib/components/base/modal",
], function ($, _, Twig, Modal) {
  var CustomWidget = function () {
    var self = this;
    self.getLeadsCount = async function () {
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

      let params;
      let responsible_user_id = AMOCRM.constant("user").id;
      if (!responsible_user_id) {
        params = $.param({ filter: { statuses, tasks: 1 } });
      } else {
        params = $.param({ filter: { statuses, tasks: 1, responsible_user_id } });
      }

      let getLeadsUrl = "/api/v4/leads?" + params;

      console.log({ getLeadsUrl });
      const getLeadsResult = await fetch(getLeadsUrl);
      try {
        const leads = await getLeadsResult.json();
        console.log({ leads });
        console.log(leads._embedded.leads);
        return leads._embedded.leads;
      } catch (error) {
        console.log(error);
        return [];
      }
    }
    this.callbacks = {

      render: async function () {

        console.log("render");
        //функцию рендера повешенная на листемера, если мы находимся в сделке и в ней нет задачи и модальное окно не открыто
        //Подсвечивает окно постановки задачи(примечание), при попытке увести курсор за пределы области сделки - показывает окно предупреждеине
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
                border: "1px solid rgb(243, 117, 117)",
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

          //Если нет настроек групп - выходим
          if (
            !(
              self.get_settings().idgroup &&
              self.get_settings().idgroup.checked_groups &&
              self.get_settings().idgroup.checked_groups.length
            )
          )
            return;

          console.log('должны были выйти уже')
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

        //Проверяем группу текущего пользователя (настройки)
        const getUsersUrl = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`; //Список пользователей
        const response = await fetch(getUsersUrl);
        const mm_users = await response.json();
        const amo_users = mm_users._embedded.users;

        let isUser = false;
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
                console.log('Пользователь состоит в нужной группе')
              } else {
                isUser = false;
                console.log('Пользователь не состоит в нужной группе')
              }
            }
          }
        }

        if (!isUser) return;
        //Глобальный интервал, проверяет сделки без задачи в системе
        self.systemInterval = setInterval(async () => {
          if (AMOCRM.data.is_card && AMOCRM.data.current_entity === "leads")
            return;

          try {
            let lastLeads = await self.getLeadsCount(AMOCRM.constant("user").id);
            console.log({ lastLeads });

            if (!lastLeads.length) return;

            if (AMOCRM.data.current_entity === "leads-pipeline")
              document.location.href = `https://${subdomain}.amocrm.ru/leads/detail/${lastLeads[0].id}`;
          } catch (error) {
            //Может вернуть пустоту
          }
        }, 5000);





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

        //extw.render(self, Modal);
        return true;
      },
      init: _.bind(function () {
        console.log("init");
        return true;
      }, this),
      bind_actions: function () {
        console.log("bind_actions");
        return true;
      },
      settings: async function () {
        console.log("on settings");
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

        let noTaskCount = (await self.getLeadsCount()).length;
        console.log({ noTaskCount });
        $(".widget_settings_block__descr").append(
          `<p>Сделок без задач: ${noTaskCount > 499 ? "500+" : noTaskCount}</p>`
        );
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

          let buttonBuy = document.getElementsByClassName("button_buy");

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

            $(".mail").css({ display: "none" });
            $(".userphone").css({ display: "none" });
            $(".button_buy").css({ display: "none" });

            $(".imputBuy").append(
              "<h3>Ваша заявка получена, с вами свяжется наш менеджер</h3>"
            );
          }

          buttonBuy[0].addEventListener("click", buyResponsF);
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

        //extw.settings(self);
        return true;
      },
      onSave: async function () {
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
        //extw.onSave(self);
        return true;
      },
      destroy: function () { },
    };
    return this;
  };

  return CustomWidget;
});
