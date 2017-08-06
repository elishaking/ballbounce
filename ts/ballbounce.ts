/*
MIT License

Copyright (c) 2017 elishaking
*/

var canvas = document.querySelector('canvas');
/*context*/
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

class Circle{
	x: number;
	y: number;
	radius: number;
	dx: number;
	color: string;

	constructor(private c: CanvasRenderingContext2D, 
		x: number, y: number, radius: number){
		
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = 'white';
	}

	draw(){
		this.c.beginPath();
		this.c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		this.c.fillStyle = this.color;
		this.c.save();
		this.c.shadowColor = 'white';
		this.c.shadowBlur = 10;
		this.c.fill();
		this.c.restore();
	}

	update(){
		this.draw();
	}

	static drawCircles(nCircles: number, circles: Circle[]){
		var radius;
		for(var i = 0; i < nCircles; i++){
			radius = randRangeInt(3, 6);
			circles.push(new Circle(c, randRangeInt(0 + radius, canvas.width - radius), 
				randRangeInt(0 + radius, canvas.height/2 - radius), radius)
			);
		}
	}

}

class Ball{

	static g: number = 0.5;
	static gravity: number;

    color: string;

    constructor(private c : CanvasRenderingContext2D, 
        private x: number, private y: number, 
        private dx: number, private dy: number, 
        private radius: number){
		
        this.color = 'black';
	}

	getX(){
		return this.x;
	}

	draw(): void{
		this.c.beginPath();
		this.c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		this.c.fillStyle = this.color;
		this.c.fill();
		this.c.closePath(); //why
	}

	update(space: boolean): void{
		this.draw();

		// SpaceBar Control
		Ball.gravity = space ? -Ball.g : Ball.g;

		/*if(this.y + this.dy + this.radius > innerHeight){
			this.dy = -this.dy * 0.5;
		} else {
			this.dy += gravity;
		}
		*/
		this.dy += Ball.gravity;

		this.x += this.dx;
		this.y += this.dy;
	}
    
    pointCircleCollide(point, circle, r): boolean{
        if (r===0) return false;
        var dx = circle[0] - point[0];
        var dy = circle[1] - point[1];
        return dx * dx + dy * dy <= r * r;
    }

    lineCircleCollide(a, b, circle, radius, nearest=null): boolean{
        var tmp = [0, 0];
        //check to see if start or end points lie within circle 
        if (this.pointCircleCollide(a, circle, radius)) {
            if (nearest) {
                nearest[0] = a[0];
                nearest[1] = a[1];
            }
            return true
        } if (this.pointCircleCollide(b, circle, radius)) {
            if (nearest) {
                nearest[0] = b[0];
                nearest[1] = b[1];
            }
            return true
        }
        
        var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1];
        var cx = circle[0], cy = circle[1];

        //vector d
        var dx = x2 - x1;
        var dy = y2 - y1;
        
        //vector lc
        var lcx = cx - x1;
        var lcy = cy - y1;
        
        //project lc onto d, resulting in vector p
        var dLen2 = dx * dx + dy * dy; //len2 of d
        var px = dx;
        var py = dy;
        if (dLen2 > 0) {
            var dp = (lcx * dx + lcy * dy) / dLen2;
            px *= dp;
            py *= dp;
        }
        
        if (!nearest)
            nearest = tmp;
        nearest[0] = x1 + px;
        nearest[1] = y1 + py;
        
        //len2 of p
        var pLen2 = px * px + py * py;
        
