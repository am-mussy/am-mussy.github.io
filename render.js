define([], function () {

    return {
        render: (self) => {
            console.log('OK');
            var data = '<h1>Test</h1><p>Some text</p>';
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
            }
    };
    });
