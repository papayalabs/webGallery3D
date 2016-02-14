define(['jquery', 'stats'], function ($) {


    var hud = $('#hud'),
        stats,
        hudSpan,

    hudExists = function () {
        return hud !== undefined && hud.length > 0;
    };

    (function () {
        var div;

        if (hudExists()) {
            hud.hide();

            stats = new Stats();
            stats.setMode(0);
            div = $('<div></div>');
            div.appendTo(hud);
            div.append(stats.domElement);

            hudSpan = $('<span></span>');
            hudSpan.appendTo(hud);
        }       
    })();

    return {

        setMessage: function (message) {
            if (hudSpan !== undefined) {
                hudSpan.text(message);
            }
        },

        show: function () {
            if (hudExists()) {
                hud.show();
            }
        },

        hide: function () {
            if (hudExists()) {
                hud.hide();
            }
        },

        beginMeasure: function () {
            if (hudExists()) {
                stats.begin();
            }
        },

        endMeasure: function () {
            if (hudExists()) {
                stats.end();
            }
        },
    };
   
});