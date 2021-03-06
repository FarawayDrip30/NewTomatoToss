const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class GameObject {
	constructor(x, y, width, height, img, depth = 0, sx = 0, sy = 0, sWidth = 0, sHeight = 0){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.offsetX = 0;
		this.offsetY = 0;
		this.angle = 0;

		this.img = img;
		this.sx = sx;
		this.sy = sy;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
		this.depth = depth;

		this.velX = 0;
		this.velY = 0;
		this.velAng = 0;
	}

	draw(){
		if (this.sWidth == 0) this.sWidth = this.img.width;
		if (this.sHeight == 0) this.sHeight = this.img.height;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.x + this.offsetX, this.y + this.offsetY, this.width, this.height);
		ctx.restore();
	}

	drawMore(img, x, y, width, height, sx, sy, sWidth, sHeight){
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle * Math.PI / 180);
		ctx.translate(-this.x, -this.y);
		ctx.drawImage(img, sx, sy, sWidth, sHeight, x + this.x, y + this.y, width, height);
		ctx.restore();
	}
}

class Player extends GameObject{
	constructor(x, y, width, height, img, sx, sy, sWidth, sHeight, hitX, hitY, hitWidth, hitHeight){
		super(x, y, width, height, img, 0, sx, sy, sWidth, sHeight);

		this.velX = 0;
		this.velY = 0;

		this.facing = "Right";
		this.speed = WALK_SPEED;
		this.isSliding = false;

		this.hitX = hitX;
		this.hitY = hitY;
		this.hitWidth = hitWidth;
		this.hitHeight = hitHeight;
	}

	main(){
		this.move();
		this.x += this.velX;
		this.y += this.velY
		this.hitX += this.velX;
		this.hitY += this.velY
		this.collision();
	}

	draw(){
		super.draw();
		this.drawMore(this.img, 27, 30, 80, 90, 63, 203, 40, 45);
	}

	move(){
		if(rightPressed || this.isSliding && player.facing == "Right"){
			this.velX = this.speed;
		}
		else if(leftPressed || this.isSliding && player.facing == "Left"){
			this.velX = -this.speed;
		}
		else{
			this.velX = 0;
		}
	}

	collision(){
		// Left Wall
		if(this.hitX < 0){
			if(this.isSliding && this.facing == "Left"){
				this.endSlide();
			}
			this.x = 0 + this.x - this.hitX;
			this.hitX = 0;
		}

		// Right Wall
		if(this.hitX + this.hitWidth > canvas.width){
			if(this.isSliding && this.facing == "Right"){
					this.endSlide();
			}
			this.x = canvas.width - this.hitWidth + this.x - this.hitX;
			this.hitX = canvas.width - this.hitWidth;
		}
	}

	startSlide(){
		if (this.hitX > 0 && this.hitX + this.hitWidth < canvas.width) {
			this.speed = SLIDE_SPEED;

			this.hitWidth = this.height;
			this.hitHeight = this.width;
			this.hitY = canvas.height - this.width;

			if(this.facing == "Left"){
				this.angle = 90;
				this.hitX += 0;
				this.y += this.height - this.width;
				this.x += this.height;
			}
			else{
				this.angle = 270;
				this.hitX += this.width - this.height;
				this.y += this.height;
				this.x += this.width - this.height;
			}
			
			this.isSliding = true;
		}
	}
	
	endSlide(){
		this.speed = WALK_SPEED;
		this.angle = 0;

		this.y = canvas.height - this.height;
		if(this.facing == "Left")
			this.x -= this.height;
		else
			this.x += this.height - this.width;

		this.hitX = this.x;
		this.hitY = this.y;
		this.hitWidth = this.width;
		this.hitHeight = this.height;
		
		this.isSliding = false;
	}
}

class Splat extends GameObject{
	constructor(x, y, targetW, targetH, img){
		super(x, y, 0, 0, img, 1);

		this.targetW = targetW;
		this.targetH = targetH;
		this.alpha = 1;
	}

	main(){
		if (this.width < this.targetW * 0.995) {
			// appears
			this.width += (this.targetW - this.width) * 0.2;
			this.height += (this.targetH - this.height) * 0.2;

			this.offsetX = -this.width / 2;
			this.offsetY = -this.height / 2;
		} else if (this.alpha > 0) {
			// fades
			this.alpha -= 0.01;
		} else {
			// ends
			finishedEffects.push(this);
		}
	}

	draw(){
		if (this.alpha > 0) {
			ctx.globalAlpha = this.alpha;
			super.draw();
			ctx.globalAlpha = 1;
		}
	}
}

class Tomato extends GameObject{
	constructor(x, y, width, height, type){
		super(x, y, width, height, TOMATO_IMGS[type], -1);

		this.velX = Math.random() * 3;
		this.velY = 0;
		this.type = type;

		this.offsetX = -this.width / 2;
		this.offsetY = -this.height / 2;

		this.hasScored = false;
	}

	main(){
		this.gravity();
		this.collision();

		this.x += this.velX;
		this.y += this.velY;
		this.angle += this.velAng;
		this.velAng *= 0.995;
		this.velX *= 0.995;
	}

