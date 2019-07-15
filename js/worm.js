var g;	
var canvas;
var width = window.innerWidth ;
var height =  window.innerHeight ;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseX = 0;
var mouseY = 0;	
var pmouseX = 0;
var pmouseY = 0;
var mousePressed = false;
var drawRate = 6;
var frameCount = 0;

var PI = Math.PI;
var TWO_PI = 2*Math.PI;
var HALF_PI = Math.PI*0.5;

function init(){
	canvas = document.getElementById('canvas');			
	canvas.width = width;				
	canvas.height = height;	
					
	g = canvas.getContext('2d');		
	g.setTransform(1, 0, 0, 1, 0,0);				
	document.addEventListener('mousemove', onDocumentMouseMove, false);								
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);			    
	document.addEventListener('keydown', onDocumentKeyDown, false);			    
	setup();
	drawInternal();			
}

function windowResize(){
//				width = window.innerWidth ;
//				height = window.innerHeight ;				
//				canvas.width = width;
//				canvas.height = height;
	g.setTransform(1, 0, 0, 1, 0,0);				
}

function onDocumentMouseMove(event) {
	mouseX = event.clientX - canvas.offsetLeft;
	mouseY = event.clientY - canvas.offsetTop;					    
}		

function onDocumentMouseDown(event) {
	if(event.which==2){
	mousePressed = true;		
	mousePressedEvent();
	}
}				

function onDocumentMouseUp(event) {
	mousePressed = false;			
}		

function onDocumentKeyDown(event){
	//setup();
}

function drawInternal(){				
	draw();
	setTimeout('drawInternal()', drawRate);			
	pmouseX = mouseX;
	pmouseY = mouseY;		
	frameCount++;
}

function clear(){
	g.clearRect(0,0,width,height);			
}

function line(x1, y1, x2, y2){
	g.beginPath();
	g.moveTo(x1,y1);
	g.lineTo(x2,y2);
	g.closePath();
	g.stroke();
}

function fillStrokeCircle(x,y,radius){
	if(radius<=0)
		radius = 0;
	g.beginPath();					
	g.arc(x, y, radius, 0, TWO_PI, true);
	g.closePath();
	g.fill();	
	g.stroke();
}

function fillCircle(x, y, radius){
	if(radius<=0)
		radius = 0;
	g.beginPath();					
	g.arc(x, y, radius, 0, TWO_PI, true);
	g.closePath();				
	g.fill();				
}

function strokeCircle(x, y, radius){
	if(radius<=0)
		radius = 0;
	g.beginPath();					
	g.arc(x,y, radius, 0, TWO_PI, true);
	g.stroke();							
}

function dist(ax, ay, bx, by) {
	var dx = bx - ax;
	dy = by - ay;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}		


var currentRandom = Math.random;

// Pseudo-random generator
function Marsaglia(i1, i2) {
  // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
  var z=i1 || 362436069, w= i2 || 521288629;
  var nextInt = function() {
	z=(36969*(z&65535)+(z>>>16)) & 0xFFFFFFFF;
	w=(18000*(w&65535)+(w>>>16)) & 0xFFFFFFFF;
	return (((z&0xFFFF)<<16) | (w&0xFFFF)) & 0xFFFFFFFF;
  };
 
  this.nextDouble = function() {
	var i = nextInt() / 4294967296;
	return i < 0 ? 1 + i : i;
  };
  this.nextInt = nextInt;
}
Marsaglia.createRandomized = function() {
  var now = new Date();
  return new Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF);
};		