        //check collision
        return this.pointCircleCollide(nearest, circle, radius)
                && pLen2 <= dLen2 && (px * dx + py * dy) >= 0;
    }

    pointInTriangle(point, triangle): boolean {
        //compute vectors & dot products
        var cx = point[0], cy = point[1],
            t0 = triangle[0], t1 = triangle[1], t2 = triangle[2],
            v0x = t2[0]-t0[0], v0y = t2[1]-t0[1],
            v1x = t1[0]-t0[0], v1y = t1[1]-t0[1],
            v2x = cx-t0[0], v2y = cy-t0[1],
            dot00 = v0x*v0x + v0y*v0y,
            dot01 = v0x*v1x + v0y*v1y,
            dot02 = v0x*v2x + v0y*v2y,
            dot11 = v1x*v1x + v1y*v1y,
            dot12 = v1x*v2x + v1y*v2y

        // Compute barycentric coordinates
        var b = (dot00 * dot11 - dot01 * dot01),
            inv = b === 0 ? 0 : (1 / b),
            u = (dot11*dot02 - dot01*dot12) * inv,
            v = (dot00*dot12 - dot01*dot02) * inv
        return u>=0 && v>=0 && (u+v < 1)
    }

    isCollided(mountain: Mountain): boolean{
        var circle = [this.x, this.y], triangle = mountain.getTriCoord(), radius = this.radius;
        if (this.pointInTriangle(circle, triangle))
            return true;
        if (this.lineCircleCollide(triangle[0], triangle[1], circle, radius))
            return true;
        if (this.lineCircleCollide(triangle[1], triangle[2], circle, radius))
            return true;
        if (this.lineCircleCollide(triangle[2], triangle[0], circle, radius))
            return true;
        return false;
    }
}

class ObstacleObject{
	draw(){

	}

	update(){

	}

	createObstacleObjects(): ObstacleObject[]{
		var nObjects = 100;
		var offset = 5;
		if(LEVEL == 1){
			return Mountain.createMountains(offset, nObjects, []);
		} else if(LEVEL == 2){
			return Tower.createTowers(offset, nObjects, []);
		}
	}
}

class Mountain extends ObstacleObject{

	static scale: number = 1.1;

    color: string;
    x: number;
    y: number;
    base: number;
	height: number;
	heightInitial: number;

	grow: boolean;
	growthRate: number;
    
    constructor(private c: CanvasRenderingContext2D,
         x: number, y: number, 
         base: number, height: number, 
		 private dx: number, 
		 grow: boolean = false,
		 private isEnd: boolean = false){

		super();

		this.x = x;
		this.y = y;
		this.base = base;
		this.height = Mountain.scale*height;
		this.heightInitial = this.height;

		this.grow = grow;
		this.growthRate = Math.sign(this.height);

        this.color = colors[randRangeInt(0, 3)];
    }

	draw(): void{
		this.c.beginPath();
        var x = this.x - this.base/2, y = this.y;
        this.c.moveTo(x, y);
        x += this.base/2, y -= this.height;
        this.c.lineTo(x, y);
        x += this.base/2, y += this.height;
        this.c.lineTo(x, y);
		this.c.closePath();

		var gradient = c.createLinearGradient(this.x, this.y - this.height, this.x, this.y);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, this.color);
		this.c.fillStyle = gradient;
		this.c.fill();
	}

	update(): void{
		this.draw();
		if(!this.isEnd && this.grow){
			if(Math.abs(this.height) >= Math.abs(this.heightInitial*1.3) || Math.abs(this.height) <= Math.abs(this.heightInitial/3)){
				this.growthRate *= -1;
			}
			this.height += this.growthRate;
		}

		this.x += this.dx;
	}

	getTriCoord(){
        var v1 = [this.x - this.base/2, this.y];
        var v2 = [this.x, this.y - this.height];
        var v3 = [this.x + this.base/2, this.y];
        return [v1, v2, v3];
    }

	static addMountain(x: number, y: number, base: number, height: number, grow: boolean, mountains: Mountain[] = null){
		if(mountains){
			mountains.push(new Mountain(c, x, y, base, height, -3, grow));
		} else{
			var m = new Mountain(c, x, y, base, height, 0);
			m.update();
		}
	}

	static createMountains(offset: number, 
		rangeX: [number, number], rangeY: [number, number],
		spacingY: number, nMountains: number, mountains: Mountain[] = null): Mountain[]{
		
		var x = mountains ? offset : 0, y = 0, 
		base = randRangeInt(rangeX[0], rangeX[1]), height = 0, 
		spacingX = base + randRangeInt(-50, 50);

		for(var i = 0; i < nMountains; i++){
			// BOTTOM
			y = canvas.height;
			height = randRangeInt(rangeY[0], rangeY[1]); //randRangeInt(canvas.height/4.5, canvas.height/1.5)
			Mountain.addMountain(x, y, base, height, false, mountains);

			// TOP
			y = 0;
			height = -(canvas.height - height - spacingY);
			Mountain.addMountain(x, y, base, height, false, mountains);

			x += spacingX;
			base = randRangeInt(rangeX[0], rangeX[1]); //randRangeInt(100, 200);
			spacingX = base + randRangeInt(-50, 50);
		}

		return mountains;
	}

	static createGrowingMountains(offset: number, nMountains: number, mountains: Mountain[] = null): Mountain[]{
		var x = canvas.width/2;
		var base = randRangeInt(100, 170);
		var mountainDist = canvas.height/10;
		for(var i = offset; i < nMountains + offset; i++){
			var y = 0; 
			var height = -randRangeInt(canvas.height/1.5, canvas.height/2.5);
			Mountain.addMountain(x, y, base, height, true, mountains);

			y = canvas.height;
			height = canvas.height - height - mountainDist;
			Mountain.addMountain(x, y, base, height, true, mountains);
			base = randRangeInt(100, 170);

			var towerSpacing = base + canvas.width/4;
			x += towerSpacing;
		}

		return mountains;
	}
}

