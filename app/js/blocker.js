define(['jquery-2.2.0.min'], function () {

    var messageSpan = $('#messageSpan');
    var blocker = $('#blocker');
    var logo = $('#logo');
    var instructions = $('#instructions');
    var instructionSpan = $('#instructionSpan');

    var culture = 'de';
  
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
            'de': 'Bereit. Auf das Bild klicken, um zu starten',
            'en': 'Ready. Click on the image to start.'
        },

        'instructions' : {
            'de': 'W, A, S, D oder Pfeiltasten für Bewegung.<br />Umblicken mit der Maus.<br />ESC, um die Räume zu verlassen',
            'en': 'W, A, S, D or Arrows for movement.<br />Lookaround with the mouse.<br />ESC for leaving.'
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
            messageSpan.text(messages.init[culture]);
            instructionSpan.html(messages.instructions[culture]);
        },

        setMessageProgress : function(percent) {
            messageSpan.text(percent + messages.download[culture]);
        },

        setMessageReady : function() {
            messageSpan.text(messages.ready[culture]);
        },

        setErrorMessageNoAPI: function () {
            instructions.show();
            instructions.html(messages.errorNoLockAPI[culture]);           
        },

        setErrorMessageLocking: function () {
            instructions.show();
            instructions.html(messages.errorOnLocking[culture]);
        },


        setStartCallback: function(callback){
            logo.click(callback);
        },

		// Fade-in in the blocker and fire a callback when done
        show: function (callback) {                              
			instructions.show();
			blocker.stop(true, true).fadeIn(400, callback);            
			
			// TODO: Test: Check if the callback gets fired when show is called twice
        },

		// Fade-out the blocker
        hide: function () {                  
            blocker.stop(true, true).fadeOut();
        },
      
        hideInstructions: function () {
            instructions.hide();
        },

    };
});