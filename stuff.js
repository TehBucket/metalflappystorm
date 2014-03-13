var score = 0
var gravity = 1; //either -1 or 1, gravity can flip
var pY = 1; //player's Y position
var grounded = 0; //whether player is in air or grounded
var jumping = 0; //whether jump lerping is going on or just falling
var jumpLERP;
var time = 0; //how many frames have gone by since load
var player = document.getElementById('player');
var gameFrame = document.getElementById('gameFrame');
var scrollingStuff = document.getElementsByClassName('scroll');
var statusBar = document.getElementById('status');
var highScore = 0;

var blocks = [];
var bullets = [];
var enemies = [];

//static variables to change when tweaking
var frameSpeed = 2; // speed of update(), smaller is faster.
var scrollSpeed = -1;
var fallSpeed = 2;
var spawnRate = .75; // .95 = 95% blocks 5% enemies
var difficulty = 149; // smaller is harder, 150 = enemy or block spawns every 150 frames
var enemyFireRate = 200; //how many frames between enemy shots
var maxEnemies = 3; //keep under 3
var gameHeight = 250;
var gameWidth = 400;
gameFrame.style.height = gameHeight + 'px';
gameFrame.style.width = gameWidth + 'px';

var counters = { //lazy way to stop overusing globals
blockD: difficulty,
spriteN: 4,
scroll: 0,
dying: 0,
scoreFlash: 0,
animateDelay: 0,
enemies: 0,
enemy1: 0, //whether or not there is an enemy in 1 of 3 spaces
enemy2: 0,
enemy3: 0,
}

//will create random pillar block
var blockDefault = function(){ 
	this.x = gameWidth;
	this.height = Math.floor(Math.random()*(175 - 85 + 1) + 85); //thank you MDN
	this.orientation = Math.floor(Math.random()*(1 - 0 + 1) + 0);
	this.alive = 1;
	this.width = 16; //pixel width of image for scaling management and such
}

var bulletDefault = function(x, y, o){
	this.x = x;
	this.y = y;
	this.o = o;
	this.alive = 1;
	this.frame = 0;
}

var enemyDefault = function(){
	if(gravity == -1){this.y = 10;}
	else{this.y = gameHeight - 32;}
	this.x = gameWidth -1;
	this.width = 1;
	this.alive = 1;
	this.frame = 0;
	this.frameDelay = 0;
	this.fireDelay = 40;
	if(counters.enemy1 == 0){this.position = 1;}
	else if(counters.enemy2 == 0){this.position = 2;}
	else if(counters.enemy3 == 0){this.position = 3;}
}

//jumping and Falling, player only
var gravitate = function(){
if(jumping == 1){
	pY = pY + jumpLERP*gravity*-1;
	if(jumpLERP >= 13){jumping = 0;}
	jumpLERP = jumpLERP +1;
	}
else{
	pY = pY + 1*gravity*fallSpeed; //fall
	}
if(pY >= gameHeight - 32){pY = gameHeight - 32; grounded = 1; jumping = 0;}
else if(pY <= 10){pY = 10; grounded = 1; jumping = 0;}

player.style.top = pY + "px";
}

var jump = function(){
jumping = 1;
jumpLERP = 1;
grounded = 0;
counters.spriteN = 5;
}

var flipGravity = function(){
gravity = gravity * -1;
grounded = 0;
}

//move, animate, collide
var bulletMove = function(){
	for(var i = 0; i < bullets.length;i++){
	if(bullets[i].alive){
		var obj = document.getElementById('bullet' + i);
		var x = bullets[i].x;
		var y = bullets[i].y;
		var o = bullets[i].o;
		var movex = function(){
			x = x + o;
			bullets[i].x = x;
			obj.style.left = x + 'px';
		}
		movex();
		//animate
		obj.style.backgroundPosition = bullets[i].frame*8+ 'px 0px';
		bullets[i].frame += 1;
		if(bullets[i].frame >= 2){bullets[i].frame = 0;}
		//collide
		if(bullets[i].o == 1){ //with enemy
			for(var i2 = 0;i2 < enemies.length;i2++){
				if(enemies[i2].alive == 1 && y >= enemies[i2].y+4 && y <= enemies[i2].y+28 && x == enemies[i2].x){
					enemies[i2].alive = 0;
					var enemyi2 = document.getElementById('enemy' + i2);
					gameFrame.removeChild(enemyi2);
					gameFrame.removeChild(obj);
					bullets[i].alive = 0;
					counters.enemies -= 1;
					counters['enemy'+enemies[i2].position] = 0;
					score += 2;
					}
				}
			}
		else if(bullets[i].o == -1){ //with player
			if(y >= pY+4 && y <= pY+28 && x >= 34 && x <= 55){counters.dying = 1}
			}
		if(x < 0 || x > gameWidth && bullets[i].alive){
			gameFrame.removeChild(obj);
			bullets[i].alive = 0;
			}
		}
	}
}

