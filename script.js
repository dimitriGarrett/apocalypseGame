var canvas = document.getElementById("canv");

var ctx;

var cwidth;
var cheight;

function lerp(a, b, f)
{
	return (a * (1.0 - f)) * (b - f);
}

class Entity
{
	constructor(health, damage, x, y, w, h, col = "rgb(0, 0, 0)")
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		
		this.health = health;
		this.damage = damage;
		
		this.color = col;
		
		//this.style = s;
		
		this.drawHealth = true;
		
		Entity.allEntities.push(this);
	}
	
	draw()
	{
		ctx.fillStyle = this.color;
		
		ctx.beginPath();
		
		ctx.rect(this.x, this.y, this.w, this.h);
		
		//ctx.fillStyle = "rgb(125, 125, 125)";
		ctx.fill();
		
		//ctx.closePath();
		
		ctx.fillStyle = "rgb(255, 0, 0)";
		
		if (!this.drawHealth)
		{
			return;
		}
		
		ctx.beginPath();
		
		var healthWidthMax = this.w + this.w / 2.0;
		
		var healthWidth = this.health;
		
		if (this.health > healthWidthMax)
		{
			healthWidth = healthWidthMax;
		}
		
		ctx.rect(this.x + this.w / 2.0 - healthWidth / 2.0, this.y + this.h / 2.0 - 20, healthWidth, 2);
		
		//ctx.fillStyle = "rgb(125, 125, 125)";
		ctx.fill();
	}
	
	update()
	{
		
	}
}

Entity.allEntities = [];

class Line
{
	constructor(startX, startY, endX, endY)
	{
		this.x = startX;
		this.y = startY;
		
		this.dx = endX;
		this.dy = endY;
	}
	
	draw()
	{
		ctx.strokeStyle = "red";
		ctx.lineWidth = 5;
		
		ctx.beginPath();
		
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.dx, this.dy);
		
		ctx.stroke();
	}
}

var attackLine = null;

class Enemy extends Entity
{
	constructor(health, damage, x, y, w, h)
	{
		super(health, damage, x, y, w, h, "rgb(0, 255, 0)");
		
		this.hasBeenAttacked = false;
		
		Enemy.allEnemies.push(this);
	}
	
	moveto(dx, dy)
	{
		this.x = lerp(this.x, dx, 0.0125);
		this.y = lerp(this.y, dy, 0.0125);
	}
	
	deleteSelf()
	{
		var index = Enemy.allEnemies.indexOf(this);
		if (index !== -1)
		{
			Enemy.allEnemies.splice(index, 1);
		}
		
		index = Entity.allEntities.indexOf(this);
		if (index !== -1)
		{
			Entity.allEntities.splice(index, 1);
		}
	}
	
	update()
	{
		if (this.x + this.w > mainPlayer.x && this.x < mainPlayer.x + mainPlayer.w)
		{
			if (this.y + this.h > mainPlayer.y && this.y < mainPlayer.y + mainPlayer.h)
			{
				//collision
				mainPlayer.health -= this.damage;
				
				this.deleteSelf();
				
				return;
			}
		}
		
		if (attackLine == null)
		{
			this.hasBeenAttacked = false;
			
			return;
		}
		
		if (this.hasBeenAttacked)
		{
			return;
		}
		
		var atopx;
		var atopy;
		var atobx;
		var atoby;
		
		atopx = this.x - attackLine.x;
		atopy = this.y - attackLine.y;
		atobx = attackLine.dx - attackLine.x;
		atoby = attackLine.dy - attackLine.y;
		
		var atob2 = atobx * atobx + atoby * atoby;
		var atopdotatob = atopx * atobx + atopy * atoby;
		var t = atopdotatob / atob2;
		
		if (t > 1)
		{
			t = 1;
		}
		
		else if (t < 0)
		{
			t = 0;
		}
		
		var closestX = attackLine.x + atobx * t;
		var closestY = attackLine.y + atoby * t;
		
		var dist = (closestX - this.x) * (closestX - this.x) + (closestY - this.y) * (closestY - this.y);
		
		dist = Math.sqrt(dist);
		
		var radius = 0;
		
		var w = this.w / 2.0;
		var h = this.h / 2.0;
		
		radius = (w * w) + (h * h);
		radius = Math.sqrt(radius);

		if (dist <= radius)
		{
			this.health -= mainPlayer.damage;
			
			this.hasBeenAttacked = true;
			
			//attackLine = null;

			//wwwwwalert(this.health);
			
			if (this.health > 0)
			{
				return;
			}
			
			this.deleteSelf();
			
			return;
		}
	}
}

Enemy.allEnemies = [];

var mainPlayer;

var cantimeout = true;

var count = 0;

var beginHealth = 0;