// Noise functions and helpers
function PerlinNoise(seed) {
  var rnd = seed !== undefined ? new Marsaglia(seed) : Marsaglia.createRandomized();
  var i, j;
  // http://www.noisemachine.com/talk1/17b.html
  // http://mrl.nyu.edu/~perlin/noise/
  // generate permutation
  var p = new Array(512); 
  for(i=0;i<256;++i) { p[i] = i; }
  for(i=0;i<256;++i) { var t = p[j = rnd.nextInt() & 0xFF]; p[j] = p[i]; p[i] = t; }

  // copy to avoid taking mod in p[0];
  for(i=0;i<256;++i) { p[i + 256] = p[i]; } 
  
  function grad3d(i,x,y,z) {        
	var h = i & 15; // convert into 12 gradient directions
	var u = h<8 ? x : y,                 
		v = h<4 ? y : h===12||h===14 ? x : z;
	return ((h&1) === 0 ? u : -u) + ((h&2) === 0 ? v : -v);
  }

  function grad2d(i,x,y) { 
	var v = (i & 1) === 0 ? x : y;
	return (i&2) === 0 ? -v : v;
  }
  
  function grad1d(i,x) { 
	return (i&1) === 0 ? -x : x;
  }
  
  function lerp(t,a,b) { return a + t * (b - a); }
	
  this.noise3d = function(x, y, z) {
	var X = Math.floor(x)&255, Y = Math.floor(y)&255, Z = Math.floor(z)&255;
	x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
	var fx = (3-2*x)*x*x, fy = (3-2*y)*y*y, fz = (3-2*z)*z*z;
	var p0 = p[X]+Y, p00 = p[p0] + Z, p01 = p[p0 + 1] + Z, p1  = p[X + 1] + Y, p10 = p[p1] + Z, p11 = p[p1 + 1] + Z;
	return lerp(fz, 
	  lerp(fy, lerp(fx, grad3d(p[p00], x, y, z), grad3d(p[p10], x-1, y, z)),
			   lerp(fx, grad3d(p[p01], x, y-1, z), grad3d(p[p11], x-1, y-1,z))),
	  lerp(fy, lerp(fx, grad3d(p[p00 + 1], x, y, z-1), grad3d(p[p10 + 1], x-1, y, z-1)),
			   lerp(fx, grad3d(p[p01 + 1], x, y-1, z-1), grad3d(p[p11 + 1], x-1, y-1,z-1))));
  };
  
  this.noise2d = function(x, y) {
	var X = Math.floor(x)&255, Y = Math.floor(y)&255;
	x -= Math.floor(x); y -= Math.floor(y);
	var fx = (3-2*x)*x*x, fy = (3-2*y)*y*y;
	var p0 = p[X]+Y, p1  = p[X + 1] + Y;
	return lerp(fy, 
	  lerp(fx, grad2d(p[p0], x, y), grad2d(p[p1], x-1, y)),
	  lerp(fx, grad2d(p[p0 + 1], x, y-1), grad2d(p[p1 + 1], x-1, y-1)));
  };

  this.noise1d = function(x) {
	var X = Math.floor(x)&255;
	x -= Math.floor(x);
	var fx = (3-2*x)*x*x;
	return lerp(fx, grad1d(p[X], x), grad1d(p[X+1], x-1));
  };
}

//	these are lifted from Processing.js
// processing defaults
var noiseProfile = { generator: undefined, octaves: 4, fallout: 0.5, seed: undefined};

function noise(x, y, z) {
  if(noiseProfile.generator === undefined) {
	// caching
	noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
  }
  var generator = noiseProfile.generator;
  var effect = 1, k = 1, sum = 0;
  for(var i=0; i<noiseProfile.octaves; ++i) {
	effect *= noiseProfile.fallout;        
	switch (arguments.length) {
	case 1:
	  sum += effect * (1 + generator.noise1d(k*x))/2; break;
	case 2:
	  sum += effect * (1 + generator.noise2d(k*x, k*y))/2; break;
	case 3:
	  sum += effect * (1 + generator.noise3d(k*x, k*y, k*z))/2; break;
	}
	k *= 2;
  }
  return sum;
};					


