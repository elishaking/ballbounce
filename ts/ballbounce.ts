/*
MIT License

Copyright (c) 2017 elishaking
*/

var canvas = document.querySelector('canvas');
/*context*/
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LEVEL = 1;

var colors: string[] = [
	'#0D0D0D',
	'#404040',
	'#A6A6A6',
	'#737373',
	'#D9D9D9'
];

var scoreDiv: HTMLElement = document.getElementById('score-div');
var scoreSpan: HTMLElement = document.getElementById('score');
var score: number = 0;

var space: boolean = false;
var gameStarted: boolean = false;

window.addEventListener('resize', function(event){
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	intro();
});

window.addEventListener('keyup', function(event){
	if (event.keyCode == 32) {
		space = false;
	}
});

window.addEventListener('keydown', function(event){
	if (event.keyCode == 32) {
		space = true;
		if(!gameStarted)
			gameStarted = true;
	}
});

/* Touch Screen devices */
document.body.addEventListener('touchend', function(event){
	space = false;
});
document.body.addEventListener('touchstart', function(event){
	space = true;
});

function randRange(a: number, b: number): number{
	return Math.random() * (b - a) + a;
}

function randRangeInt(a: number, b: number): number{
	return Math.floor(randRange(a, b));
}

var scale: number = 1.1;
class Mountain{

    color: string;
    x: number;
    y: number;
    base: number;
	height: number;
	heightInitial: number;
    
    constructor(private c: CanvasRenderingContext2D,
         x: number, y: number, 
         base: number, height: number, 
         private dx: number){
		this.x = x;
		this.y = y;
		this.base = base;
		this.height = scale*height;
		this.heightInitial = this.height;
        this.color = colors[randRangeInt(0, 3)];
    }

	draw(): void{
		this.c.beginPath();
		this.c.moveTo(this.x, this.y);
		this.c.lineTo(this.x + this.base/2, this.y + this.height);
		this.c.lineTo(this.x + this.base, this.y);
		this.c.closePath();
		this.c.fillStyle = this.color;
		this.c.fill();
	}

	growthRate: number = 1;
	update(): void{
		this.draw();
		if(LEVEL == 1){
			if(this.height >= this.heightInitial*1.3 || this.height <= this.heightInitial/3){
				this.growthRate *= -1;
			}
			this.height += this.growthRate;
		}

		this.x += this.dx;
	}

	checkY(ballX): number{
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

var g: number = 0.5;
var gravity: number;

class Ball{

    color: string;

    constructor(private c : CanvasRenderingContext2D, 
        private x: number, private y: number, 
        private dx: number, private dy: number, 
        private radius: number){
        this.color = 'black';
    }

	draw(): void{
		this.c.beginPath();
		this.c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		this.c.fillStyle = this.color;
		this.c.fill();
		this.c.closePath(); //why
	}

	update(space: boolean): void{
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
    
    isCollided(mountain: Mountain): boolean{
        if((this.x + this.radius) > mountain.x && (this.x + this.radius) < (mountain.x + mountain.base)){
            if(mountain.height < 0){
                //console.log(mountain.checkY(ball.x + ball.radius));
                return (this.y + this.radius) > innerHeight - mountain.checkY(this.x + this.radius) && (this.y + this.radius) < mountain.y;
            } else {
                //console.log(mountain.checkY(ball.x + ball.radius));
                return (this.y + this.radius) < mountain.checkY(this.x + this.radius) && (this.y + this.radius) > mountain.y;
            }
        }
        if(this.y + this.radius > canvas.height || this.y - this.radius < 0){
            return true;
        }
        return false;
    }
}

function addMountain(x, y, base, height, mountains: Mountain[] = null){
	if(mountains){
		mountains.push(new Mountain(c, x, y, base, height, -3));
	} else{
		var m = new Mountain(c, x, y, base, height, 0);
		m.update();
	}
}

function createMountains(offset: number, nMountains: number, mountains: Mountain[] = null): void{
	var base = randRangeInt(100, 200);
	var threshold = (canvas.height/4.75 + canvas.height/2.375) / 2;
	for(var i = offset; i < nMountains + offset; i++){
		var mountainSpacing = base;//randRangeInt(100, 150);
		var x = i * mountainSpacing;
		var y = 0; //i % 2 == 0 ? 0 : canvas.height;
		var height = randRangeInt(canvas.height/4.75, canvas.height/2.375); //y == 0 ? randRangeInt(canvas.height/4.75, canvas.height/2.375) : -randRangeInt(canvas.height/4.75, canvas.height/1.9);
		addMountain(x, y, base, height, mountains);

		y = canvas.height;
		height = height > threshold ? -randRangeInt(canvas.height/9.5, canvas.height/4.75) : -randRangeInt(canvas.height/4.75, canvas.height/2.375);
		addMountain(x, y, base, height, mountains);
		base = randRangeInt(100, 200);
	}
}

function intro(): void{
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

/* GAME START */
document.getElementById('play').addEventListener('click', function(){
	document.getElementById('Info').setAttribute('style', 'display: none;');
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	canvas.setAttribute('style', 'background: #D9D9D9');

	if(scoreDiv.hasAttribute('style'))
        scoreDiv.removeAttribute('style');
    
	score = 0;
	scoreSpan.textContent = String(score);

	var mountains = [];
	var nMountains = 100;
	var offset = 5;
	createMountains(offset, nMountains, mountains);

	var ball = new Ball(c, canvas.width/3, canvas.height/2, 0, 0, 10);

	var frames = 0;
	function animate(): void{
		var animation = requestAnimationFrame(animate);
        
        if(gameStarted || frames == 0){
			c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas

            for(var i = 0; i < mountains.length; i++){
                if(ball.isCollided(mountains[i])){
                    cancelAnimationFrame(animation);
                    gameStarted = false;
                    intro();
                    return;
                }
            }

            ball.update(space);
            for(var i = 0; i < mountains.length; i++){
                mountains[i].update();
            }

            if(frames % 30 == 0){
                score++;
                scoreSpan.textContent = String(score);
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
	}

	animate();

});
