/*
MIT License

Copyright (c) 2017 elishaking
*/

var canvas = document.querySelector('canvas');
/*context*/
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var colors = [
	'#0D0D0D',
	'#404040',
	'#A6A6A6',
	'#737373',
	'#D9D9D9'
];

var scoreDiv = document.getElementById('score-div');
var scoreSpan = document.getElementById('score');
var score = 0;

var space = false;
var gameStarted = false;

/* Touch Screen devices */
document.body.addEventListener('touchend', function(event){
	space = false;
});
document.body.addEventListener('touchstart', function(event){
	space = true;
});

/* UTILITY Functions */
function randRange(a, b){
	return Math.random() * (b - a) + a;
}

function randRangeInt(a, b){
	return Math.floor(randRange(a, b));
}

var scale = 1.1;
function Mountain(x, y, base, height, dx){
	this.x = x;
	this.y = y;
	this.base = base;
	this.height = scale*height;
	this.dx = dx;
	this.color = colors[randRangeInt(0, 3)];

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

function createMountains(offset, nMountains, mountains){
	for(var i = offset; i < nMountains + offset; i++){
		var mountainSpacing = randRangeInt(100, 150);
		var x = i * mountainSpacing;
		var y = i % 2 == 0 ? 0 : canvas.height;
		var base = randRangeInt(100, 200);
		var height = y == 0 ? randRangeInt(canvas.height/4.75, canvas.height/2.375) : -randRangeInt(canvas.height/4.75, canvas.height/1.9);
		if(mountains){
			mountains.push(new Mountain(x, y, base, height, -3));
		} else{
			var m = new Mountain(x, y, base, height, 0);
			m.update();
		}
	}
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
	createMountains(0, 40);
}

intro();

window.addEventListener('resize', function(event){
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	intro();
});

/* GAME START */
document.getElementById('play').addEventListener('click', function(){
	document.getElementById('Info').setAttribute('style', 'display: none;');
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	canvas.setAttribute('style', 'background: #D9D9D9');

	if(scoreDiv.hasAttribute('style'))
		scoreDiv.removeAttribute('style');
	score = 0;
	scoreSpan.textContent = score;

	var mountains = [];
	var nMountains = 100;
	var offset = 5;
	createMountains(offset, nMountains, mountains);

	var ball = new Ball(canvas.width/3, canvas.height/2, 0, 0, 10);

	var frames = 0;
	function animate(){
		var animation = requestAnimationFrame(animate);
		c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas

		for(var i = 0; i < mountains.length; i++){
			if(isCollided(ball, mountains[i])){
				cancelAnimationFrame(animation);
				gameStarted = false;
				intro();
				return;
			}
		}

		ball.update();
		for(var i = 0; i < mountains.length; i++){
			mountains[i].update();
		}

		if(frames % 30 == 0){
			score++;
			scoreSpan.textContent = score;
		}

		frames++;
		if(frames % 400 == 0){
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

});

window.addEventListener('keyup', function(event){
	if (event.keyCode == 32) {
		space = false;
	}
});
window.addEventListener('keydown', function(event){
	if (event.keyCode == 32) {
		space = true;
		if(!gameStarted){
			gameStarted = true;
			animate();
		}
	}
});