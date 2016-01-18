

	var models1 = ['galleryboxV1.json', 'image1l.json', 'image2.json'];		
	var rootPath1 = "../../app/models/room1/";
	
	var models2 = ['galleryglassV1.json', 'imageboxV1.json'];		
	var rootPath2 = "../../app/models/room2/";
	
	function isString(o) {
		return typeof o == "string" || (typeof o == "object" && o.constructor === String);
	};
	
	var imageTest = function (url) 
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
	};

	var findFile = function(val, callback) {
			
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
	};
	
	
	var checkTextureFiles = function(names, root, assert, doneCallback) {
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
	
	QUnit.test("Check texture-files on json-models for room1", function(assert) {
		var done = assert.async();
		checkTextureFiles(models1, rootPath1, assert, function() { done(); });
	});
	
	QUnit.test("Check texture-files on json-models for room2", function(assert) {
		var done = assert.async();
		checkTextureFiles(models2, rootPath2, assert, function() { done(); });
	});
	
	
