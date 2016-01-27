define(['jquery-2.2.0.min'], function () {

	// Get the required DOM-elements
    var header = $('#messageSpan'),
    blocker = $('#blocker'),
    logo = $('#logo'),
    content = $('#instructions'),
    instructionSpan = $('#instructionSpan'),
	buttonToggleLang = $('#btLanguage'),
	
	
    culture = 'de',  
	headerKey = '',
	messageKey = '',
	
	
	// JSON-object with text-data 
    messages = {
		
        'init': {
            'de': 'Lade...',
            'en': 'Loading...'
        },

        'download': {
			'placeholders' : ['#1'],
            'de': '#1% heruntergeladen',
            'en': '#1% downloaded'
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
            'de': 'Ihr Browser unterstützt die Lock-API nicht.',
            'en': 'Your browser doesn\'t seem to support Pointer Lock API.'            
        },

        'errorOnLocking': {
            'de': 'Während der Mausverriegelung ist ein Fehler aufgetreten.',
            'en': 'An error occured during the mouse-locking.'
        },

		
    },
	
	// Returns the text with the given key and culture.
	// 'params' should be an array of values. Each placeholder in a text is replaced by the value with the same index
	buildText = function(key, culture, params) {
	
		// Get the text from the JSON
		var txt = messages[key][culture] || '';
		
		// Get the placeholders from the JSON
		var placeholders = messages[key].placeholders || {};
		
		// Replace the placeholders in the text with the values from the 'params'-array
		if(placeholders.length !== undefined) {
			params.forEach(function(a, idx) {			
				if(placeholders.length > idx) {
					txt = txt.replace(new RegExp(placeholders[idx], 'g'), a);
				}
			});
		}
		
		return txt;
	},
	
	
	// Updates the text-data in the DOM-elements.
	// The first two parameters should be keys from the JSON-structure.
	// If they are empty-strings or undefined, the LAST USED key is used again.
	// These parameters are only required if you want to change the content.
	// All further parameters are handled as placeholder-values for the text
	refreshText = function (keyH, keyM) {
		content.show();		
		
		if(keyH !== undefined && keyH !== '') {
			headerKey = keyH;
		}
		
		if(keyM !== undefined && keyM !== '') {
			messageKey = keyM;
		}
		
		var params =[].splice.call(arguments,2);
		
		header.text(buildText(headerKey, culture, params));
		instructionSpan.html(buildText(messageKey, culture, params));		
	};
	
	
	// Initialize the language-button
	buttonToggleLang.text('English');	
	buttonToggleLang.click(function() {
	
		if(culture === 'de') {
			culture = 'en';
			buttonToggleLang.text('Deutsch');
		} else {
			culture = 'de';
			buttonToggleLang.text('English');
		}
		
		
		// Switch the displayed language
		refreshText();
		
	});

    return {

		// Show the initialisation-message
        setMessageInit: function () {			
			refreshText('init', 'instructions');			
        },

		// Set the loading-progress
        setMessageProgress : function(percent) {
			refreshText('download', '', percent);           
        },

		// Show the ready-message
        setMessageReady : function() {
            refreshText('ready');	
        },

		// Show the 'NoAPI'-error
        setErrorMessageNoAPI: function () {
			refreshText('errorHeader', 'errorNoLockAPI');                   
        },

		// Show the 'Locking'-error
        setErrorMessageLocking: function () {
			refreshText('errorHeader', 'errorOnLocking');            
        },

		// Set the callback which gets executed on start
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
      
	  
		// Just hide the content, but not the blocker
        hideContent: function () {
            content.hide();
        },

    };
});