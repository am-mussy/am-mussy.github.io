define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');
            thisHttp = document.location.href;
            thisHttpArr = thisHttp.split('/');

            let mm_logick = false;



            const subdomain = "redboxamo";
            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`;

            async function getUsers(linkUsers) {
                let response = await fetch(linkUsers);
                let mm_users = await response.json();
                mm_users = mm_users._embedded.users;
                return mm_users;
            }



            const mm_users = await getUsers(linkUsers);


            for (let i of Object.keys(mm_users)) {
                if (mm_users[i].id === AMOCRM.constant('user').id) {
                    for (let j of JSON.parse(localStorage.mm_settings).checked_groups) {
                        if (mm_users[i].group_id === String(j)) {
                            mm_logick = true;
                            console.log('yes');
                        }
                        console.log('no');
                    }
                }
            }






            if (AMOCRM.data.current_entity === "leads" && mm_logick) {







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
