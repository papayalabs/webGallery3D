

	var models = [
		{
			files : ['galleryboxV1.json', 'image1l.json', 'image2.json'],		
			path : "../../app/models/room1/"
		},
		{
			files : ['galleryglassV1.json', 'imageboxV1.json'],		
			path : "../../app/models/room2/"
		},
	],

	
	isString = function(o) {
		return typeof o == "string" || (typeof o == "object" && o.constructor === String);
	},
	
	imageTest = function (url) 
	{		
		try {
			var http = new XMLHttpRequest();
			http.open('HEAD', url, false);
			http.send();
			return http.status!=404;
		
		} catch (e) {
			console.log('Error when checking image: ' + e);
			return false;
		}
	},

	findFile = function(val, callback) {
			
		if(val === undefined || isString(val)) 
			return;
				
		for(var key in val) {		
			if (val.hasOwnProperty(key)) {
				var node = val[key];
			
				if(node['key'] === '$tex.file' &&
					node['value'] !== undefined) {
					callback(node['value']);
				} else {				
					findFile(node, callback);
				}
			}
		};		
	},
	
	
	checkTextureFiles = function(names, root, assert, doneCallback) {
		var cnt = 0;
		
		names.forEach(function(m) {
		
			console.log('loading ' + m);
		
			$.getJSON(root + m, function(json) {
			
				cnt++;	
				console.log(cnt + ': ' + m + ' loaded.');
				
				assert.ok(json != undefined, m + " was loaded.");	
				
				findFile(json.materials, function(file) {
					var result = imageTest(root + file)					
					assert.ok(result, root + file + ' --> exists.');
				});
											
				if(cnt == names.length)
				{
					console.log('execute done');
					doneCallback();
				}
			})		
			.fail(function() {
				assert.ok(false, 'jQuery error');				
			});
			
		});
	};
		
	QUnit.start();
	
	QUnit.test("Check texture-files on json-models for all rooms", function(assert) {		
		models.forEach(function(m) {
			var done = assert.async();
			console.log('Checking models in ' + m['path']);
			checkTextureFiles(m['files'], m['path'], assert, function() { done(); });
		});
	});
	

