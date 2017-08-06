var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
window.addEventListener('resize', function (event) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    intro();
});
window.addEventListener('keyup', function (event) {
    if (event.keyCode == 32) {
        space = false;
    }
});
window.addEventListener('keydown', function (event) {
    if (event.keyCode == 32) {
        space = true;
        if (!gameStarted)
            gameStarted = true;
    }
});
/* Touch Screen devices */
document.body.addEventListener('touchend', function (event) {
    space = false;
});
document.body.addEventListener('touchstart', function (event) {
    space = true;
});
function randRange(a, b) {
    return Math.random() * (b - a) + a;
}
function randRangeInt(a, b) {
    return Math.floor(randRange(a, b));
}
var Circle = (function () {
    function Circle(c, x, y, radius) {
        this.c = c;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = 'white';
    }
    Circle.prototype.draw = function () {
        this.c.beginPath();
        this.c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.c.fillStyle = this.color;
        this.c.save();
        this.c.shadowColor = 'white';
        this.c.shadowBlur = 10;
        // this.c.shadowOffsetX = 15;
        // this.c.shadowOffsetY = 15;
        this.c.fill();
        this.c.restore();
    };
    Circle.prototype.update = function () {
        this.draw();
    };
    Circle.drawCircles = function (nCircles, circles) {
        var radius;
        for (var i = 0; i < nCircles; i++) {
            radius = randRangeInt(3, 6);
            circles.push(new Circle(c, randRangeInt(0 + radius, canvas.width - radius), randRangeInt(0 + radius, canvas.height / 2 - radius), radius));
        }
    };
    return Circle;
}());
var Ball = (function () {
    function Ball(c, x, y, dx, dy, radius) {
        this.c = c;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = 'black';
    }
    Ball.prototype.getX = function () {
        return this.x;
    };
    Ball.prototype.draw = function () {
        this.c.beginPath();
        this.c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.c.fillStyle = this.color;
        this.c.fill();
        this.c.closePath(); //why
    };
    Ball.prototype.update = function (space) {
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
    };
    Ball.prototype.isCollided = function (mountain) {
        if ((this.x + this.radius) > mountain.x && (this.x + this.radius) < (mountain.x + mountain.base)) {
            if (mountain.height < 0) {
                //console.log(mountain.checkY(ball.x + ball.radius));
                return (this.y + this.radius) > innerHeight - mountain.checkY(this.x + this.radius) && (this.y + this.radius) < mountain.y;
            }
            else {
                //console.log(mountain.checkY(ball.x + ball.radius));
                return (this.y + this.radius) < mountain.checkY(this.x + this.radius) && (this.y + this.radius) > mountain.y;
            }
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            return true;
        }
        return false;
    };
    Ball.g = 0.5;
    return Ball;
}());
var ObstacleObject = (function () {
    function ObstacleObject() {
    }
    ObstacleObject.prototype.draw = function () {
    };
    ObstacleObject.prototype.update = function () {
    };
    ObstacleObject.prototype.createObstacleObjects = function () {
        var nObjects = 100;
        var offset = 5;
        if (LEVEL == 1) {
            return Mountain.createMountains(offset, nObjects, []);
        }
        else if (LEVEL == 2) {
            return Tower.createTowers(offset, nObjects, []);
        }
    };
    return ObstacleObject;
}());
var Mountain = (function (_super) {
    __extends(Mountain, _super);
    function Mountain(c, x, y, base, height, dx, grow, isEnd) {
        if (grow === void 0) { grow = false; }
        if (isEnd === void 0) { isEnd = false; }
        var _this = _super.call(this) || this;
        _this.c = c;
        _this.dx = dx;
        _this.isEnd = isEnd;
        _this.x = x;
        _this.y = y;
        _this.base = base;
        _this.height = Mountain.scale * height;
        _this.heightInitial = _this.height;
        _this.grow = grow;
        _this.growthRate = Math.sign(_this.height);
        _this.color = colors[randRangeInt(0, 3)];
        return _this;
    }
    Mountain.prototype.draw = function () {
        // this.c.beginPath();
        // this.c.moveTo(this.x, this.y);
        // this.c.lineTo(this.x + this.base/2, this.y + this.height);
        // this.c.lineTo(this.x + this.base, this.y);
        // this.c.closePath();
        // this.c.fillStyle = this.color;
        // this.c.fill();
        this.c.beginPath();
        var x = this.x - this.base / 2, y = this.y;
        this.c.moveTo(x, y);
        x += this.base / 2, y += this.height;
        this.c.lineTo(x, y);
        x += this.base / 2, y -= this.height;
        this.c.lineTo(x, y);
        this.c.closePath();
        var gradient = c.createLinearGradient(this.x, this.y + this.height, this.x, this.y);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, this.color);
        this.c.fillStyle = gradient;
        this.c.fill();
    };
    Mountain.prototype.update = function () {
        this.draw();
        if (!this.isEnd && this.grow) {
            if (Math.abs(this.height) >= Math.abs(this.heightInitial * 1.3) || Math.abs(this.height) <= Math.abs(this.heightInitial / 3)) {
                this.growthRate *= -1;
            }
            this.height += this.growthRate;
        }
        this.x += this.dx;
    };
    Mountain.prototype.checkY = function (ballX) {
        var h = Math.abs(this.height);
        var m = h / (this.base / 2);
        if (ballX < (this.x + this.base / 2)) {
            ballX -= this.x;
            return m * ballX;
        }
        else {
            ballX -= this.x + this.base / 2;
            return (h - m * ballX);
        }
    };
    Mountain.addMountain = function (x, y, base, height, grow, mountains) {
        if (mountains === void 0) { mountains = null; }
        if (mountains) {
            mountains.push(new Mountain(c, x, y, base, height, -3, grow));
        }
        else {
            var m = new Mountain(c, x, y, base, height, 0);
            m.update();
        }
    };
    Mountain.createMountains = function (offset, nMountains, mountains) {
        if (mountains === void 0) { mountains = null; }
        var base = randRangeInt(100, 200);
        var threshold = (canvas.height / 4.75 + canvas.height / 2.375) / 2;
        for (var i = offset; i < nMountains + offset; i++) {
            var mountainSpacing = base * 2; //randRangeInt(100, 150);
            var x = i * mountainSpacing;
            var y = 0; //i % 2 == 0 ? 0 : canvas.height;
            var height = randRangeInt(canvas.height / 9.5, canvas.height / 2.375); //y == 0 ? randRangeInt(canvas.height/4.75, canvas.height/2.375) : -randRangeInt(canvas.height/4.75, canvas.height/1.9);
            Mountain.addMountain(x, y, base, height, false, mountains);
            y = canvas.height;
            height = height > threshold ? -randRangeInt(canvas.height / 9.5, canvas.height / 4.75) : -randRangeInt(canvas.height / 4.75, canvas.height / 2.375);
            Mountain.addMountain(x, y, base, height, false, mountains);
            base = randRangeInt(100, 200);
        }
        return mountains;
    };
    Mountain.createGrowingMountains = function (offset, nMountains, mountains) {
        if (mountains === void 0) { mountains = null; }
        var x = canvas.width / 2;
        var base = randRangeInt(100, 170);
        var mountainDist = canvas.height / 10;
        for (var i = offset; i < nMountains + offset; i++) {
            var y = 0;
            var height = randRangeInt(canvas.height / 1.5, canvas.height / 2.5);
            Mountain.addMountain(x, y, base, height, true, mountains);
            y = canvas.height;
            height = -(canvas.height - height - mountainDist);
            Mountain.addMountain(x, y, base, height, true, mountains);
            base = randRangeInt(100, 170);
            var towerSpacing = base + canvas.width / 4;
            x += towerSpacing;
        }
        return mountains;
    };
    Mountain.scale = 1.1;
    return Mountain;
}(ObstacleObject));
var Tower = (function (_super) {
    __extends(Tower, _super);
    function Tower(c, x, y, width, height, dx, isEnd) {
        if (isEnd === void 0) { isEnd = false; }
        var _this = _super.call(this) || this;
        _this.c = c;
        _this.dx = dx;
        _this.isEnd = isEnd;
        _this.x = x;
        _this.y = y;
        _this.width = width;
        _this.height = height;
        _this.color = colors[randRangeInt(0, 3)];
        return _this;
    }
    Tower.prototype.draw = function () {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    };
    Tower.prototype.update = function () {
        this.draw();
        this.x += this.dx;
    };
    Tower.addTower = function (x, y, width, height, towers) {
        if (towers === void 0) { towers = null; }
        if (towers) {
            towers.push(new Tower(c, x, y, width, height, -3));
        }
        else {
            var m = new Tower(c, x, y, width, height, 0);
            m.update();
        }
    };
    Tower.createTowers = function (offset, nTowers, towers) {
        if (towers === void 0) { towers = null; }
        var x = canvas.width / 2;
        var width = randRangeInt(50, 70);
        var towerDist = canvas.height / 10;
        for (var i = offset; i < nTowers + offset; i++) {
            var y = 0;
            var height = randRangeInt(canvas.height / 1.5, canvas.height / 2.5);
            Tower.addTower(x, y, width, height, towers);
            y = canvas.height;
            height = -(canvas.height - height - towerDist);
            Tower.addTower(x, y, width, height, towers);
            width = randRangeInt(50, 70);
            var towerSpacing = width + canvas.width / 4; //randRangeInt(100, 150);
            x += towerSpacing;
        }
        return towers;
    };
    return Tower;
}(ObstacleObject));
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
};
function intro() {
    c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
    var info = document.getElementById('Info');
    if (info.hasAttribute('style')) {
        info.removeAttribute('style');
        document.getElementById('level').innerText = LEVELS[LEVEL - 1];
        var status = document.getElementById('status');
        var playBtn = document.getElementById('play');
        if (levelFinished) {
            status.innerText = STATUS_LIST['completed'] + " " + LEVELS[LEVEL - 2];
            levelFinished = false;
        }
        else {
            status.innerText = STATUS_LIST['collision'];
            playBtn.innerText = 'Replay';
        }
        document.getElementById('status').removeAttribute('style');
    }
    canvas.setAttribute('style', 'background: rgba(0, 0, 0, 0.87);');
    Mountain.createMountains(0, 40);
}
intro();
/* GAME START */
document.getElementById('play').addEventListener('click', function () {
    document.getElementById('Info').setAttribute('style', 'display: none;');
    c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
    canvas.setAttribute('style', 'background: rgba(33, 33, 33, 0.91)'); //#D9D9D9
    if (scoreDiv.hasAttribute('style'))
        scoreDiv.removeAttribute('style');
    score = 0;
    scoreSpan.textContent = String(score);
    var obstacleObjects = [];
    var nObjects = 5;
    var offset = 5;
    var endObjects = [];
    var stars = [];
    if (LEVEL == 1) {
        Mountain.createMountains(offset, nObjects, obstacleObjects);
        var lastMountain = obstacleObjects[nObjects * 2 - 1];
        var endX = lastMountain.x + canvas.width / 5, endHeight = canvas.height / 2.5, endBase = canvas.width / 10;
        endObjects[0] = new Mountain(c, endX, 0, endBase, endHeight, -3, true);
        endObjects[1] = new Mountain(c, endX, canvas.height, endBase, -endHeight, -3, true);
        Circle.drawCircles(100, stars);
    }
    else if (LEVEL == 2) {
        Tower.createTowers(offset, nObjects, obstacleObjects);
        var lastTower = obstacleObjects[nObjects * 2 - 1];
        var endX = lastTower.x + canvas.width / 2, endHeight = canvas.height / 2.5, endWidth = canvas.width / 20;
        endObjects[0] = new Tower(c, endX, 0, endWidth, endHeight, -3, true);
        endObjects[1] = new Tower(c, endX, canvas.height, endWidth, -endHeight, -3, true);
    }
    else if (LEVEL == 3) {
        Mountain.createGrowingMountains(offset, nObjects, obstacleObjects);
        var lastMountain = obstacleObjects[nObjects * 2 - 1];
        var endX = lastMountain.x + canvas.width / 5, endHeight = canvas.height / 2.5, endBase = canvas.width / 10;
        endObjects[0] = new Mountain(c, endX, 0, endBase, endHeight, -3, true);
        endObjects[1] = new Mountain(c, endX, canvas.height, endBase, -endHeight, -3, true);
    }
    var ball = new Ball(c, canvas.width / 3, canvas.height / 2, 0, 0, 10);
    var frames = 0;
    function animate() {
        var animation = requestAnimationFrame(animate);
        if (gameStarted || frames == 0) {
            c.clearRect(0, 0, innerWidth, innerHeight); // clear canvas
            for (var i = 0; i < obstacleObjects.length; i++) {
                if (ball.isCollided(obstacleObjects[i])) {
                    cancelAnimationFrame(animation);
                    gameStarted = false;
                    intro();
                    return;
                }
            }
            for (var i = 0; i < endObjects.length; i++) {
                if (ball.isCollided(endObjects[i])) {
                    cancelAnimationFrame(animation);
                    gameStarted = false;
                    intro();
                    return;
                }
            }
            if (ball.getX() >= endObjects[0].x) {
                cancelAnimationFrame(animation);
                gameStarted = false;
                levelFinished = true;
                LEVEL++;
                intro();
                return;
            }
            for (var i = 0; i < 30; i++) {
                stars[i].update();
            }
            ball.update(space);
            for (var i = 0; i < obstacleObjects.length; i++) {
                obstacleObjects[i].update();
            }
            endObjects[0].update();
            endObjects[1].update();
            if (frames % 30 == 0) {
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
