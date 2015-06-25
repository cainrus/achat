(function () {
    'use strict';

    /**
     * Pseudo uid generator.
     */

    var counter = 0;

    define({
        generate: function () {
            return new Date().getTime() + String(counter++);
        }
    });
}());