//creates bullet
var shoot = function(x, y, o){
	bullets.push(new bulletDefault(x, y, o));
	var div = document.createElement("div");
	var q = bullets.length - 1;
	div.style.left = bullets[q].x + 'px';
	div.style.top = bullets[q].y + 'px';
	div.style.backgroundImage = "url('images/bullet"+o+".png')";
	div.setAttribute('class', 'bullet');
	div.setAttribute('id', 'bullet' + q);
	gameFrame.appendChild(div);
}

//changes the Graphics every update
var graphics = function(){
	//Animate player
	counters.animateDelay = counters.animateDelay + 1;
	if(counters.animateDelay >= 10){counters.animateDelay = 0;}
	if(grounded == 1 && counters.animateDelay == 0){
		counters.spriteN -= 1;
		if(counters.spriteN <= 0){counters.spriteN = 4;}
		}
			player.style.backgroundPosition = (counters.spriteN)*-32 + 'px ' + (gravity - 1)*16 + 'px'; //eww

	//scroll background
	for(var i = 0; i < scrollingStuff.length;i++){
		var y = 0;
		if(i == 0){y = -1*pY/8;} //rotoscopishes background with player movement
		scrollingStuff[i].style.backgroundPosition = counters.scroll + 'px' + ' '+y+'px';
		}
	counters.scroll = counters.scroll + scrollSpeed;
	if(counters.scroll <= -32){counters.scroll = 0;}
}

var blockSpawn = function(){
counters.blockD = counters.blockD + 1;
if(counters.blockD >= difficulty){
	if(Math.random() < spawnRate){
		blocks.push(new blockDefault());
		var div = document.createElement("div");
		var q = blocks.length - 1;
		div.style.left = blocks[q].x + 'px';
		div.style.height = blocks[q].height + 'px';
		if(blocks[q].orientation == 1){div.style.top = '10px';}
		else{div.style.top = gameHeight - blocks[q].height + 'px';}
		div.setAttribute('class', 'block');
		div.setAttribute('id', 'block' + q);
		gameFrame.appendChild(div);
		counters.blockD = 0; //reset spawn timer
		}
	else{enemySpawn();}
	}
}

//moves, scales, and checks player colission with every block
var blockMove = function(){
for(var i = 0; i < blocks.length;i++){
	var movex = function(){
		x = x - 1;
		blocks[i].x = x;
		obj.style.left = x + 'px';
		}
	if(blocks[i].alive == 1){
		var x = blocks[i].x;
		var w = blocks[i].width;
		var obj = document.getElementById('block' + i);
		if(x <= 0){
			if(x<=-w){
				gameFrame.removeChild(obj);
				blocks[i].alive = 0;
				}
			else{ //kinda scales it to fake leaving the frame
				movex();
				obj.style.width = w + x + "px";
				obj.style.backgroundPosition = w + x + "px 0px";
				}
		}
		else if(x >= gameWidth - w){ //scales to fake entering frame
			movex();
			obj.style.width = gameWidth - x + 'px';
			}
		//COLISSION X
		else if(x > 14 && x < 62){ // approximately player's X, checks if player is colliding
			movex();
			colission(x, blocks[i].height, blocks[i].orientation);
		}
		else{
			movex();
		}
	}
}
}

var colission = function(x, h, o){
	if(o == 1){
		//checks blocks that hang from ceiling
		if(pY < h + 10){counters.dying = 1;}
		else{
			if(x == 44){score++}
			}
		}
	//checks blocks that grow from floor
	else{
		if(pY > gameHeight - h - 32){counters.dying = 1;}
	else{
		if(x == 44){score++}
		}
	}
}

var enemySpawn = function(){
	if(counters.enemies < maxEnemies){
		enemies.push(new enemyDefault());
		var div = document.createElement("div");
		var q = enemies.length - 1;
		div.style.left = enemies[q].x + 'px';
		div.style.top = enemies[q].y + 'px';
		div.setAttribute('class', 'enemy');
		div.setAttribute('id', 'enemy' + q);
		gameFrame.appendChild(div);
		counters.blockD = 0; //reset spawn timer
		counters.enemies += 1;
		counters['enemy'+enemies[q].position] = 1; //says that position is full
		}
	else{blockSpawn()}
}

