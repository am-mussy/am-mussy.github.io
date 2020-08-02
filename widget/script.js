define([
  "jquery",
  "underscore",
  "twigjs",
  "https://am-mussy.github.io/external/index.js",
  "lib/components/base/modal",
], function ($, _, Twig, extw, Modal) {
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
        extw.render(self, Modal);
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
    };
    return this;
  };

  return CustomWidget;
});
