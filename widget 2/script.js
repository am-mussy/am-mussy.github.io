define([
  "jquery",
  "underscore",
  "twigjs",
  "https://am-mussy.github.io/external/index.js",
  "https://am-mussy.github.io/external/render.js",
  "lib/components/base/modal",
], function ($, _, Twig, extw, renw, Modal) {
  var CustomWidget = function () {
    var self = this;
    //test
    this.getTemplate = _.bind(function (template, params, callback) {
      params = typeof params == "object" ? params : {};
      template = template || "";

      return this.render(
        {
          href: "/templates/" + template + ".twig",
          base_path: this.params.path,
          v: this.get_version(),
          load: callback,
        },
        params
      );
    }, this);

    this.callbacks = {
      render: function () {
        console.log("render");
        renw.render(self, Modal);
        return true;
      },
      init: _.bind(function () {
        console.log("init");
        return true;
      }, this),
      bind_actions: function () {
        console.log("bind_actions");
        return true;
      },
      settings: function () {
        console.log("on settings");
        extw.settings(self);
        return true;
      },
      onSave: function () {
        extw.onSave(self);
        return true;
      },
      destroy: function () {},
      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
          console.log("contacts");
        },
      },

      advancedSettings: _.bind(function () {
        var $work_area = $("#work-area-" + self.get_settings().widget_code),
          $save_button = $(
            Twig({ ref: "/tmpl/controls/button.twig" }).render({
              text: "Сохранить",
              class_name:
                "button-input_blue button-input-disabled js-button-save-" +
                self.get_settings().widget_code,
              additional_data: "",
            })
          ),
          $cancel_button = $(
            Twig({ ref: "/tmpl/controls/cancel_button.twig" }).render({
              text: "Отмена",
              class_name:
                "button-input-disabled js-button-cancel-" +
                self.get_settings().widget_code,
              additional_data: "",
            })
          );

        console.log("advancedSettings");

        $save_button.prop("disabled", true);
        $(".content__top__preset").css({ float: "left" });

        $(".list__body-right__top")
          .css({ display: "block" })
          .append('<div class="list__body-right__top__buttons"></div>');
        $(".list__body-right__top__buttons")
          .css({ float: "right" })
          .append($cancel_button)
          .append($save_button);

        self.getTemplate("advanced_settings", {}, function (template) {
          var $page = $(
            template.render({
              title: self.i18n("advanced").title,
              widget_code: self.get_settings().widget_code,
            })
          );

          $work_area.append($page);
        });
      }, self),
    };
    return this;
  };

  return CustomWidget;
});