//moves, scales, animates, and ai's each alive enemy
var enemyUpdate = function(){
	for(var i = 0; i < enemies.length;i++){
		if(enemies[i].alive ==1){
			var obj = document.getElementById('enemy' + i);
			if(enemies[i].x >= gameWidth - 42*enemies[i].position){ //slides enemy on x
				enemies[i].x += scrollSpeed;
				if(enemies[i].width < 32){ //scales x to fake entering frame
					enemies[i].width += 1;
					obj.style.width = enemies[i].width + 'px';
					}
				}
			else{
			if(enemies[i].frameDelay == 20){ //animation
				enemies[i].frame -= 1;
				if(enemies[i].frame <= 1){enemies[i].frame == 11}
				enemies[i].frameDelay = 0;
				}
			enemies[i].frameDelay += 1; //shooting
			if(enemies[i].fireDelay >= enemyFireRate){
					if(enemies[i].y == pY){
						shoot(enemies[i].x, enemies[i].y + 14, -1)
						enemies[i].fireDelay = 0;
						}
				}
			else{enemies[i].fireDelay +=1;}
			}
		
		enemies[i].y += gravity;
		if(enemies[i].y >= gameHeight - 32){enemies[i].y = gameHeight - 32;}
		else if(enemies[i].y <= 10){enemies[i].y = 10;}
		obj.style.backgroundPosition = enemies[i].frame*32+ 'px ' + (gravity - 1)*16 + 'px';
		obj.style.left = enemies[i].x + 'px';	
		obj.style.top = enemies[i].y + 'px';
		}
	}
}

//loops when the game is frozen immediately after death
var dying = function(){
	//flashes score on high score
	if(score > highScore){
		highScore = score;
		statusBar.style.color = 'red';
		counters.scoreFlash = 1;
		}
	if(counters.dying == 15 * counters.scoreFlash){
			if(statusBar.style.color == 'black'){statusBar.style.color = 'red';}
			else{statusBar.style.color = 'black';}
			counters.scoreFlash += 1;
			}
	if(counters.dying == 1){ //resets counter from normal animation
		counters.animateDelay = 0;
		counters.spriteN = 7;
		}
	if(counters.animateDelay >= 8){
		counters.animateDelay = 0;
		player.style.backgroundPosition = (counters.spriteN)*-32 + 'px ' + (gravity - 1)*16 + 'px';
		counters.spriteN += 1;
		}
	counters.animateDelay += 1;
	counters.dying += 1;
}

var update = function(){
	if(counters.dying == 0){
		gravitate();
		blockSpawn();
		blockMove();
		enemyUpdate();
		bulletMove();
		graphics();
		statusBar.innerHTML = 'Score: ' + score + ' High Score: '+highScore;
		}
	else if(counters.dying >= 120){resetAll();}
	else{
		dying();
		}
	time = time + 1; //time is a var used by other things but never changed anywhere else
}

//does each frame at interval
var int = self.setInterval(function(){update()},frameSpeed);

//resets all values, like refreshing the page, called at death
var resetAll = function (){
	counters.dying = 0;
	score = 0;
	gravity = 1;
	pY = 1;
	grounded = 0;
	jumping = 0;
	time = 0;
	counters.spriteN = 4;
	counters.enemies = 0;
	counters.enemy1 =0;counters.enemy2=0;counters.enemy3=0;
	blocks = [];
	var Divs = document.getElementsByClassName('block');
	while (Divs[0]){gameFrame.removeChild(Divs[0])}; //thanks stackoverflow
	bullets = [];
	Divs = document.getElementsByClassName('bullet');
	while (Divs[0]){gameFrame.removeChild(Divs[0])};
	enemies = [];
	Divs = document.getElementsByClassName('enemy');
	while (Divs[0]){gameFrame.removeChild(Divs[0])};
	statusBar.style.color = 'black';
	counters.scoreFlash = 0;
}
 
 //inputs
window.addEventListener("keydown", function(e){
	if(e.keyCode == 90){jump()}
	else if(e.keyCode == 88){flipGravity()}
	else if(e.keyCode == 67){shoot(55, pY + 12 - 2*gravity, 1)}
}
, false);

resetAll();