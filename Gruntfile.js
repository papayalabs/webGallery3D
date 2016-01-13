module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'WebSite1/**/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
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

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

};