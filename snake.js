// Variáveis globais
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let snake = [];
let food = {};
let score = 0;
let direction = "right";
let speed = 100;

let size = 20;
let grid = 20;
let fontSize = 10;
let fontColor = "black";

// Switches
let gameOver = false;
let drawDist = false;

// Inicializa o jogo
function startGame() {
	// Define o tamanho do canvas
	canvas.width = grid * size;
	canvas.height = grid * size;
	document.body.appendChild(canvas);

	// Cria a cobrinha
	for (let i = 4; i >= 0; i--) {
		snake.push({ x: i, y: 0 });
	}

	// Gera uma posição aleatória para a comida
	generateFood();

	// Desenha o jogo a cada 100 milissegundos
	setInterval(draw, speed);
}

// Desenha o jogo
function draw() {
	// Limpa o canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Desenha a grid
	for (let i = 0; i < canvas.width / size; i++) {
		ctx.fillStyle = "black";
		ctx.fillRect(i * size, 0, 1, canvas.height);

		ctx.fillRect(0, i * size, canvas.width, 1);
	}

	// Atualiza a posição da cobrinha
	updateSnake();

	// Desenha a cobrinha
	for (let i = 0; i < snake.length; i++) {
		ctx.fillStyle = "green";
		ctx.fillRect(snake[i].x * size, snake[i].y * size, size, size);
	}

	// Desenha a comida
	ctx.fillStyle = "red";
	ctx.fillRect(food.x * size, food.y * size, size, size);

	// Verifica se a cobrinha colidiu com a borda ou consigo mesma
	checkCollision();

	// Atualiza o placar
	updateScore();

	console.log(drawDist);
	if (drawDist) {
		drawDistance();
	}
}

// Atualiza a posição da cobrinha
function updateSnake() {
	let x = snake[0].x;
	let y = snake[0].y;

	// Move a cobrinha na direção atual
	if (direction === "right") x++;
	else if (direction === "left") x--;
	else if (direction === "up") y--;
	else if (direction === "down") y++;

	// Adiciona a nova cabeça da cobrinha
	let newHead = { x: x, y: y };
	snake.unshift(newHead);

	// Remove o rabo da cobrinha se ela não comer a comida
	if (x !== food.x || y !== food.y) {
		snake.pop();
	} else {
		// A cobrinha comeu a comida, então aumenta o placar
		score++;

		// Gera uma nova posição para a comida
		generateFood();
	}
}

// Verifica se a cobrinha colidiu com a borda ou consigo mesma
function checkCollision() {
	let x = snake[0].x;
	let y = snake[0].y;

	// Colisão com a borda
	if (x < 0 || x >= canvas.width / size || y < 0 || y >= canvas.height / size) {
		if (!gameOver) {
			alert("Game Over! Pontuação final: " + score);
			// window.location.reload();
			gameOver = true;
		}
	}

	// Colisão consigo mesma
	for (let i = 1; i < snake.length; i++) {
		if (x === snake[i].x && y === snake[i].y) {
			if (!gameOver) {
				alert("Game Over! Pontuação final: " + score);
				// window.location.reload();
				gameOver = true;
			}
		}
	}
}

// Atualiza o placar
function updateScore() {
	document.getElementById("score").innerHTML = "Placar: " + score;
}

// Gera uma posição aleatória para a comida
function generateFood() {
	food.x = Math.floor(Math.random() * (canvas.width / size));
	food.y = Math.floor(Math.random() * (canvas.height / size));

	// Verifica se a nova posição da comida está sobre a cobrinha
	for (let i = 0; i < snake.length; i++) {
		if (food.x === snake[i].x && food.y === snake[i].y) {
			generateFood();
		}
	}
}

function drawDistance() {
	for (let x = 0; x <= grid; x++) {
		for (let y = 0; y <= grid; y++) {
			let distX = Math.abs(food.x - x);
			let distY = Math.abs(food.y - y);
			let dist = distX + distY;
			ctx.font = fontSize + "px Verdana";
			ctx.fillStyle = fontColor;
			ctx.fillText(dist, (x * size) + (fontSize / 2), (y * size) + fontSize + (fontSize / 2));
		}
	}
}

// Detecta as teclas pressionadas
document.onkeydown = function (event) {
	console.log(event.keyCode);
	switch (event.keyCode) {
		case 37:
			if (direction !== "right") direction = "left";
			break;
		case 38:
			if (direction !== "down") direction = "up";
			break;
		case 39:
			if (direction !== "left") direction = "right";
			break;
		case 40:
			if (direction !== "up") direction = "down";
			break;
		case 68:
			drawDist = drawDist ? false : true;
			break;
	}
};
