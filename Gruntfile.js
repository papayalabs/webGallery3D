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
		  baseUrl: "app/js",
		  mainConfigFile: "app/js/main.js",
		  name: "main", 
		  out: "app/build/optimized.min.js"
		}
	  }
	},
	
	jshint: {
	  // define the files to lint
	  files: ['gruntfile.js', 'app/**/*.js', '!app/**/*.min.js'],
	  // configure JSHint (documented at http://www.jshint.com/docs/)
	  options: {
		  // more options here if you want to override JSHint defaults
		globals: {
		  jQuery: true,
		  console: true,
		  module: true
		},		
		reporter:'jslint',
		reporterOutput: 'lint/hints.xml'
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

  grunt.registerTask('test', ['qunit']);
};