class Tower extends ObstacleObject{

	x: number;
	y: number;
	width: number;
	height: number;
	color: string;

	constructor(private c: CanvasRenderingContext2D,
		x: number, y: number,
		width: number, height: number, 
		private dx: number, private isEnd: boolean = false){
		super();
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = colors[randRangeInt(0, 3)];
	}

	draw(){
		c.fillStyle = this.color;
		c.fillRect(this.x, this.y, this.width, this.height);
	}

	update(){
		this.draw();

		this.x += this.dx;
	}

	static addTower(x, y, width, height, towers: Tower[] = null){
		if(towers){
			towers.push(new Tower(c, x, y, width, height, -3));
		} else{
			var m = new Tower(c, x, y, width, height, 0);
			m.update();
		}
	}

	static createTowers(offset: number, nTowers: number, towers: Tower[] = null): Tower[]{
		var x = canvas.width/2;
		var width = randRangeInt(50, 70);
		var towerDist = canvas.height/10;
		for(var i = offset; i < nTowers + offset; i++){
			var y = 0; 
			var height = randRangeInt(canvas.height/1.5, canvas.height/2.5);
			Tower.addTower(x, y, width, height, towers);

			y = canvas.height;
			height = -(canvas.height - height - towerDist);
			Tower.addTower(x, y, width, height, towers);
			width = randRangeInt(50, 70);

			var towerSpacing = width + canvas.width/4;//randRangeInt(100, 150);
			x += towerSpacing;
		}

		return towers;
	}

}

var LEVEL = 1;
var LEVELS = [
	'Mountain Range',
	'Deadly Towers',
	'Active Mountains'
];
var levelFinished = false;

var STATUS_LIST = {
	'collision': 'FATAL ACCIDENT',
	'completed': 'Completed'
}

function intro(): void{
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	var info = document.getElementById('Info');
	if(info.hasAttribute('style')){
		info.removeAttribute('style');
		document.getElementById('level').innerText = LEVELS[LEVEL - 1];
		var status = document.getElementById('status');
		var playBtn = document.getElementById('play');
		if(levelFinished){
			status.innerText = STATUS_LIST['completed'] + " " + LEVELS[LEVEL - 2];
			levelFinished = false;
		}else{
			status.innerText = STATUS_LIST['collision'];
			playBtn.innerText = 'Replay';
		}
		document.getElementById('status').removeAttribute('style');
	}
	canvas.setAttribute('style', 'background: rgba(0, 0, 0, 0.87);');
	Mountain.createMountains(0, [100, 200], [canvas.height/4.5, canvas.height/1.5], canvas.height/2, 40);
}

