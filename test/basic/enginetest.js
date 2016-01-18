// phantom js does not support the performance-api
var performance = {
	now : function() {
		return Date.now();
	}
}

// simulate require-js
define = function(dependencies, callback)
{
	
	console.log(dependencies);
	var isInitCalled = false;
	
	
	// execute the callback from the require-'define'-function
	var engine = callback({
		
		
		setMessageInit: function () {
            isInitCalled = true;
        },

        setMessageProgress : function(percent) {
            
        },

        setMessageReady : function() {
            
        },

        setErrorMessageNoAPI: function () {
            
        },

        setErrorMessageLocking: function () {
           
        },


        setStartCallback: function(callback){
           
        },

        show: function () {                  
           
        },


        hide: function () {                  
            
        },
      
        hideInstructions: function () {
            
        },
	});
	
	QUnit.test("engine calls 'setMessageInit'", function(assert) {
		try {
				engine.init();
		} catch (e) {
			console.log('Error when creating THREE.js but that\'s OK on phantom.js')
		}
		
		assert.ok(isInitCalled, "'setMessageInit' was called.");
	});
};