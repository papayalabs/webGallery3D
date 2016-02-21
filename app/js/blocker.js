define(['jquery'], function ($) {

	// Get the required DOM-elements
	var header = $('#message'),
	blocker = $('#blocker'),
	logo = $('#logo'),
	content = $('#content'),
	instructions = $('#instructions'),
	buttonToggleLang = $('#btLanguage'),
	linkImprint = $('#lnkImprint'),
	linkSources = $('#lnkSources'),	
	progress = $('#progress'),
	progressBar = $('#progressBar'),
	
	hoverURL = 'images/logoHover.jpg',
	culture = 'de',  
	headerKey = '',
	messageKey = '',

    // Detect wether WebGL is supported
    hasWebGL = (function () {        
        try
        {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }              
    })(),
	
	// JSON-object with text-data 
	messages = {
		
		'init': {
			'de': 'Lade...',
			'en': 'Loading...'
		},
		
		'language': {
			'de': 'English',
			'en': 'Deutsch'
		},
		
		'imprint' : {
			'de': 'Impressum',
			'en': 'Imprint (german)'
		},
		
		'sources' : {
			'de': 'Quelltext auf Github',
			'en': 'Sources on Github'            
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

		'errorNoWEBGL': {
		    'de': 'Es wurde keine Web-GL Unterstützung gefunden.<br/>Ohne Web-GL kann diese Seite nicht angezeigt werden.',
		    'en': 'Web-GL is not supported by your browser.<br/>The page can\'t be displayed without Web-GL '
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
		instructions.html(buildText(messageKey, culture, params));	
		initText();
		
	},
	
	
	initText = function() {
		buttonToggleLang.text(buildText('language', culture));
		linkImprint.text(buildText('imprint', culture));
		linkSources.text(buildText('sources', culture));
	};
	


	(function () {

		// Preload the hover-image. When the mourse-pointer enters the image, the hover-image is already loaded
		$('<img/>')[0].src = hoverURL;

		// Initialize the language-button
		initText();
		buttonToggleLang.click(function () {

			if (culture === 'de') {
				culture = 'en';
			} else {
				culture = 'de';
			}


			// Switch the displayed language
			refreshText();
		});

		if (hasWebGL === false) {
		    refreshText('errorHeader', 'errorNoWEBGL');
		}
	})();
	
	



	return {
	
		setCallbacks: function(cfg) {
			if(cfg === undefined) {
				return;
			}
			
			if (hasWebGL && (typeof cfg.start === 'function')) {
				logo.click(cfg.start);				
			}
			
			if(typeof cfg.loadRequest === 'function') {
				// TODO
			}
		},

		// Show the initialisation-message
		setMessageInit: function () {
		    logo.removeClass('logohover');

		    if (hasWebGL) {
		        refreshText('init', 'instructions');
		    }
		},

		// Set the loading-progress
		setMessageProgress: function (percent) {
		    if (hasWebGL) {
		        progress.show();
		        progressBar.width(percent + '%');
		        refreshText('download', '', percent);
		    }
		},

		// Show the ready-message
		setMessageReady: function () {
		    if (hasWebGL) {
		        logo.addClass('logohover');
		        progress.hide();
		        refreshText('ready');
		    }
		},

		// Show the 'NoAPI'-error
		setErrorMessageNoAPI: function () {
			refreshText('errorHeader', 'errorNoLockAPI');                   
		},

		// Show the 'Locking'-error
		setErrorMessageLocking: function () {
			refreshText('errorHeader', 'errorOnLocking');            
		},

		

		// Fade-in in the blocker and fire a callback when done
		show: function (callback) {                              
			content.show();
			blocker.stop(true, true).fadeIn(400, callback);            
			
			// TODO: Test: Check if the callback gets fired when show is called twice
		},

		// Fade-out the blocker
		hide: function () {
		    if (hasWebGL) {
		        blocker.stop(true, true).fadeOut(800);
		    }
		},
	  
	  
		// Just hide the content, but not the blocker
		hideContent: function () {
		    if (hasWebGL) {
		        content.hide();
		    }
		},


		getCulture: function () {
		    return culture;
		},
		
	};
});