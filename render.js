define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');


            const subdomain = "redboxamo";
            const linkUsers = `https://${subdomain}.amocrm.ru/api/v2/account?with=users`;

            //GET на получение списка ВОРОНОК
            async function getUsers(linkUsers) {

                let response = await fetch(linkUsers);
                let mm_users = await response.json();
                mm_users = mm_users._embedded.users;
                return mm_users;
            }

            //Записываем список ВОРОНОК в piplines
            const mm_users = await getUsers(linkUsers);

            console.log(mm_users);

            const mm_usersArr = [];


            for (let i of Object.keys(mm_users)) {

                mm_usersArr.push({
                    name: mm_users[i].name,
                    group_id: mm_users[i].group_id
                })
            }

            console.log(mm_usersArr);

            //Cортируем по id
            mm_usersArr.sort(function (a, b) {
                if (a.group_id > b.group_id) {
                    return 1;
                }
                if (a.group_id < b.group_id) {
                    return -1;
                }
            });

            //Сортируем по Имени
            mm_usersArr.sort(function (a, b) {
                if (a.group_id === b.group_id && a.name > b.name) {
                    return 1;
                }
                if (a.group_id === b.group_id && a.name < b.name) {
                    return -1;
                }
            });


            const linkGroups = `https://${subdomain}.amocrm.ru/api/v2/account?with=groups`;

            async function getGroups(linkGroups) {  //дублирование кода?
                let response = await fetch(linkGroups);
                let Groups = await response.json();
                Groups = Groups._embedded.groups;
                return Groups;
            }

            const groups = await getGroups(linkGroups);

            console.log(groups);

            let m_data = []

            for (const i of Object.keys(groups)) {

                m_data.push({
                    option: groups[i].name,
                    id: groups[i].id + groups[i].name,
                    disabled: true,
                    bg_color: "#" + ((1 << 24) * Math.random() | 0).toString(16)
                })

                for (let j of mm_usersArr) {
                    if (groups[i].id === j.group_id) {
                        m_data.push({
                            option: j.name,
                            id: j.group_id + j.name,
                            disabled: false
                        })
                    }
                }

            }

            console.log(m_data);


            console.log(mm_usersArr);
            // m_data = [
            //     {
            //         option: 'Отдел продаж',
            //         id: 'id1',
            //         disabled: true,
            //         bg_color: '#f503b3',
            //     },
            //     {
            //         option: 'Вадим',
            //         id: 'id2',
            //     },
            //     {
            //         option: 'Анастасия',
            //         id: 'id3',
            //     }
            // ]; //массив данных, передаваемых для шаблона

            var mm_select = self.render(
                { ref: '/tmpl/controls/select.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    items: m_data,      //данные
                    class_name: 'test_select',  //указание класса
                    id: 'test_select'   //указание id
                });



            var data = mm_select;
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
});