function Worm(x,y){
	this.x = x;
	this.y = y;
	this.lx = x;
	this.ly = y;
	this.heading = Math.sin(frameCount*0.083) * PI;;
	this.rotation = Math.random() * (PI / (Math.random() * 70));
	this.rate = 0;
	this.maxLength = 15 + (noise(frameCount * 0.0025, frameCount*0.1) * 15);
	this.detail = 2;
	this.thickness = 3;
	this.thicknessTarget = 5 + Math.random() * 10;
	
	var cIndex = parseInt( Math.random() * colors.length );
	this.c = colors[cIndex];
	this.life = 30 + Math.random() * 120;
	this.segments = new Array();
	this.ooo = true;
	this.counter = noise(frameCount * 0.1, frameCount*.1);			
	
	this.update = function(){
		this.life--;
		if(this.life > 0){
			this.thickness += (this.thicknessTarget-this.thickness) * 0.1;
			this.thickness += 0.1;
			if(this.thickness > this.thicknessTarget)
				this.thickness = this.thicknessTarget;
			this.heading += this.rotation;
			this.rate = Math.cos( this.counter / 200.0) * (10 + noise(frameCount*0.05) * 10);
			this.rotation = Math.sin(this.counter/this.rate) * (this.segments.length+1) * 0.010;
			this.counter++;
			
			var speedMod = (this.segments.length * this.segments.length * this.segments.length) * 0.0015 * this.thickness / this.thicknessTarget;
			var totalSpeed = (this.detail + speedMod);
			var nx = Math.cos(this.heading) * totalSpeed;
			var ny = Math.sin(this.heading) * totalSpeed;
			this.walk(nx,ny);
		}
		else{
			if(this.segments.length > 1){
				this.segments.pop();
			}
			else{
				this.thickness*=0.95;
				this.thickness-=0.2;
				if(this.thickness<0.1)
					this.ooo = true;
				return;
			}
		}
		
		this.ooo = true;
		for(var i=0; i<this.segments.length; i++){
			var segment = this.segments[i];
			if(segment.ooo() == false){
				this.ooo = false;
				break;
			}
		}									
	}
	
	this.walk = function(nx,ny){
		this.lx = this.x;
		this.ly = this.y;
		this.x += nx;
		this.y += ny;
		var newSegment = new Segment(this.lx,this.ly,this.x,this.y,this.thickness);
		this.segments.unshift(newSegment);
		
		if(this.segments.length > 1)
			this.segments[this.segments.length-1].smoothAgainst(this.segments[this.segments.length-2]);
		
		if(this.segments.length >= this.maxLength){
			this.segments.pop();
		}
		
	}
}

function Segment(x1,y1,x2,y2,thickness){
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.thickness = thickness;
	
	var angle = Math.atan2(y2-y1,x2-x1);
	
	this.lAngle = angle - HALF_PI;
	var lDeltaX = Math.cos(this.lAngle) * thickness;
	var lDeltaY = Math.sin(this.lAngle) * thickness;
	this.leftX1 = x1 + lDeltaX;
	this.leftY1 = y1 + lDeltaY;
	this.leftX2 = x2 + lDeltaX;
	this.leftY2 = y2 + lDeltaY;
	
	this.rAngle = angle + HALF_PI;
	var rDeltaX = Math.cos(this.rAngle) * thickness;
	var rDeltaY = Math.sin(this.rAngle) * thickness;
	this.rightX1 = x1 + rDeltaX;
	this.rightY1 = y1 + rDeltaY;
	this.rightX2 = x2 + rDeltaX;
	this.rightY2 = y2 + rDeltaY;
	
	this.smoothAgainst = function(last){
		this.leftX1 = last.leftX2 = (last.leftX2 + this.leftX1) * 0.5;
		this.leftY1 = last.leftY2 = (last.leftY2 + this.leftY1) * 0.5;
		this.rightX1 = last.rightX2 = (last.rightX2 + this.rightX1) * 0.5;
		this.rightY1 = last.rightY2 = (last.rightY2 + this.rightY1) * 0.5;
	}
	
	this.ooo = function(){
		if(this.x1 < 0 || this.y1 < 0 || this.x1 > width || this.y1>height ||
		   this.x2 < 0 || this.y2 < 0 || this.x2 > width || this.y2>height)
		  return true;
		else
		  return false;				
	}
}

