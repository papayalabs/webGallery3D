require.config({
  paths: {
      'QUnit': '../lib/qunit-1.20.0'
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
require(['QUnit', 'reqTest'], function(QUnit, dummyTest) {
      // run the tests.
	  QUnit.start();
      dummyTest.run();     
});