function update()
{
	ctx.clearRect(0, 0, cwidth, cheight);
	
	for (let i = 0; i < Enemy.allEnemies.length; i++)
	{
		var en = Enemy.allEnemies[i];
		
		en.moveto(mainPlayer.x + mainPlayer.w / 2, mainPlayer.y + mainPlayer.h / 2);
	}
	
	for (let i = 0; i < Entity.allEntities.length; i++)
	{
		var ent = Entity.allEntities[i];
		
		ent.update();
		
		ent.draw();
	}
	
	if (attackLine != null)
	{
		attackLine.draw();
		
		if (cantimeout)
		{
			setTimeout(function()
			{
				attackLine = null;
			}, 100);
			
			cantimeout = false;
		}
	}
	
	ctx.beginPath();
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(8, 8, beginHealth + 4, 14);
	//ctx.fill();
	
	ctx.fillStyle = "rgb(255, 0, 0)";
	ctx.fillRect(10, 10, mainPlayer.health, 10);
	//ctx.fill();
	
	ctx.closePath();
	
	if (count >= 120)
	{
		count = 0;
		
		var x = Math.floor(Math.random() * cwidth);
		var y = Math.floor(Math.random() * cheight);
		
		new Enemy(10, 5, x, y, 10, 10);
	}
	
	count++;
	
	requestAnimationFrame(update);
}

var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;

var shiftPressed = false;
var controlPressed = false;

var canmove = true;

function lerp(a, b, f)
{
	return (a * (1.0 - f)) + (b * f);
}

function start()
{
	//canvas.height = document.screen.height;
	
	var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;
	
	canvas.width = width;
	canvas.height = height;
	
	ctx = canvas.getContext("2d");
	
	cwidth = canvas.width;
	cheight = canvas.height;

	mainPlayer = new Entity(100, 15, 10, 10, 20, 20);
	
	mainPlayer.update = function()
	{
		var speed = 9;
		
		if (shiftPressed)
		{
			speed *= 0.5;
		}
		
		if (controlPressed && shiftPressed)
		{
			speed *= 2;
		}
		
		else if (controlPressed)
		{
			speed *= 1.5;
		}
		
		if (canmove)
		{
			if (rightPressed)
			{
				mainPlayer.x += speed;
			}
			
			if (leftPressed)
			{
				mainPlayer.x -= speed;
			}
			
			if (upPressed)
			{
				mainPlayer.y += speed;
			}
			
			if (downPressed)
			{
				mainPlayer.y -= speed;
			}
		}
		
		if (mainPlayer.health <= 0)
		{
			alert("GAME OVER!");
			
			window.location.reload();
		}
	};
	
	mainPlayer.damage = 5;
	mainPlayer.health = 100;
	
	beginHealth = mainPlayer.health;
	
	mainPlayer.drawHealth = false;
	
	//var enemy = new Enemy(10, 3, 500, 200, 20, 20);
	
	update();
}

function keydownCallback(event)
{
	
	
	if (event.keyCode == 39 || event.keyCode == 68)
	{
		rightPressed = true;
	}
	
	if (event.keyCode == 37 || event.keyCode == 65)
	{
		leftPressed = true;
	}

	if (event.keyCode == 40 || event.keyCode == 83) 
	{
		upPressed = true;
	}	
	
	if (event.keyCode == 38 || event.keyCode == 87) 
	{
		downPressed = true;
	}
	
	if (event.keyCode == 16)
	{
		shiftPressed = true;
	}
	
	if (event.keyCode == 17)
	{
		controlPressed = true;
	}
}

function keyupCallback(event)
{	
	if (event.keyCode == 39 || event.keyCode == 68)
	{
		rightPressed = false;
	}
	
	else if (event.keyCode == 37 || event.keyCode == 65)
	{
		leftPressed = false;
	}

	if (event.keyCode == 40 || event.keyCode == 83) 
	{
		upPressed = false;
	}	
	
	else if (event.keyCode == 38 || event.keyCode == 87) 
	{
		downPressed = false;
	}
	
	if (event.keyCode == 16)
	{
		shiftPressed = false;
	}
	
	if (event.keyCode == 17)
	{
		controlPressed = false;
	}
}

function resize(event)
{
	var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;
	
	canvas.width = width;
	canvas.height = height;
	
	ctx = canvas.getContext("2d");
	
	cwidth = canvas.width;
	cheight = canvas.height;
}

function blurCallback()
{
	rightPressed = false;
	leftPressed = false;
	upPressed = false;
	downPressed = false;
}

function mousedownCallback(event)
{
	if (event.button == 0)
	{
		if (attackLine == null)
		{
			attackLine = new Line(mainPlayer.x + mainPlayer.w / 2.0, mainPlayer.y + mainPlayer.h / 2.0, event.x, event.y);
			
			cantimeout = true;
		}
		
		else
		{
			
		}
	}
	
	else if (event.button == 2)
	{
		rightPressed = false;
		leftPressed = false;
		upPressed = false;
		downPressed = false;
	}
}

document.addEventListener("keydown", keydownCallback);
document.addEventListener("keyup", keyupCallback);

window.addEventListener("resize", resize);
window.addEventListener("blur", blurCallback);

document.addEventListener("mousedown", mousedownCallback);

window.onload = start();
