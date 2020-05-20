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



            let m_data = []

            for (const i of Object.keys(groups)) {

                // m_data.push({
                //     option: groups[i].name,
                //     id: groups[i].id + groups[i].name,
                //     disabled: true,
                //     bg_color: "#" + ((1 << 24) * Math.random() | 0).toString(16)
                // })

                for (let j of mm_usersArr) {
                    if (groups[i].id === j.group_id) {
                        m_data.push({
                            option: j.name,
                            id: j.group_id + j.name,
                            disabled: false,
                            is_selected: true
                        })
                    }
                }



            }

            const linkTaskTypes = `https://${subdomain}.amocrm.ru/api/v2/account?with=task_types`;

            async function getTaskTypes(linkTaskTypes) {  //дублирование кода?
                let response = await fetch(linkTaskTypes);
                let taskTyps = await response.json();
                taskTyps = taskTyps._embedded.task_types;
                return taskTyps;
            }


            const taskTypes = await getTaskTypes(linkTaskTypes);

            let mm_dataTaskTyps = [];

            for (const i of Object.keys(taskTypes)) {
                mm_dataTaskTyps.push({
                    option: taskTypes[i].name,
                    id: taskTypes[i].name
                })

            }

            //Список пользователей
            var mm_select = self.render(
                { ref: '/tmpl/controls/select.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    items: mm_dataTaskTyps,      //данные
                    class_name: 'mm_select',  //указание класса
                    id: 'test_select'   //указание id
                });

            //типы задач
            var mm_taskType = self.render(
                { ref: '/tmpl/controls/select.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    items: m_data,      //данные
                    class_name: 'mm_taskType',  //указание класса
                    id: 'test_select'   //указание id
                });

            //текст задачи
            var mm_textaria = self.render(
                { ref: '/tmpl/controls/textarea.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    class_name: "mm_textaria",
                    id: "text",
                    tab_index: "tab_index",
                    placeholder: "Текст задачи",
                    additional_data: "additional_data",

                });

            var mm_button = self.render(
                { ref: '/tmpl/controls/button.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    class_name: 'mm_button',
                    text: 'Поставить задачу'
                });


            var mm_dataField = self.render(
                { ref: '/tmpl/common/tasks_date.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    name: name,
                    class_name: "mm_dataField",
                    date: 0
                });




            var data = mm_select + mm_dataField + mm_taskType + mm_textaria + mm_button;
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


            // $(".modal-body").css({ "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "grid-column-gap": "10px", "grid-row-gap": "10px" });

            // $(".mm_select").css({ "grid-column-start": "1", "grid-column-end": "2" });
            // $(".mm_dataField").css({ "grid-column-start": "2", "grid-column-end": "3" });
            // $(".mm_taskType").css({ "grid-column-start": "3", "grid-column-end": "4" });

            // $(".mm_textaria").css({ "grid-column-start": "1", "grid-column-end": "4" });
            // $(".mm_button").css({ "grid-column-start": "3", "grid-column-end": "4" });



        }
    }
});
