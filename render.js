define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');
            thisHttp = document.location.href;
            thisHttpArr = thisHttp.split('/');

            let mm_logick = false;

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
                                    mm_logick = true; //Если все условия собледены mm_logick = true -- означает, что логика работает
                                    console.log('yes');
                                }
                                console.log('no');

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


            //Проверяем находимся ли мы в сделке, для отображения окна
            if (AMOCRM.data.current_entity === "leads" && mm_logick) {
                data = mm_button + `<h1> Hello world </h1>`;
               // document.body.addEventListener("mouseleave", () => { ModalRender(data) });
                $('.js-switcher-task').trigger('click');
                $('.feed-compose_task-future').css({ "border": "2px solid rgb(243, 117, 117)" })


            }



            function ModalRender(data) {
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
                    }
                });
            }


        }
    }
});
