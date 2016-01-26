define(['jquery-2.2.0.min'], function () {

    var header = $('#messageSpan'),
    blocker = $('#blocker'),
    logo = $('#logo'),
    content = $('#instructions'),
    instructionSpan = $('#instructionSpan'),
    culture = 'de',  
	
    messages = {


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
		
		'errorHeader' : {
			'de': 'Leider ist ein Fehler aufgetreten...',
            'en': 'An error occured...' 
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
			content.show();
            header.text(messages.init[culture]);
            instructionSpan.html(messages.instructions[culture]);
        },

        setMessageProgress : function(percent) {
            header.text(percent + messages.download[culture]);
        },

        setMessageReady : function() {
            header.text(messages.ready[culture]);			
        },

        setErrorMessageNoAPI: function () {
            content.show();
			header.text(messages.errorHeader[culture]);
            instructionSpan.html(messages.errorNoLockAPI[culture]);           
        },

        setErrorMessageLocking: function () {
            content.show();
			header.text(messages.errorHeader[culture]);
            instructionSpan.html(messages.errorOnLocking[culture]);
        },


        setStartCallback: function(callback){
            logo.click(callback);
        },

		// Fade-in in the blocker and fire a callback when done
        show: function (callback) {                              
			content.show();
			blocker.stop(true, true).fadeIn(400, callback);            
			
			// TODO: Test: Check if the callback gets fired when show is called twice
        },

		// Fade-out the blocker
        hide: function () {                  
            blocker.stop(true, true).fadeOut(800);
        },
      
        hideContent: function () {
            content.hide();
        },

    };
});