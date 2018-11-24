var projections = {
	globe: {
		name: 'globe', 
		fn: function(render, pos) {
			var options = render.options;
			var radius = options.radius;
			var angle = options.angle;
			var x = pos.x + angle.x;
			var y = pos.y + angle.y;
			if(!radius || !x || !y) {
				return {x: x, y: y};
			}
			var res = {};
			var longitude = (x * Math.PI) / 180.0;
			var latitude = (y * Math.PI) / 180.0;
			longitude = longitude % 6.28318531; //360 degrees				
			res.y = (radius.y) * Math.sin(latitude);	

			if(longitude < 1.57079633 || longitude > 4.71238898) {// 0-90 (right) or 270-360 (left) then on other side 
				res.x = (radius.x) * Math.cos(latitude) * Math.sin(longitude);		
			} else {
				res.x = false;
			}
			return res;
		}
	},
	normal: {
		name: "normal",
		fn: function(render, pos) {
			return pos;
		}
	}
};
var globalOptions = {
	width: 500,
	height: 500,
	radius: {},
	seaColor: "#204a99",
	stroke: "#cccccc", 
	fill: '#cca64f',
	lineWidth: "0.8",
	projection: projections.globe,
	scale: {x: 1, y: 1},
	translate: {x:0, y:0},
	angle: {x: 0, y: 0},
	lineCap: "butt",
	lineJoin: "round"
};

function canvasMap(geojson,options) {
	var el = document.getElementById("map");
	var ctx = el.getContext('2d');
	this.options = options || globalOptions;
	var h = this.options.height;
	var w = this.options.width;
	this.options.radius.x = w / 2 - 50;
	this.options.radius.y = h / 2 - 50;
	el.setAttribute("height", h);
	el.setAttribute("width", w);
	this.render();
}

canvasMap.prototype = {
	render: function() {
		this._commands = [];
		var el = document.getElementById("map");
		var ctx = el.getContext('2d');
		var options = this.options;
		var h = options.height;
		var w = options.width;
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, w, h);
		ctx.lineWidth = options.lineWidth;
		ctx.lineCap = options.lineCap;
		ctx.lineJoin = options.lineJoin;
		this.rendergeojson(ctx, geojson);
	},
	rendergeojson: function(ctx, geojson) {
		var options = this.options;
		ctx.save();
		ctx.translate(options.width / 2, options.height / 2); //the center of the world is at 0,0
		ctx.translate(options.translate.x, options.translate.y);
		ctx.scale(options.scale.x,options.scale.y);

		if(options.projection.name == 'globe') {
			
			ctx.arc(0, 0, options.radius.x, 0, Math.PI*2, true);
			var fill = options.seaColor;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			//ctx.shadowBlur = 130;
			//ctx.shadowColor = "#ffffff";
			ctx.fillStyle = fill;
			ctx.fill();
ctx.shadowBlur = 0;
		}
		var features = geojson.features;
		for(var i=0; i < features.length; i++) {
			var feature = features[i];
			if(feature.type == 'Feature') {
				this.renderFeature(ctx, feature);
			}
		}
		ctx.restore();
	},
	renderFeature: function(ctx, feature) {
		var geometry = feature.geometry;
		var options = this.options;
		var geometryType = geometry.type;
		var properties = feature.properties;
		ctx.fillStyle = properties.fill || options.fill;
		if(geometryType == "MultiPolygon") {
			this.renderMultiPolygonFeature(ctx, feature);
		}
	},
	renderMultiPolygonFeature: function(ctx, feature) {
		var geometry = feature.geometry;
		var projection = this.options.projection;
		var projectionFn = false;
		if(projection) {
			projectionFn = projection.fn;
		}
		for(var i = 0; i < geometry.coordinates.length; i++) {
			var shapes = geometry.coordinates[i];
			for(var j = 0; j < shapes.length; j++) {
				var shape = shapes[j];
				var pathStart = false;
				ctx.beginPath();
				for(var k = 0; k < shape.length; k++) {
					var coords = shape[k];
					var pos = {x: coords[0], y: -coords[1]};
					if(projectionFn) {
						var newpos = projectionFn(this, pos);
						pos = newpos;
					}
					if(pos.x && pos.y) {
						if(!pathStart) {
							pathStart = {x: pos.x, y: pos.y};
							ctx.moveTo(pos.x,pos.y);
						} else {
							ctx.lineTo(pos.x,pos.y);
						}
					}
				}
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
	}
};
