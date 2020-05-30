define([], function () {

    return {
        render: async (self, Modal) => {



            var message_params = {
                header: "Внимание",
                text: "Соединение установлено",
                date: 1534084500,
                icon: "https://www.example.com/images/telephone.png",
                link: "https://www.example.com/images/telephone.png"
            };

            AMOCRM.notifications.show_message(message_params);


            console.log('OK');


            let mm_bool_setting = false; //Если True - пользоватьль подходит под настройки
            let mm_bool_noTask = false; //Если True - задачи в сделке нет
            let mm_modal_isOpen = false;
            const subdomain = "redboxamo1";
            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`;

            async function getUsers(linkUsers) {
                let response = await fetch(linkUsers);
                let mm_users = await response.json();
                mm_users = mm_users._embedded.users;
                return mm_users;
            }

            const mm_users = await getUsers(linkUsers);
            console.log(self.get_settings());
            console.log(typeof self.get_settings().idgroup)


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

            var mm_button = self.render( //дублирование кода?
                { ref: "/tmpl/controls/button.twig" },
                {
                    class_name: "mm_button",
                    text: "Поставлю задачу, только не бей",
                }
            );

            const linkNoTask = `https://${subdomain}.amocrm.ru/api/v2/leads?filter[tasks]=1`;

            async function getNoTasks(linkNoTask) {
                let response = await fetch(linkNoTask);
                let mm_noTask = await response.json();
                mm_noTask = mm_noTask._embedded.items;
                return mm_noTask;
            }

            let mm_noTask = await getNoTasks(linkNoTask);


            let mm_linksNoTask = [];
            for (let i of Object.keys(mm_noTask)) {

                mm_linksNoTask.push(`https://${subdomain}.amocrm.ru/leads/detail/${mm_noTask[i].id}`);
            }

            console.log(mm_linksNoTask);
            // window.open(`${mm_linksNoTask[0]}`, "_blank");


            function BoolTask(CheckTime, data) {
                //CheckTime - интервал проверки
                //data - данные для модалки
                if (AMOCRM.data.current_entity === "leads") {
                    setInterval(() => {
                        if ($(".card-task-wrapper").length === 0) {
                            mm_bool_noTask = true;
                            if (AMOCRM.data.current_entity === "leads" && mm_bool_setting && !mm_modal_isOpen) {
                                console.log('Задачи нет');
                                document.body.addEventListener("mouseleave", () => { mRender(data) }); //Уход курсора за body
                                document.getElementById("common--arrow-left").addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на кнопку назад в сделке
                                document.getElementById("nav_menu").addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на боковое меню
                                document.getElementById(AMOCRM.constant('user').id).addEventListener("mouseover", () => { mRender(data) }); //Навели курсор на фото профиля
                                $('.js-switcher-task').trigger('click'); //эмулируем нажатие кнопки, для отображения интерфейса поставноки задачи
                                $('.feed-compose_task-future').css({ "border": "2px solid rgb(243, 117, 117)" }); //Краная рамка вокруг окна задач

                            }
                        } else {
                            mm_bool_noTask = false;
                            $('.feed-compose').css({ "border": "0px" });
                            console.log('Задача есть');
                        }
                    }, CheckTime);

                }

            }


            BoolTask(1000, mm_button + `<h1> Hello world </h1>`);

            //Возможно не нужна функция :)
            function mRender(data) {
                if (AMOCRM.data.current_entity === "leads" && !mm_modal_isOpen && mm_bool_noTask) {
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





        }
    }
});
