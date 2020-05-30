define([], function () {

    return {
        render: async (self, Modal) => {







            console.log('OK');

            const subdomain = "redboxamo1"; //субдомен амо

            let mm_bool_setting = false; //Если True - пользоватьль подходит под настройки
            let mm_bool_noTask = false; //Если True - задачи в сделке нет
            let mm_modal_isOpen = false; //Открыто ли модальное окно

            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`; //Список пользователей 
            const linkNoTask = `https://${subdomain}.amocrm.ru/api/v2/leads?filter[tasks]=1`; //Сделки без задач


            //Получаем список пользователей
            async function getUsers(linkUsers) {
                let response = await fetch(linkUsers);
                let mm_users = await response.json();
                mm_users = mm_users._embedded.users;
                return mm_users;
            }

            const mm_users = await getUsers(linkUsers);

            // Проверяет есть ли найстройки и входят ли текущий пользователь в группу на которую распространяются настройки виджета
            if (typeof self.get_settings().idgroup != 'undefined') {
                for (let i of Object.keys(mm_users)) {
                    if (mm_users[i].id === AMOCRM.constant('user').id) {
                        if (typeof self.get_settings().idgroup.checked_groups != 'undefined' && self.get_settings().idgroup.checked_groups.length > 0) {

                            for (let j of Object.keys(self.get_settings().idgroup.checked_groups)) {

                                if (String(mm_users[i].group_id) === self.get_settings().idgroup.checked_groups[j]) {
                                    mm_bool_setting = true; //Если все условия собледены mm_bool_setting = true -- означает, что логика работает
                                    console.log('Настройки есть и данный пользователь в списке активированных');
                                }
                            }
                        }

                    }
                }
            } else {
                //Такое сообщение можно увидеть только единожды при загрузки виджета в систему впервые
                console.log("Настройки не заданы");
            }





            //Отслеживаем действия пользователя в сделке 
            function mm_userEventInLeads(data) {

                document.body.addEventListener("mouseleave", () => { mRender(data) }); //Уход курсора за body
                document.getElementById("common--arrow-left").addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на кнопку назад в сделке
                document.getElementById("nav_menu").addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на боковое меню
                document.getElementById(AMOCRM.constant('user').id).addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на фото профиля
            }

            //Менять визуал сделки (используется, если нет задачи)
            function mm_noTaskLeadsUI(mm_bool_noTask) {
                if (mm_bool_noTask) {
                    $('.js-switcher-task').trigger('click'); //эмулируем нажатие кнопки, для отображения интерфейса поставноки задачи
                    $('.feed-compose_task-future').css({ "border": "2px solid rgb(243, 117, 117)" }); //Краная рамка вокруг окна задач
                } else {
                    $('.feed-compose').css({ "border": "0px" });
                }
            }

            function BoolTask(CheckTime, data) {
                //CheckTime - интервал проверки
                //data - данные для модалки
                if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card) {
                    setInterval(() => {
                        if ($(".card-task-wrapper").length === 0) {
                            mm_bool_noTask = true;
                            console.log('Задачи нет');

                            mm_noTaskLeadsUI(mm_bool_noTask);
                            mm_userEventInLeads(data);

                        } else {
                            mm_bool_noTask = false;
                            mm_noTaskLeadsUI(mm_bool_noTask);
                            console.log('Задача есть');
                        }
                    }, CheckTime);

                }

            }

            //Показывает уведомление о сделке без задачи
            function mm_notCall(mm_link) {
                var error_params = {
                    header: "Внимание:",
                    text: "Найдена сделка без задачи",
                    date: 1534085310,
                    link: mm_link
                };
                AMOCRM.notifications.add_error(error_params);
            }


            //Вызвает функцию рендера, если мы находимся в сделке и в ней нет задачи и модальное окно не открыто
            function mRender(data) {
                if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card && !mm_modal_isOpen && mm_bool_noTask) {
                    ModalRender(data);
                }
            }


            function ModalRender(data) {
                mm_modal_isOpen = true;
                console.log('Модальное окно открыто');
                modal = new Modal({
                    class_name: 'modal-window',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded') // запускает отображение модального окна
                            .html(data)
                            .trigger('modal:centrify')  // настраивает модальное окно
                            .append('');
                    },
                    destroy: function () {
                        mm_modal_isOpen = false;
                        console.log('Модальное окно закрыто');
                    }
                });
            }

            //Получаем список сделок без задач
            async function getNoTasks(linkNoTask) {
                try {
                    let response = await fetch(linkNoTask);
                    let mm_noTask = await response.json();
                    mm_noTask = mm_noTask._embedded.items;
                    return mm_noTask;
                } catch (error) {
                    console.log("Сделок без задач не найдено");
                }

            }

            //Редирект на сделку без задачи
            function RedirectToLeadNoTask(link) {

                if (AMOCRM.data.current_entity != "leads" && !AMOCRM.data.is_card && typeof link != 'undefined') {
                    document.location.href = link[0];
                }
            }

            // Ссылки на сделки без задач
            function LeadNoTaskLinks(mm_noTask) {
                let mm_linksNoTask = [];
                for (let i of Object.keys(mm_noTask)) {

                    mm_linksNoTask.push(`https://${subdomain}.amocrm.ru/leads/detail/${mm_noTask[i].id}`);
                }

                return mm_linksNoTask;
            }


            async function main(mm_bool_setting) {
                if (mm_bool_setting) {


                    //Кнопка для модалки
                    var mm_button = self.render(
                        { ref: "/tmpl/controls/button.twig" },
                        {
                            class_name: "mm_button",
                            text: "Поставлю задачу, только не бей",
                        }
                    );

                    setInterval(async () => {


                        let mm_noTask = await getNoTasks(linkNoTask);

                        // LeadNoTaskLinks(mm_noTask);
                        RedirectToLeadNoTask(mm_noTask);

                        console.log(await getNoTasks(linkNoTask));
                    }, 3000);


                    BoolTask(1000, mm_button + `<h1> Hello world </h1>`);
                } else {

                }
            }


            main(mm_bool_setting);
        }
    }
});
