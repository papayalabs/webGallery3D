require.config({

	baseUrl:'../../app/js',
	
  paths: {
      'QUnit': '../../test/lib/qunit-1.20.0',	  
	  'bridge': '../../test/lib/bridge',
	  'three': '../../app/js/lib/three.min',
	  'jquery': '../../app/js/lib/jquery.min',	  
	  'stats' : '../../app/js/lib/stats.min',	  	   
	  'local' : '../../test/suite'
  },
  shim: {
    'QUnit': {
         exports: 'QUnit',
         init: function() {             
             QUnit.config.autostart = false;
         }
     },
	'three': { exports: 'THREE' },	 
  },
  
  map: {
	  // '*' means all modules will get 'jquery-private'
	  // for their 'jquery' dependency.
	  '*': { 'jquery': 'jquery-private' },

	  // 'jquery-private' wants the real jQuery module
	  // though. If this line was not here, there would
	  // be an unresolvable cyclic dependency.
	  'jquery-private': { 'jquery': 'jquery' }
  }
});


// require the unit tests.
require(['QUnit', 'local/runner'], function(QUnit, runner) {
      // run the tests.
	  QUnit.start();
      runner.run();     
});