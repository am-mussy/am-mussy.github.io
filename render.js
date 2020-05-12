define([], function () {

    return {
        render: (self, Modal) => {
            console.log('OK');
            var data = '<div class="mm_boxbody"> </div>';

            m_data = [
                {
                    option: 'option1',
                    id: 'id1'
                },
                {
                    option: 'option2',
                    id: 'id2'
                },
                {
                    option: 'option3',
                    id: 'id3'
                }
            ]; //массив данных, передаваемых для шаблона

            var mm_select = self.render(
                { ref: '/tmpl/controls/select.twig' }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    items: m_data,      //данные
                    class_name: 'subs_w',  //указание класса
                    id: w_code + '_list'   //указание id
                });



            $(".mm_boxbody").append("<br>" + mm_select + "<br>");
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