	gravity(){
		this.velY += GRAVITY;
	}

	collision(){
		//Wall & Ceiling
		if(this.x + this.offsetX <= 0){
			this.x = 0 + this.width / 2;
			this.velX = -this.velX;
			this.velAng -= this.velX;
		}

		if(this.x + this.offsetX >= canvas.width - this.width){
			this.x = canvas.width - this.width / 2;
			this.velX = -this.velX;
			this.velAng += this.velY;
		}

		if(this.y + this.offsetY <= 0){
			this.y = 0 + this.height / 2;
			this.velY = -this.velY;
			this.velAng -= this.velY;
		}

		//Player
		if (this.x + this.offsetX <= player.hitX + player.hitWidth
		&& this.x + this.offsetX >= player.hitX - this.width
		&& this.y + this.offsetY >= player.hitY - this.height
		&& this.hasScored == false) {
			this.velY = MIN_BOUNCE + Math.random() * (MAX_BOUNCE - MIN_BOUNCE);
			this.velX += CONTROL * (this.x - (player.hitX + player.hitWidth / 2));
			this.velAng -= player.velX - this.velX;

			score += 10;
			combo += 1;
			this.hasScored = true;
		}

		if (this.velY > 0) {
			this.hasScored = false;
		}

		//Ground
		if (this.y - this.offsetY > canvas.height) {
			combo = 0;
			let splat = new Splat(this.x, this.y, this.width * 2, this.height * 0.75, SPLAT_IMGS[this.type])
			objects.push(splat);
			splattedTomatoes.push(this);
		}
	}
}

//Functions & Code

let rightPressed = false;
let leftPressed = false;
let score = 0;
let combo = 0;

let background = new GameObject(0, 0, canvas.width, canvas.height, BACKGROUND_IMG);
let player = new Player(canvas.width/2, canvas.height - 200, 140, 196, PLAYER_IMG, 134, 100, 70, 98, canvas.width/2, canvas.height - 200, 140, 196);

let objects = [player];
let finishedEffects = [];

let tomatoes = [];
let splattedTomatoes = [];

function main(){
	objects.forEach(o => {o.main()});

	while (combo >= 5) {
		addTomato();
		combo %= 5;
	}

	splattedTomatoes.forEach(deleteTomato);
	splattedTomatoes = [];
	//if (tomatoes.length < 1) return;

	removeFinishedEffects();
	setTimeout(main, 10);
}

function removeFinishedEffects() {
	finishedEffects.forEach(e => {
		let i = objects.indexOf(e);
		objects.splice(i, 1);
	});
	finishedEffects = [];
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (tomatoes.length < 1){
		background.img = GAMEOVER_IMG;
		//background.draw();
		//return;
	}

	background.draw();
	let toDraw = objects.sort((o1, o2) => o1.depth < o2.depth);
	toDraw.forEach(o => {o.draw()});

	ctx.font = "30px Arial";
	ctx.fillText(score, 10, 30);

	setTimeout(draw, 10);
}

function addTomato(){
	let type = 0;
	if (tomatoes.length % 3 == 2) type = 1;

	let tomato = new Tomato(250, 60, 50, 50, type);
	tomatoes.push(tomato);
	objects.push(tomato);

	return tomato;
}

function deleteTomato(tomato){
	let i = tomatoes.indexOf(tomato);
	let j = objects.indexOf(tomato);
	tomatoes.splice(i, 1);
	objects.splice(j, 1);
	
	delete tomato;
}

addTomato();
main();
draw();

//Keyboard Controls

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		if(!player.isSliding){
			rightPressed = true;
			player.facing = "Right";
		}
    }
    else if(INPUT_LEFT.includes(e.key)){
		if(!player.isSliding){
			leftPressed = true;
			player.facing = "Left";
		}
	}
	else if(INPUT_DOWN.includes(e.key)){
		if(player.isSliding == false){
			player.startSlide();
		}
	}
}

function keyUpHandler(e){
	if(INPUT_RIGHT.includes(e.key)){
		rightPressed = false;
	}
    else if(INPUT_LEFT.includes(e.key)){
		leftPressed = false;
	}
	else if(INPUT_DOWN.includes(e.key)){
		if(player.isSliding == true){
			player.endSlide();
		}
	}
}

//Touch & Mouse Controls

document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);

canvas.addEventListener("touchstart", TouchDown, false);
canvas.addEventListener("touchend", TouchUp, false);

function mouseDown(e){
	let rect = canvas.getBoundingClientRect();
    if(e.clientX > rect.left + canvas.width / 2){
		rightPressed = true;
	}
	else if(e.clientX < rect.left + canvas.width / 2){
		leftPressed = true;
	}
}
function mouseUp(e){
	rightPressed = false;
	leftPressed = false;
}

function TouchDown(e){
	let rect = canvas.getBoundingClientRect();
    if(e.touches[0].clientX > rect.left + canvas.width / 2){
		rightPressed = true;
	}
	else if(e.touches[0].clientX < rect.left + canvas.width / 2){
		leftPressed = true;
	}
}
function TouchUp(e){
	rightPressed = false;
	leftPressed = false;
}