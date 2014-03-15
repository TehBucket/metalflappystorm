//manages options menu
var optionsButton = document.getElementById('options');
optionsButton.addEventListener('click', function(){toggleOptionsMenu();}, false);

var toggleOptionsMenu = function(){
	if(optionsButton.innerHTML == 'Options'){
		//repetition because i can't make sense of add and remove eventlisteners working with this and keydown code
		var bindFlip = function(e){
			bind('flip',e.keyCode);
			buttonF.innerHTML = 'Set Flip Key';
			document.removeEventListener('keydown',bindFlip);
			}
		var bindShoot = function(e){
			bind('shoot',e.keyCode);
			buttonS.innerHTML = 'Set Shoot Key';
			document.removeEventListener('keydown',bindShoot);
			}
		var bindDash = function(e){
			bind('dash',e.keyCode);
			buttonD.innerHTML = 'Set Dash Key';
			document.removeEventListener('keydown',bindDash);
			}
		optionsButton.innerHTML = '-Close Options-';
		//menu div
		var div = document.createElement("div");
		div.setAttribute('class', 'menu');
		div.setAttribute('id', 'optionsMenu');
		document.body.appendChild(div);
		var optionsMenu = document.getElementById('optionsMenu');
		//set flip key
		var buttonF = document.createElement("button");
		buttonF.addEventListener('click', function(){
			buttonF.innerHTML = 'Press the key to bind';
			document.addEventListener('keydown',bindFlip);
			}, false);
		buttonF.innerHTML = 'Set Flip Key';
		optionsMenu.appendChild(buttonF);
		//set shoot key
		var buttonS = document.createElement("button");
		buttonS.addEventListener('click', function(){
			buttonS.innerHTML = 'Press the key to bind';
			document.addEventListener('keydown',bindShoot);
			}, false);
		buttonS.innerHTML = 'Set Shoot Key';
		optionsMenu.appendChild(buttonS);
		//set dash key
		var buttonD = document.createElement("button");
		buttonD.addEventListener('click', function(){
			buttonD.innerHTML = 'Press the key to bind';
			document.addEventListener('keydown',bindDash);
			}, false);
		buttonD.innerHTML = 'Set Dash Key';
		optionsMenu.appendChild(buttonD);
		}
	else{
		document.body.removeChild(document.getElementById('optionsMenu'));
		optionsButton.innerHTML = 'Options';
		}
	}