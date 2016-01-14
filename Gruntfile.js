module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
	qunit: {
		all: ['test/**/*.html']
	},
	
	requirejs: {
	  compile: {
		options: {
		  baseUrl: "WebSite1/js",
		  mainConfigFile: "WebSite1/js/main.js",
		  name: "main", // assumes a production build using almond 
		  out: "WebSite1/build/optimized.min.js"
		}
	  }
	},
	
	jshint: {
	  // define the files to lint
	  files: ['gruntfile.js', 'WebSite1/**/*.js', '!WebSite1/**/*.min.js'],
	  // configure JSHint (documented at http://www.jshint.com/docs/)
	  options: {
		  // more options here if you want to override JSHint defaults
		globals: {
		  jQuery: true,
		  console: true,
		  module: true
		},		
		reporter:'jslint',
		reporterOutput: 'build/hints.xml'
	  }
	}
  });

  // Load the plugin that provides the "qunit" task.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  
  // Load the plugin that provides the "requirejs" task.
  grunt.loadNpmTasks('grunt-contrib-requirejs');
     
  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['qunit', 'jshint', 'requirejs']);

};