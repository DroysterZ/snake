// Variáveis globais
// const canvas = document.createElement("canvas");
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
let snake = [];
let food = {};
let score = 0;
let direction = "right";
let speed = 100;
let gameId = null;

let size = 20;
let grid = 20;
let fontSize = 10;
let fontColor = "black";

let minColorSnake = 155;
let maxColorSnake = 205;

// Switches
let gameOver = false;
let drawDist = false;
let canMove = true;

// Inicializa o jogo
function startGame() {
	// Reinicia as variáveis globais
	snake = [];
	food = {};
	score = 0;
	direction = "right";

	// Reinicia os switches
	gameOver = false;
	canMove = true;

	// Define o tamanho do canvas
	canvas.width = grid * size;
	canvas.height = grid * size;
	document.body.appendChild(canvas);

	// Cria a cobrinha
	for (let i = 4; i >= 0; i--) {
		// Precisa colocar o i-1 no X por causa da primeira execução do draw()
		// Ele chama o updateSnake antes de desenhar, aí ele vai começar na sexta casa ao invés da quinta
		snake.push({ x: i - 1, y: 0 });
	}

	// Gera uma posição aleatória para a comida
	generateFood();

	// Desenha o jogo a cada 100 milissegundos
	if (gameId) clearInterval(gameId);
	gameId = setInterval(draw, speed);
}

// Desenha o jogo
function draw() {
	// Limpa o canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Atualiza a posição da cobrinha
	updateSnake();

	// Verifica se a cobrinha colidiu com a borda ou consigo mesma
	checkCollision();

	// Atualiza o placar
	updateScore();

	// Revela os dados na grid, caso esteja habilitado
	if (drawDist) {
		drawDistance();
	}

	// Desenha a cobrinha
	drawSnake()

	// Desenha a comida
	drawFood();

	// Desenha a grid
	drawGrid();
}

// Desenha a grid
function drawGrid() {
	ctx.fillStyle = "black";
	for (let i = 0; i < canvas.width / size; i++) {
		ctx.fillRect(i * size, 0, 1, canvas.height);
		ctx.fillRect(0, i * size, canvas.width, 1);
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
	canMove = true;
}

// Desenha a cobrinha
function drawSnake() {
	let green = minColorSnake;
	let part = Math.round((maxColorSnake - minColorSnake) / snake.length);
	for (let i = 0; i < snake.length; i++) {
		ctx.fillStyle = "rgb(0, " + green + ", 0)";
		ctx.fillRect(snake[i].x * size, snake[i].y * size, size, size);
		green += part;
		if (green > maxColorSnake) green = maxColorSnake;
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
			gameOver = true;
			startGame();
		}
	}

	// Colisão consigo mesma
	for (let i = 1; i < snake.length; i++) {
		if (x === snake[i].x && y === snake[i].y) {
			if (!gameOver) {
				alert("Game Over! Pontuação final: " + score);
				gameOver = true;
				startGame();
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

// Desenha a comida
function drawFood() {
	ctx.fillStyle = "red";
	ctx.fillRect(food.x * size, food.y * size, size, size);
}

function drawDistance() {
	let max = 0.5;
	let maxDist = grid + grid;
	for (let x = 0; x <= grid; x++) {
		for (let y = 0; y <= grid; y++) {
			let distX = Math.abs(food.x - x);
			let distY = Math.abs(food.y - y);
			let dist = distX + distY;

			let opacity = (dist * max / maxDist)
			// ctx.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
			if (dist > 0) {
				let color = (255 - (dist * 5));
				ctx.fillStyle = "rgb(" + color + ", " + color + ", 255)";
				ctx.fillRect(x * size, y * size, size, size);
			}

			ctx.font = fontSize + "px Verdana";
			ctx.fillStyle = fontColor;
			ctx.fillText(dist, (x * size) + (fontSize / 2), (y * size) + fontSize + (fontSize / 2));
		}
	}
}

// Detecta as teclas pressionadas
document.onkeydown = function (event) {
	if (canMove) {
		switch (event.keyCode) {
			case 37:
				if (direction !== "right") {
					direction = "left";
					canMove = false;
				}
				break;
			case 38:
				if (direction !== "down") {
					direction = "up"
					canMove = false;
				};
				break;
			case 39:
				if (direction !== "left") {
					direction = "right"
					canMove = false;
				};
				break;
			case 40:
				if (direction !== "up") {
					direction = "down"
					canMove = false;
				};
				break;
			case 68:
				drawDist = drawDist ? false : true;
				break;
		}
	}
};
