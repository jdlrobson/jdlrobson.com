(function() {
var canvas = document.getElementById("c");
if(!canvas.getContext) {
	alert("please upgrade your browser... please!!!");
}
var w = window.innerWidth;
var h = window.innerHeight;
var halfw = w / 2;
var halfh = h / 2;
canvas.width = w;
canvas.height = h;
var RADIAN = Math.PI / 360;
var COLOR_CHANGE = 10;
var DOWN_RATIO = 0.97;
var REPEL_STATE_RATIO = 1.15;
var UP_RATIO = 1.03;
var middle = {x : halfw, y: halfh};
var allObjects = [];
function random(x, integer) {
	var r = Math.random() * x;
	if(r < 1) {
		r = 1;
	}
	return integer ? Math.round(r) : parseFloat(r);
}
canvas.onClick = function(ev) {
	var i = random(allObjects.length);
	morph(allObjects[i]);
};

function randomColor() {
	return {r: random(255, true), g:random(255, true), b: random(255, true)};
}

function morph(obj) {
	var choice = random(10, true);
	var speedupOn = false;
	if(obj.d < 10) {
		obj._flagged = true;
	} else if(obj.d < halfw / 2) {
		speedupOn = true;
	} else if(obj.d < halfw) {
		speedupOn = false;
	}
	if(obj._flagged) { // flag the repel state
		obj.d *= REPEL_STATE_RATIO;
		//obj.v *= 1.5;
		choice = 0;
		if(obj.d > halfw) {
			obj._flagged = false;
		}
	}
	if(choice == 1) {
		obj.d *= DOWN_RATIO;
	} else if(choice == 3) {
		obj.r *= DOWN_RATIO;
	} else if(choice == 4) {
		obj.r *= UP_RATIO;
	} else if(choice == 5) {
		obj.f.r += COLOR_CHANGE;
		obj.f.g += COLOR_CHANGE;
		obj.f.b += COLOR_CHANGE;
	} else if(choice == 6) {
		obj.f.r -= COLOR_CHANGE;
		obj.f.g -= COLOR_CHANGE
		obj.f.b -= COLOR_CHANGE;
	} else if(choice == 7 && speedupOn) {
		obj.v *= UP_RATIO;
	} else if(choice == 8 && !speedupOn) {
		obj.v *= DOWN_RATIO;
	}
	return obj;
}

function animate() {
	var newObjects = [];
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "black";
	ctx.strokeStyle = "white";
	ctx.fillRect(0, 0, w, h);
	for(var i=0; i < allObjects.length; i++) {
		var obj = allObjects[i];
		var p = {};
		obj.a += (obj.v * RADIAN);
		morph(obj);
		if(!obj.s) {
			p.x = middle.x - (obj.d * Math.cos(obj.a));// - Math.asin(obj.a / obj.d)// - middle.x;
			p.y =  middle.y - (obj.d * Math.sin(obj.a));
		} else {
			p = middle;
		}
		var color = obj.f;
		ctx.fillStyle = "rgb("+color.r+","+color.g+","+color.b+")";
		ctx.beginPath(); 
		ctx.arc(p.x, p.y, obj.r, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		newObjects.push(obj);
	}
	allObjects = newObjects;
}
function createBody(options) {
	// width, height, gravity
	options.r = random(40, true); // radius
	options.d = 1; //random(w / 2); // distance from sun.
	options.a = random(2 * Math.PI);
	options.v = random(10); // velocity
	if(options.s) {
		options.f = {r: 255, g: 255, b: 0};
		options.r = 20;
	} else {
		options.f = randomColor();
	}
	allObjects.push(options);
}
for(var i=0; i < 100; i++){
	createBody({});
}
createBody({s: true}); // create sun
window.setInterval(animate, 50);
} () );

