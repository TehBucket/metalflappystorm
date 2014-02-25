var score = 0;
var statust = "Beep. Press Z to jump, X to switch gravity.";
var gravity = 1; //either -1 or 1, gravity can flip
var pY = 1; //player's Y position
var grounded = 0; //whether player is in air or grounded
var jumping = 0; //whether jump lerping is going on or just falling
var jumpLERP;
var scroll = 0; //may be removed when i make things better
var time = 0; //how many frames have gone by since load
var spriteN = 4;
var animateDelay = 0; //i rreally need to stop with the globals

var player = document.getElementById('player');
var gameFrame = document.getElementById('gameFrame');
var scrollingStuff = document.getElementsByClassName('scroll');



//static variables to change when tweaking
var frameSpeed = 20; // speed of update(), smaller is faster.
var scrollSpeed = -1;
var fallSpeed = 2;
var gameHeight = 250;
var gameWidth = 400;
gameFrame.style.height = gameHeight + 'px';
gameFrame.style.width = gameWidth + 'px';

var counters = { //lazy way to stop overusing globals
var blockD = 0;
}

var blockDefault = function(){ //will create random pillar block
	this.x = 400;
	this.height = Math.floor(Math.random()*(75 - 35 + 1) + 35); //thank you MDN
	this.element = document.getElementById("blocks" + blocks.length-1)
	this.alive = 1;
	this.width = 16; //pixel width of image for scaling management and such
}

var blocks = [];

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
spriteN = 5;
}

var flipGravity = function(){
gravity = gravity * -1;
grounded = 0;
}

var bulletMove = function(){

}

//creates bullet
var shoot = function(y){

}

//changes the Graphics every update
var graphics = function(){
	//Animate
	animateDelay = animateDelay + 1;
	if(animateDelay >= 10){animateDelay = 0;}
	orientation = 0;
	if(gravity==-1){orientation = 32} //32 pixels down in spritesheet is upside down version
	if(grounded == 1 && animateDelay == 0){
		spriteN = spriteN + 1;
		if(spriteN >= 4){spriteN = 0;}
		}
	player.style.backgroundPosition = (spriteN+1)*24 +1 + 'px ' + orientation + 'px'; //eww

	//scroll background
	for(var i = 0; i < scrollingStuff.length;i++){
		scrollingStuff[i].style.backgroundPosition = scroll + 'px' + ' 0px';
		}
	scroll = scroll + scrollSpeed;
	if(scroll >= 100){scroll = 0;}
}

var blockSpawn = function(){
z = Math.random();
if(z > .99){
	blocks.push(new blockDefault());
	var div = document.createElement("div");
	var q = blocks.length - 1;
	div.style.left = blocks[q].x;
	div.style.height = blocks[q].height;
	div.setAttribute('class', 'block');
	div.setAttribute('id', 'block' + q);
	gameFrame.appendChild(div);
	blocks[q].element = document.getElementById('block' + q);
	}
}

blockSpawn(); //spawning a block before update runs to avoid that bug

var blockMove = function(){ //and checks for collission with player?
for(var i = 0; i < blocks.length;i++){
	var movex = function(){
		x = x - 1;
		blocks[i].x = x;
		blocks[i].element.style.left = x + 'px';
		}
	if(blocks[i].alive == 1){
		var x = blocks[i].x;
		var w = blocks[i].width;
		var obj = document.getElementById('block' + i);
		if(x <= 0){
			if(x<=-16){
				gameFrame.removeChild(obj);
				blocks[i].alive = 0;
				}
			else{ //kinda scales it to fake leaving the frame
				movex();
				obj.style.width = 16 + x + "px";
				obj.style.backgroundPosition = 16 + x + "px 0px";
				}
		}
		else if(x >=gameWidth - w){ //scales to fake entering frame
			movex();
			obj.style.width = ((gameWidth - w)*-1) + 16 + 'px';
			
			}
		else{
			movex();
			}
	}
}
}

var update = function(){
	gravitate();
	blockSpawn();
	if(blocks.length > 0){blockMove();}
	bulletMove();
	graphics();
	time = time + 1; //time is a var used by other things but never changed anywhere else
}

//does each frame at interval
var int=self.setInterval(function(){update()},frameSpeed);

//resets all values, like refreshing the page, called at death
var resetall = function (){
	var score = 0;
	var statust = "Beep. Press Z to jump, X to switch gravity.";
	var gravity = 1;
	var pX = 1;
	var pY = 1;
}
 
 //inputs
window.addEventListener("keydown", function(e){
	if(e.keyCode == 90){jump()}
	else if(e.keyCode == 88){flipGravity()}
	else if(e.keyCode == 86){shoot(pY)}
}
, false);

resetall();