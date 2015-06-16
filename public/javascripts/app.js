define(
    [
      "marionette",
      "radio",
      "lib/handlebars",

    ],
    function(
      Marionette,
      Radio
      ) {


      var Chat = new Marionette.Application({});

      Chat.on('before:start', function(options){
        options.channel = Radio.channel('chat');
      })

      var ChatLayout = Marionette.LayoutView.extend({
        el: 'body'
      });

      Chat.layout = new ChatLayout({});



      Chat.on("start", function(options) {


      });

      return Chat;
    }
);