var worms;
var colors = [];
colors[0] = '#2cd9fe';
colors[1] = '#2cfecf';
colors[2] = '#373fdf';
colors[3] = '#88fe1f';
colors[4] = '#48d6ff';
colors[5] = '#b3fcff';
colors[6] = '#f76cad';
colors[7] = '#505083';
colors[8] = '#113a7e';
colors[9] = '#014050';
colors[10] = '#ccf3ef';
colors[11] = '#009437';
colors[12] = '#8fb300';


function setup(){
	worms = new Array();
}

function draw(){
	clear();
	
	
	for(var w=0; w<worms.length; w++){
		var worm = worms[w];
		worm.update();
		g.fillStyle = worm.c;
		
		g.lineWidth = 2;
		g.strokeStyle = '#ffffff';					
		if(worm.segments.length>1){					
			g.beginPath();
			g.moveTo(worm.segments[0].leftX1, worm.segments[0].leftY1);						
			for(var i=0; i<worm.segments.length; i++){
				var segment = worm.segments[i];
				g.lineTo(segment.leftX1,segment.leftY1);
			}
			g.lineTo(worm.segments[worm.segments.length-1].rightX1, worm.segments[worm.segments.length-1].rightY1);
			for(var i=worm.segments.length-1; i>=0; i--){
				var segment = worm.segments[i];
				g.lineTo(segment.rightX1,segment.rightY1);
			}
			g.closePath();
//						g.stroke();
			g.fill();
			g.stroke();
		}		
		
		g.strokeStyle = '#ffffff';
		if(worm.segments.length>=1){
			var x = worm.segments[0].x1;
			var y = worm.segments[0].y1;	
			var thickness = worm.segments[0].thickness;
			if(worm.thickness<thickness)
				thickness = worm.thickness;
			if(thickness<=0)
				thickness = 0.000001;							
			g.beginPath();
			g.arc(x, y, thickness, worm.segments[0].lAngle, worm.segments[0].rAngle, false);
			g.closePath();
			//g.fill();
			g.stroke();
			
			var xEnd = worm.segments[worm.segments.length-1].x1;
			var yEnd = worm.segments[worm.segments.length-1].y1;
			thickness = worm.segments[worm.segments.length-1].thickness;
			if(worm.thickness<thickness)
				thickness = worm.thickness;						
			if(thickness<=0)
				thickness = 0.000001;						
			g.beginPath();
			g.arc(xEnd, yEnd, thickness, worm.segments[worm.segments.length-1].lAngle, worm.segments[worm.segments.length-1].rAngle, true);
			g.closePath();
			//g.fill();
			g.stroke();		
													
			thickness = worm.thickness-0.6;	
			if(worm.thickness<thickness)
				thickness = worm.thickness;							
			fillCircle(worm.segments[0].x1,worm.segments[0].y1,thickness);    
			thickness = worm.segments[worm.segments.length-1].thickness-0.6;							
			if(worm.thickness<thickness)
				thickness = worm.thickness;							
			fillCircle(worm.segments[worm.segments.length-1].x1,worm.segments[worm.segments.length-1].y1,thickness);    							
			
			if(worm.life>0){
				g.fillStyle = "#FFFFFF";
				fillCircle(worm.segments[0].x1,worm.segments[0].y1,thickness * 0.72);    
			}
		}					
	}		
	
	for(var w=0; w<worms.length; w++){
		var worm = worms[w];
		if(worm.ooo){
			worms.splice(w,1);
			w--;
		}				
	}
	
	if(frameCount %2 ==0 && mousePressed && worms.length < 50){
		var direction = Math.atan2(pmouseY-mouseY, pmouseX-mouseX) + PI;
		var newWorm = new Worm(mouseX,mouseY);
		worms.push( newWorm );
		if(mouseX!=pmouseX && mouseY!=pmouseY)
			newWorm.heading = direction;
	}
	
}

function mousePressedEvent(){
}