intro();

/* GAME START */
document.getElementById('play').addEventListener('click', function(){
	document.getElementById('Info').setAttribute('style', 'display: none;');
	c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
	canvas.setAttribute('style', 'background: rgba(33, 33, 33, 0.91)');//#D9D9D9

	if(scoreDiv.hasAttribute('style'))
        scoreDiv.removeAttribute('style');
    
	score = 0;
	scoreSpan.textContent = String(score);

	var obstacleObjects = [];
	var nObjects = 10;
	var offset = canvas.width/2;
	var endObjects = [];
	var stars: Circle[] = [];
	if(LEVEL == 1){
		Mountain.createMountains(offset, [100, 200], [canvas.height/4.5, canvas.height/1.5], canvas.height/2, nObjects, obstacleObjects);
		var lastMountain: Mountain = obstacleObjects[nObjects*2 - 1];
		var endX = lastMountain.x + canvas.width/5, endHeight = canvas.height/2.5, endBase = canvas.width/10;
		endObjects[0] = new Mountain(c, endX, 0, endBase, -endHeight, -3, false, true);
		endObjects[1] = new Mountain(c, endX, canvas.height, endBase, endHeight, -3, false, true);
		Circle.drawCircles(100, stars);
	} else if(LEVEL == 2){
		Tower.createTowers(offset, nObjects, obstacleObjects);
		var lastTower: Tower = obstacleObjects[nObjects*2 - 1];
		var endX = lastTower.x + canvas.width/2, endHeight = canvas.height/2.5, endWidth = canvas.width/20;
		endObjects[0] = new Tower(c, endX, 0, endWidth, endHeight, -3, true);
		endObjects[1] = new Tower(c, endX, canvas.height, endWidth, -endHeight, -3, true);
	} else if (LEVEL == 3){
		Mountain.createGrowingMountains(offset, nObjects, obstacleObjects);
		var lastMountain: Mountain = obstacleObjects[nObjects*2 - 1];
		var endX = lastMountain.x + canvas.width/5, endHeight = canvas.height/2.5, endBase = canvas.width/10;
		endObjects[0] = new Mountain(c, endX, 0, endBase, -endHeight, -3, true);
		endObjects[1] = new Mountain(c, endX, canvas.height, endBase, endHeight, -3, true);
	}

	var ball = new Ball(c, canvas.width/3, canvas.height/2, 0, 0, 10);

	var frames = 0;
	function animate(): void{
		var animation = requestAnimationFrame(animate);
        
        if(gameStarted || frames == 0){
			c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas

            for(var i = 0; i < obstacleObjects.length; i++){
                if(ball.isCollided(obstacleObjects[i])){
                    cancelAnimationFrame(animation);
					gameStarted = false;
                    intro();
                    return;
                }
			}
			for(var i = 0; i < endObjects.length; i++){
                if(ball.isCollided(endObjects[i])){
                    cancelAnimationFrame(animation);
					gameStarted = false;
                    intro();
                    return;
                }
			}

			if(ball.getX() >= endObjects[0].x){
				cancelAnimationFrame(animation);
				gameStarted = false;
				levelFinished = true;
				LEVEL++;
				intro();
				return;
			}

			for(var i = 0; i < 30; i++){
				stars[i].update();
			}
			ball.update(space);
            for(var i = 0; i < obstacleObjects.length; i++){
                obstacleObjects[i].update();
			}
			endObjects[0].update();
			endObjects[1].update();

            if(frames % 30 == 0){
                score++;
                scoreSpan.textContent = String(score);
			}
			
			frames++;

			// reduce number of obstacles in array
            // if(frames % 400 == 0){
            //     var delta = 30;
            //     for(var i = 0; i < mountains.length; i++){
            //         if(mountains[i].x + mountains[i].base + delta < 0){
            //             mountains.splice(i, 1);
            //         }
            //     }
            //     //console.log(mountains.length);
            // }
            //console.log(frames);
        }
	}

	animate();

});
