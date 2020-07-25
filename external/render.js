// добавить оплаченый виджет

define([], function () {
  return {
    render: async (self, Modal) => {
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
