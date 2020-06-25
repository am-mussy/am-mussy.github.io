define([], function () {

    return {
        render: async (self, Modal) => {


            async function toDataBase(dataDB) {

                const responseDB = await fetch('https://widgets-flax.vercel.app/api/status', {
                    method: 'POST',
                    body: JSON.stringify(dataDB),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })

                const responseDBJSON = await responseDB.json()

                console.log('Успех', JSON.stringify(responseDBJSON.trialStart))

                return Math.round(14 - (Date.now() - responseDBJSON.trialStart) / 86400000)

            }






            console.log('OK');
            const oneDay = 90000000;
            const subdomain = location.host.split('.')[0] //субдомен амо
            console.log(subdomain)

            dataDB = {
                subdomain: subdomain,
                name: 'task',
                username: self.get_settings().idgroup.email,
                phone: self.get_settings().idgroup.phone
            }

            console.log(dataDB)

            let trial = false;
            let mm_bool_setting = false; //Если True - пользоватьль подходит под настройки
            let mm_bool_noTask = false; //Если True - задачи в сделке нет
            let mm_modal_isOpen = false; //Открыто ли модальное окно

            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`; //Список пользователей 
            const linkNoTask = `https://${subdomain}.amocrm.ru/api/v2/leads?filter[tasks]=1`; //Сделки без задач


            try {
                x = await toDataBase(dataDB)
                if (x != 0) {
                    trial = true
                }
            } catch (error) {
                var message_params = {
                    header: "Ошибка REDBOX:",
                    text: "Помощь: redbox@gmail.com",
                    date: 1534084500,
                    icon: "https://image.flaticon.com/icons/svg/165/165031.svg"
                };
                AMOCRM.notifications.show_message(message_params);
            }


            if (trial) {
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
                function mm_userEventInLeads(mm_modalData) {

                    document.body.addEventListener("mouseleave", () => { mRender(mm_modalData) }); //Уход курсора за body
                    document.getElementById("common--arrow-left").addEventListener("mouseover", () => { mRender(mm_modalData) }); //Навели курсор на кнопку назад в сделке
                    document.getElementById("nav_menu").addEventListener("mouseover", () => { mRender(mm_modalData) }); //Навели курсор на боковое меню
                    document.getElementById(AMOCRM.constant('user').id).addEventListener("mouseover", () => { mRender(mm_modalData) }); //Навели курсор на фото профиля
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


                function forTimer() {


                }

                // function BoolTask(CheckTime, mm_modalData) {
                //     //CheckTime - интервал проверки
                //     //data - данные для модалки
                //     if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card) {
                //         var timer = setInterval(forTimer, CheckTime);

                //     }

                // }


                //Показывает уведомление о сделке без задачи
                function mm_notCall(mm_link) {
                    if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card) {
                        var error_params = {
                            header: "Внимание:",
                            text: "Найдена сделка без задачи",
                            date: 1534085310,
                            link: mm_link
                        };
                        AMOCRM.notifications.add_error(error_params);
                    }

                }


                //Вызвает функцию рендера, если мы находимся в сделке и в ней нет задачи и модальное окно не открыто
                function mRender(mm_modalData) {
                    if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card && !mm_modal_isOpen && mm_bool_noTask) {
                        ModalRender(mm_modalData);
                        document.getElementById("mm_button").addEventListener('click', () => {
                            modal.destroy();
                        })
                    }
                }


                function ModalRender(mm_modalData) {
                    mm_modal_isOpen = true;
                    console.log('Модальное окно открыто');
                    modal = new Modal({
                        class_name: 'modal-window',
                        init: function ($modal_body) {
                            var $this = $(this);
                            $modal_body
                                .trigger('modal:loaded') // запускает отображение модального окна
                                .html(mm_modalData)
                                .trigger('modal:centrify')  // настраивает модальное окно
                                .append('');
                            $('#mm_button').css({ 'width': '100%', 'margin-top': '50px' });
                            $('.modal-body').css({ 'text-align': 'center' });
                            $('.modal-body').css({ 'text-align': 'center', 'border': '1.5px solid rgb(243, 117, 117)', 'font-size': '18px' });
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
                        return 404;
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
                    if (mm_noTask != 404) {
                        let mm_linksNoTask = [];
                        for (let i of Object.keys(mm_noTask)) {

                            mm_linksNoTask.push(`https://${subdomain}.amocrm.ru/leads/detail/${mm_noTask[i].id}`);
                        }

                        return mm_linksNoTask;
                    }

                }

                //Кнопка для модалки
                var mm_button = self.render(
                    { ref: "/tmpl/controls/button.twig" },
                    {
                        class_name: "mm_button",
                        text: "Хорошо!",
                        id: "mm_button"
                    }
                );

                const mm_modalData = `${AMOCRM.constant('user').name}, в этой сделки нет задачи. Поставь её! \n` + mm_button;

                async function main(mm_bool_setting, CheckTime) {
                    if (mm_bool_setting) {

                        //BoolTask(3000, mm_modalData);
                        setInterval(async () => {

                            if (AMOCRM.data.current_entity === "leads" && AMOCRM.data.is_card) {
                                //let timer = setInterval(forTimer, CheckTime);
                                if (AMOCRM.data.is_card && $(".card-task-wrapper").length === 0) {

                                    setTimeout(() => {
                                        mm_bool_noTask = true;
                                        console.log('Задачи нет');
                                        mm_noTaskLeadsUI(mm_bool_noTask);
                                        mm_userEventInLeads(mm_modalData);
                                    }, 500);


                                } else {
                                    mm_bool_noTask = false;
                                    mm_noTaskLeadsUI(mm_bool_noTask);
                                    console.log('Задача есть');
                                }
                            }

                            let mm_noTask = await getNoTasks(linkNoTask);
                            let LeadNoTaskLinksArr = LeadNoTaskLinks(mm_noTask);

                            RedirectToLeadNoTask(LeadNoTaskLinksArr);
                            // if (typeof LeadNoTaskLinksArr[1] != 'undefined') {
                            //     mm_notCall(LeadNoTaskLinksArr[1]);
                            // }

                            if (typeof LeadNoTaskLinksArr != 'undefined') {
                                console.log(LeadNoTaskLinksArr);
                            }


                        }, 300);



                    } else {

                    }
                }


                main(mm_bool_setting);
            } else {
                console.log('Проблная версия закончилась')


                var message_params = {
                    header: "Внимание у REDBOX:",
                    text: "Пробный период окончен",
                    date: 1534084500,
                    icon: "https://image.flaticon.com/icons/svg/165/165031.svg"
                };
                AMOCRM.notifications.show_message(message_params);

                setTimeout(() => {
                    var message_params = {
                        header: "Для продления:",
                        text: "Напишите нам redbox@gmail.com",
                        date: 1534084500,
                        icon: "https://image.flaticon.com/icons/svg/165/165031.svg"
                    };
                    AMOCRM.notifications.show_message(message_params);

                }, 3000);


            }
        }
    }
});
