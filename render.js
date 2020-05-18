define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');


            const subdomain = "metop97204";
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

            let mm_usersArr = [];


            for (let i of Object.keys(mm_users)) {

                mm_usersArr.push({
                    name: i.name,
                    group_id: i.group_id
                })
            }

            console.log(mm_usersArr);


            let m_data = [
                {
                    option: 'Отдел продаж',
                    id: 'id1',
                    disabled: true,
                    bg_color: '#f503b3',
                },
                {
                    option: 'Вадим',
                    id: 'id2',
                },
                {
                    option: 'Анастасия',
                    id: 'id3',
                }
            ]; //массив данных, передаваемых для шаблона

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
