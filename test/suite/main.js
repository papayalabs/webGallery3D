require.config({
  paths: {
      'QUnit': '../lib/qunit-1.20.0',
	  'bridge': '../lib/bridge',
  },
  shim: {
     'QUnit': {
         exports: 'QUnit',
         init: function() {             
             QUnit.config.autostart = false;
         }
     } 
  }
});


// require the unit tests.
require(['QUnit', 'runner'], function(QUnit, runner) {
      // run the tests.
	  QUnit.start();
      runner.run();     
});