// Set up the paths for the application.



// requirejs.config();

require(
    [
        "jquery", "marionette", "./lib/socket"
    ],
    function($, Marionette, io) {
      console.log($.fn.jquery);
      debugger;
    }
);
