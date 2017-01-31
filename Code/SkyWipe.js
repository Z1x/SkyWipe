// PLANE
var bullets = [];
var recentDamage = false;
var scoreForNow = 500;
var score; //text
var planeCrashes; //text
//ENEMY
var enemies = [];
var enemyBullets = [];
var bossSpawned = false;
var bossStatus; //text
//SPAWNS
var explosions = [];
var livesDrop = [];

//HANDY
var degrees = [0, 90, 180, -90];
var theWidth = window.innerWidth;
var theHeigth = window.innerHeight;



//CONSTRUCTOR
function object(x, y, width, height, color, speed, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.charging = true;
    this.moveLeft = false;
    this.moveRight = false;
    this.degree = 90;
    this.lives = 3;
    this.type = type;
    this.crashed = false;

    if (type == 'image') {
        this.image = new Image();
        this.image.src = color;
    }

    this.controls = function (degree) {
        ctx = area.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(degree * Math.PI / 180);
        if (this.type == 'image') {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this.type == 'text') {
            ctx.font = this.width + ' ' + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }

    this.move = function () {
        this.controls(this.degree);
        if (this.moveLeft) {
            this.controls(this.degree--);
        }
        if (this.moveRight) {
            this.controls(this.degree++);
        }
        this.y -= this.speed * Math.sin(this.degree * Math.PI / 180) * 2;
        this.x -= this.speed * Math.cos(this.degree * Math.PI / 180) * 2;
        if (this.y < -40) {
            this.y = theHeigth;
        }
        if (this.y > theHeigth + 40) {
            this.y = -40;
        }
        if (this.x < -40) {
            this.x = theWidth;
        }
        if (this.x > theWidth + 40) {
            this.x = -40;
        }


    }

    this.shoot = function () {
        bullets.push(new object(this.x, this.y, 20, 15, '../Img/rocket.png', 4, 'image'));
        bullets[bullets.length - 1].degree = this.degree;
        bullets[bullets.length - 1].existTime = 200;
    }


    this.enemyShoot = function () {
        if (bossSpawned) {
            enemyBullets.push(new object(this.x - 10, this.y, 25, 15, '../Img/bossRocket.png', 4, 'image'));
            enemyBullets.push(new object(this.x + 10, this.y, 25, 15, '../Img/bossRocket.png', 4, 'image'));
            enemyBullets[enemyBullets.length - 1].degree = this.degree + 5;
            enemyBullets[enemyBullets.length - 1].existTime = 200;
            enemyBullets[enemyBullets.length - 2].degree = this.degree - 5;
            enemyBullets[enemyBullets.length - 2].existTime = 200;
        } else {
            enemyBullets.push(new object(this.x, this.y, 15, 5, '../Img/enemyRocket.png', 4, 'image'));
            enemyBullets[enemyBullets.length - 1].degree = this.degree;
            enemyBullets[enemyBullets.length - 1].existTime = 200;
        }


    }

    this.update = function () {
        this.move();
    }

    this.crashWith = function (otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

//OBJECTS

// area object
var area = {
    canvas: document.createElement('canvas'),
    start: function () {
        this.canvas.width = theWidth;
        this.canvas.height = theHeigth;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateArea, 20);
    },

    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    stop: function () {
        explosions.push(new object(plane.x, plane.y, plane.width, plane.height, '../Img/exp.png', 0, 'image'));
        explosions[explosions.length - 1].existTime = 50;
        plane.speed = 0;
        setTimeout(function () {
            clearInterval(area.interval);
        }, 500)
    }
}


//FUNCTIONS

function updateArea() {
    area.clear();
    bg();
    score.update();
    score.text = 'score: ' + scoreForNow;
    planeCrashes.update();
    planeCrashes.text = 'lives: ' + plane.lives;
    if (bossSpawned) {
        bossStatus.update();
        bossStatus.text = 'Boss lives: ' + enemies[0].lives;
    }
    plane.update();
    enemyAppear();


    //bullets move -> enemy
    for (var index = 0; index < bullets.length; index++) {
        bullets[index].update();
        bullets[index].existTime--;
        if (bullets[index].existTime <= 0) {
            bullets.splice(index, 1);
            index--;
            continue;
        }
        for (var index2 = 0; index2 < enemies.length; index2++) {
            if (bossSpawned && bullets[index].crashWith(enemies[index2])) {
                enemies[index2].lives--;
                bullets.splice(index, 1);
                index--;
                if (enemies[index2].lives <= 0) {
                    explosions.push(new object(enemies[index2].x, enemies[index2].y, enemies[index2].width, enemies[index2].height, '../Img/exp.png', 0, 'image'));
                    explosions[explosions.length - 1].existTime = 50;
                    scoreForNow += 837;
                    enemies.splice(0);
                }
            } else {
                if (bullets[index].crashWith(enemies[index2])) {
                    explosions.push(new object(enemies[index2].x, enemies[index2].y, enemies[index2].width, enemies[index2].height, '../Img/exp.png', 0, 'image'));
                    explosions[explosions.length - 1].existTime = 50;
                    scoreForNow += 10;
                    if (Math.floor(Math.random() * 10) == 1) {
                        livesDrop.push(new object(enemies[index2].x, enemies[index2].y, 25, 25, '../Img/repair.png', 0, 'image'));
                        livesDrop[livesDrop.length - 1].existTime = 1000;
                    }
                    enemies.splice(index2, 1);
                    index2--;
                    bullets.splice(index, 1);
                    index--;
                }
            }

        }

    }

    //enemy move -> plane
    for (var index = 0; index < enemies.length; index++) {
        enemies[index].update();

        if (bossSpawned) {
            if ((Math.floor(Math.random() * 2) + 1) == 2) {
                enemies[index].degree += 2;
            } else {
                enemies[index].degree -= 2;
            }

            if ((Math.floor(Math.random() * 300) + 1) == 1) {
                enemies[index].enemyShoot();
            }

            if (plane.crashWith(enemies[index]) && !recentDamage) {
                recentDamage = true;
                plane.lives--;
                if (plane.lives <= 0) {
                    area.stop();
                }
                setTimeout(function () {
                    recentDamage = false;
                }, 1000);

            }
        } else {
            if ((Math.floor(Math.random() * 2) + 1) == 2) {
                enemies[index].degree++;
            } else {
                enemies[index].degree--;
            }

            if ((Math.floor(Math.random() * 1000) + 1) == 1) {
                enemies[index].enemyShoot();
            }

            if (plane.crashWith(enemies[index])) {
                plane.lives--;
                explosions.push(new object(enemies[index].x, enemies[index].y, enemies[index].width, enemies[index].height, '../Img/exp.png', 0, 'image'));
                explosions[explosions.length - 1].existTime = 50;
                scoreForNow += 10;
                enemies.splice(index, 1);
                index--;
                if (plane.lives <= 0) {
                    area.stop();
                }
            }
        }


    }


    //explosions exist
    for (var index = 0; index < explosions.length; index++) {
        explosions[index].update();
        explosions[index].existTime--;
        if (explosions[index].existTime <= 0) {
            explosions.splice(index, 1);
            index--;
        }
    }


    //lives exist
    for (var index = 0; index < livesDrop.length; index++) {
        livesDrop[index].update();
        livesDrop[index].existTime--;
        if (livesDrop[index].crashWith(plane)) {
            plane.lives++;
            livesDrop.splice(index, 1);
            index--;
            continue;
        }
        if (livesDrop[index].existTime <= 0) {
            livesDrop.splice(index, 1);
            index--;
        }
    }


    //enemy bullets move -> plane
    for (var index = 0; index < enemyBullets.length; index++) {
        enemyBullets[index].update();
        enemyBullets[index].existTime--;
        if (enemyBullets[index].existTime <= 0) {
            enemyBullets.splice(index, 1);
            continue;
        }

        if (plane.crashWith(enemyBullets[index])) {
            plane.lives--;
            enemyBullets.splice(index, 1);
            index--;
            if (plane.lives <= 0) {
                area.stop();
            }
        }

    }
}


// start the game loop
function startGame() {
    plane = new object(theWidth / 2, theHeigth / 2, 40, 40, '../Img/plane.png', 2, 'image');
    score = new object(10, 15, "30px", "Consolas", 'black', 0, 'text');
    score.degree = 0;
    planeCrashes = new object(10, 35, "30px", "Consolas", 'black', 0, 'text');
    planeCrashes.degree = 0;
    area.start();
}


// chance for enemies to appear
function enemyAppear() {
    if (!bossSpawned && scoreForNow >= 500) {

        bossSpawned = true;
        bossStatus = new object(200, 15, "30px", "Consolas", 'black', 0, 'text');
        bossStatus.degree = 0;
        enemies.splice(0);
        if ((Math.floor(Math.random() * 2) + 1) == 2) {
            enemies.push(new object((Math.floor(Math.random() * theWidth - 20) + 1), -20, 60, 60, '../Img/boss.png', 3, 'image'));
        } else {
            enemies.push(new object(-20, (Math.floor(Math.random() * theHeigth - 20) + 1), 60, 60, '../Img/boss.png', 3, 'image'));
        }

        enemies[0].lives = 10;

        enemies[enemies.length - 1].degree = degrees[(Math.floor(Math.random() * 4))];
    } else if (!bossSpawned) {
        if ((Math.floor(Math.random() * 400) + 1) == 1) {
            if ((Math.floor(Math.random() * 2) + 1) == 2) {
                enemies.push(new object((Math.floor(Math.random() * theWidth - 20) + 1), -20, 30, 30, '../Img/enemyPlane.png', 2, 'image'));
            } else {
                enemies.push(new object(-20, (Math.floor(Math.random() * theHeigth - 20) + 1), 30, 30, '../Img/enemyPlane.png', 2, 'image'));
            }

            enemies[enemies.length - 1].degree = degrees[(Math.floor(Math.random() * 4))];
        }
    }

}

// background
function bg() {
    var background = new Image();
    background.src = '../Img/skybg.jpg';
    area.context.drawImage(background, 0, 0);
}



// EVENT LISTENERS

var keys = {};

document.addEventListener('keydown', function (e) {
    keys[e.which] = true;
    pressedKeys(keys);
});

document.addEventListener('keyup', function (e) {
    delete keys[e.which];
    pressedKeys();
});

function pressedKeys() {

    for (var i in keys) {
        if (!keys.hasOwnProperty(i)) continue;
        switch (parseInt(i)) {
            case 38: plane.moveTop = true; break;
            case 40: plane.moveBottom = true; break;
            case 39: plane.moveRight = true; break;
            case 37: plane.moveLeft = true; break;
            case 32: if (plane.charging) {
                plane.charging = false;
                plane.shoot();
                setTimeout(function () {
                    plane.charging = true;
                }, 1000)
            };
                break;


        }

    }
}

document.addEventListener('keyup', function (e) {
    switch (e.keyCode) {
        case 38: plane.moveTop = false; break;
        case 40: plane.moveBottom = false; break;
        case 39: plane.moveRight = false; break;
        case 37: plane.moveLeft = false; break;
    }
});