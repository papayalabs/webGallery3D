

	var models = ['galleryboxV1.json', 'image1l.json', 'image2.json'];	
	var cnt = 0;
	var rootPath = "../../app/models/room1/";
	
	function isString(o) {
		return typeof o == "string" || (typeof o == "object" && o.constructor === String);
	};
	
	var imageTest = function (url) 
	{		
		var http = new XMLHttpRequest();
		http.open('HEAD', url, false);
		http.send();
		return http.status!=404;
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
		
	QUnit.start();
	
	QUnit.test("Check texture-files on json-models", function(assert) {
		var done = assert.async();
		models.forEach(function(m) {
		
			console.log('loading ' + m);
		
			$.getJSON(rootPath + m, function(json) {
			
				cnt++;	
				console.log(cnt + ': ' + m + ' loaded.');
				
				assert.ok(json != undefined, m + " was loaded.");	
				
				findFile(json.materials, function(file) {
					var result = imageTest(rootPath + file)					
					assert.ok(result, rootPath + file + ' --> exists.');
				});
											
				if(cnt == models.length)
				{
					console.log('execute done');
					done();
				}
			})		
			.fail(function() {
				assert.ok(false, 'jQuery error');
				//console.log( "error" );
			});
			
		});
	});
