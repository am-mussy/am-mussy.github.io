define([], function () {

    return {
        render: (self, Modal) => {
            console.log('OK');


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
