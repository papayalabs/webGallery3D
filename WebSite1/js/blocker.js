define([], function () {

    var messageSpan = document.getElementById('messageSpan');
    var blocker = document.getElementById('blocker');
    var instructions = document.getElementById('instructions');

    var culture = 'en';

    var setMessage = function (msg) {
        messageSpan.innerHTML = msg;
    };

    

    var messages = {


        'init': {
            'de': 'Lade...',
            'en': 'Loading...'
        },

        'download': {
            'de': '% heruntergeladen',
            'en': '% downloaded'
        },

        'ready': {
            'de': 'Hier klicken, um zu starten.',
            'en': 'Click here to start.'
        },


        'errorNoLockAPI': {
            'de': 'Ihr Browser unterstützt die Lock-API nicht...',
            'en': 'Your browser doesn\'t seem to support Pointer Lock API...'            
        },

        'errorOnLocking': {
            'de': 'Während der Mausverriegelung ist ein Fehler aufgetreten.',
            'en': 'An error occured during the mouse-locking.'
        },



    };



    return {

        setMessageInit: function () {
            setMessage(messages.init[culture])
        },

        setMessageProgress : function(percent) {
            setMessage(percent + messages.download[culture]);
        },

        setMessageReady : function() {
            setMessage(messages.ready[culture])
        },

        setErrorMessageNoAPI: function () {
            instructions.style.display = '';
            instructions.innerHTML = messages.errorNoLockAPI[culture];           
        },

        setErrorMessageLocking: function () {
            instructions.style.display = '';
            instructions.innerHTML = messages.errorOnLocking[culture];
        },

        show: function () {                  
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';
        },


        hide: function () {                  
            blocker.style.display = 'none';
        },


       

        hideInstructions: function () {
            instructions.style.display = 'none';
        },

    }
});