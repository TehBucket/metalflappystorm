var score = 0;
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
var gameHeight = 250;
var gameWidth = 400;
gameFrame.style.height = gameHeight + 'px';
gameFrame.style.width = gameWidth + 'px';

var counters = { //lazy way to stop overusing globals
blockD: 150,
spriteN: 4,
scroll: 0,
dying: 0,
scoreFlash: 0,
animateDelay: 0,
}

//will create random pillar block
var blockDefault = function(){ 
	this.x = gameWidth;
	this.height = Math.floor(Math.random()*(175 - 85 + 1) + 85); //thank you MDN
	this.orientation = Math.floor(Math.random()*(1 - 0 + 1) + 0);
	this.alive = 1;
	this.width = 16; //pixel width of image for scaling management and such
}

var bulletDefault = function(y, o){
	this.y = y;
	if(o==1){this.x = 55;}
	else{this.x = 350;}
	this.o = o;
	this.alive = 1;
}

var enemyDefault = function(){
	if(gravity == -1){this.y = 10;}
	else{this.y = gameHeight - 32;}
	this.x = gameWidth;
	this.alive = 1;
	this.frame = 0;
}

//jumping and Falling
var gravitate = function(){
if(jumping == 1){
	pY = pY + jumpLERP*gravity*-1;
	if(jumpLERP >= 16){jumping = 0;}
	jumpLERP = jumpLERP +2;
	}
else{
	pY = pY + 1*gravity*fallSpeed; //fall
	}
if(pY >= gameHeight -50){pY = gameHeight -50; grounded = 1; jumping = 0;} //50px difference between real floor and seen floor :P
else if(pY <= -10){pY = -10; grounded = 1; jumping = 0;}

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

var bulletMove = function(){
	for(var i = 0; i < bullets.length;i++){
	if(bullets[i].alive){
			var obj = document.getElementById('bullet' + i);
			var x = bullets[i].x;
			var o = bullets[i].o;
			var movex = function(){
				x = x + o;
				bullets[i].x = x;
				obj.style.left = x + 'px';
			}
			if(x < 0 || x > gameWidth){
				gameFrame.removeChild(obj);
				bullets[i].alive = 0;
				}
			else{movex();}
		}
	}
}

//creates bullet
var shoot = function(y, o){
	bullets.push(new bulletDefault(y, o));
	var div = document.createElement("div");
	var q = bullets.length - 1;
	div.style.left = bullets[q].x + 'px';
	div.style.top = bullets[q].y + 'px';
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
if(counters.blockD >= 149){
	if(Math.random() < .25){
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
		if(pY < h - 10){counters.dying = 1;}
		else{
			if(x == 44){score++}
			}
		}
	//checks blocks that grow from floor
	else{
		if(pY > gameHeight - h - 32 - 20){counters.dying = 1;}
	else{
		if(x == 44){score++}
		}
	}
}

var enemySpawn = function(){
	enemies.push(new enemyDefault());
	var div = document.createElement("div");
	var q = enemies.length - 1;
	div.style.left = enemies[q].x + 'px';
	div.style.top = enemies[q].y + 'px';
	div.setAttribute('class', 'enemy');
	div.setAttribute('id', 'enemy' + q);
	gameFrame.appendChild(div);
	counters.blockD = 0; //reset spawn timer
}

var enemyUpdate = function(){
	for(var i = 0; i < enemies.length;i++){
	var obj = document.getElementById('enemy' + i);
	if(enemies[i].x >= gameWidth - 100){enemies[i].x += scrollSpeed;}
	obj.style.left = enemies[i].x + 'px';
	obj.style.backgroundPosition = enemies[i].frame*32+ 'px ' + (gravity - 1)*16 + 'px';
	enemies[i].frame += 1;
	
	}
}

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
	else if(e.keyCode == 67){shoot(pY + 32, 1)}
}
, false);

resetAll();