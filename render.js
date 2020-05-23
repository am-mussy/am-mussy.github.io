define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');
            thisHttp = document.location.href;
            thisHttpArr = thisHttp.split('/');


            const subdomain = "redboxamo";
            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`;

            async function getSUsers(linkUsers) {
                let response = await fetch(linkUsers);
                let users = await response.json();
                users = users._embedded.users;
                return users;
            }



            const mm_users = getSUsers(linkUsers);
            for (let i of Object.keys(mm_users)) {
                if (mm_users[i].id === AMOCRM.constant('user').id) {
                    console.log(mm_users[i].name, mm_users[i].group_id)
                }
            }

            if (AMOCRM.data.current_entity === "leads") {







                data = `<h1> Hello world </h1>`;
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
