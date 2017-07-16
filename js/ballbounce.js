/*
MIT License

Copyright (c) 2017 elishaking
*/

var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var colors = [
	'#0D0D0D',
	'#404040',
	'#D9D9D9',
	'#A6A6A6',
	'#737373'
];


/*context*/
var c = canvas.getContext('2d');

var space = false;
window.addEventListener('keyup', function(event){
	if (event.keyCode == 32) {
		space = false;
	}
});
window.addEventListener('keydown', function(event){
	if (event.keyCode == 32) {
		space = true;
		//console.log('space = ' + space);
	}
});

/* UTILITY Functions */
function randRangeInt(a, b){
	return Math.floor(Math.random() * (b - a) + a);
}

function Mountain(x, y, base, height, dx){
	this.x = x;
	this.y = y;
	this.base = base;
	this.height = height;
	this.dx = dx;
	this.color = colors[randRangeInt(0, 2)];

	this.draw = function(){
		c.beginPath();
		c.moveTo(this.x, this.y);
		c.lineTo(this.x + this.base/2, this.y + this.height);
		c.lineTo(this.x + this.base, this.y);
		c.closePath();
		c.fillStyle = this.color;
		c.fill();
	}

	this.update = function(){
		this.draw();

		this.x += this.dx;
	}

	this.checkY = function(ballX){
		var h = Math.abs(this.height);
		var m = h/(this.base/2);
		if(ballX < (this.x + this.base/2)){
			ballX -= this.x;
			return m*ballX;
		} else{
			ballX -= this.x + this.base/2;
			return (h - m*ballX);
		}
	}
}

var g = 0.5;
var gravity;
function Ball(x, y, dx, dy, radius){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.color = 'black';
	this.radius = radius;

	this.draw = function(){
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		c.fillStyle = this.color;
		c.fill();
		c.closePath(); //why
	}

	this.update = function(){
		this.draw();

		// SpaceBar Control
		gravity = space ? -g : g;

		/*if(this.y + this.dy + this.radius > innerHeight){
			this.dy = -this.dy * 0.5;
		} else {
			this.dy += gravity;
		}
		*/
		this.dy += gravity;

		this.x += this.dx;
		this.y += this.dy;
		
	}
}

function isCollided(ball, mountain){
	if((ball.x + ball.radius) > mountain.x && (ball.x + ball.radius) < (mountain.x + mountain.base)){
		if(mountain.height < 0){
			//console.log(mountain.checkY(ball.x + ball.radius));
			return (ball.y + ball.radius) > innerHeight - mountain.checkY(ball.x + ball.radius) && (ball.y + ball.radius) < mountain.y;
		} else {
			//console.log(mountain.checkY(ball.x + ball.radius));
			return (ball.y + ball.radius) < mountain.checkY(ball.x + ball.radius) && (ball.y + ball.radius) > mountain.y;
		}
	}
	if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0){
		return true;
	}
	return false;
}

function intro(){
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	var info = document.getElementById('Info');
	if(info.hasAttribute('style')){
		info.removeAttribute('style');
		document.getElementById('play').innerText = 'Replay';
		document.getElementById('collision').removeAttribute('style');
	}
	canvas.setAttribute('style', 'background: rgba(0, 0, 0, 0.87);');
	for(var i = 0; i < 40; i++){
		var mountainSpacing = randRangeInt(100, 150);
		var x = i * mountainSpacing;
		var y = i % 2 == 0 ? 0 : canvas.height;
		var base = randRangeInt(100, 200);
		var height = y == 0 ? randRangeInt(200, 400) : -randRangeInt(200, 500);
		var m = new Mountain(x, y, base, height, 0);
		m.update();
	}
}

intro();

document.getElementById('play').addEventListener('click', function(){
	document.getElementById('Info').setAttribute('style', 'display: none;');
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	canvas.setAttribute('style', 'background: #D9D9D9');

	var mountains = [];
	var nMountains = 100;
	var offset = 5;
	for(var i = offset; i < nMountains + offset; i++){
		var mountainSpacing = randRangeInt(100, 150);
		var x = i * mountainSpacing;
		var y = i % 2 == 0 ? 0 : canvas.height;
		var base = randRangeInt(100, 200);
		var height = y == 0 ? randRangeInt(200, 400) : -randRangeInt(200, 500);
		mountains.push(new Mountain(x, y, base, height, -3));
	}



	var ball = new Ball(canvas.width/3, canvas.height/2, 0, 0, 10);

	var frames = 0;
	function animate(){
		var animation = requestAnimationFrame(animate);
		c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas

		for(var i = 0; i < mountains.length; i++){
			if(isCollided(ball, mountains[i])){
				cancelAnimationFrame(animation);
				intro();
				return;
			}
		}

		ball.update();
		for(var i = 0; i < mountains.length; i++){
			mountains[i].update();
		}

		frames++;
		if(frames%400 == 0){
			var delta = 30;
			for(var i = 0; i < mountains.length; i++){
				if(mountains[i].x + mountains[i].base + delta < 0){
					mountains.splice(i, 1);
				}
			}
			//console.log(mountains.length);
		}
		//console.log(frames);
	}

	animate();
});