module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
	qunit: {
		all: {
		  options: {
			urls: [
				'http://localhost:8000/test/basic/test.html',
				'http://localhost:8000/test/models/test.html',
				'http://localhost:8000/test/rooms/test.html',
				'http://localhost:8000/test/rooms/testManager.html',
			]
		  }
		}
	},
	connect: {
		server: {
			  options: {
				port: 8000,
				base: '.'
			  }
		}
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
	  files: ['gruntfile.js', 'app/**/*.js', '!app/**/*.min.js', '!app/**/require.js'],
	  // configure JSHint (documented at http://www.jshint.com/docs/)
	  options: {
			// more options here if you want to override JSHint defaults
			bitwise: true,
			curly: false,
			undef: false,
			unused: true,
		  
		globals: {
			
			jQuery: true,
			console: true,
			module: true,			
		},		
		reporter:'jslint',
		reporterOutput: 'lint/hints.xml'
	  }
	}
  });
  
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Load the plugin that provides the "qunit" task.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  
  // Load the plugin that provides the "requirejs" task.
  grunt.loadNpmTasks('grunt-contrib-requirejs');
     
  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['connect', 'qunit', 'jshint', 'requirejs']);

  grunt.registerTask('test', ['connect', 'qunit']);
};