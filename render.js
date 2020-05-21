define([], function () {

    return {
        render: async (self, Modal) => {
            console.log('OK');
            thisHttp = document.location.href;
            thisHttpArr = thisHttp.split('/');

            if (thisHttpArr[arr.length - 2] === "detail") {


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






            // modal = new Modal({
            //     class_name: 'modal-window',
            //     init: function ($modal_body) {
            //         var $this = $(this);
            //         $modal_body
            //             .trigger('modal:loaded') // запускает отображение модального окна
            //             .html(data)
            //             .trigger('modal:centrify')  // настраивает модальное окно
            //             .append('');
            //     },
            //     destroy: function () {
            //     }
        });






        }
    }
});
