// Canvas
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

// Globais
let matrixMap = [];
let matrixDistance = [];
let foodPositions = [];
let snake = [];
let food = {};
let path = [];
let lastPosition = {};
let direction = "r";
let score = 0;
let steps = 0;
let gameId = null;

// Grid e jogo
let size = 20;
let grid = 20;
let speed = 1;
let initialSize = 1;

let fontSize = 10;
let fontColor = "black";

// Switches
let sw_drawGrid = false;
let sw_drawPath = true;

// Validacoes extras
let canMove = true;
let scored = true;

function startGame() {
	// Reinicia as globais
	matrixMap = [];
	matrixDistance = [];
	snake = [];
	food = {};
	path = [];
	lastPosition = {};
	direction = "r";
	score = 0;
	steps = 0;

	// Define o tamanho do canvas
	canvas.width = grid * size;
	canvas.height = grid * size;

	// Cria a cobrinha
	for (let i = initialSize - 1; i >= 0; i--) {
		snake.push({ x: i, y: 0 });
	}

	// Gera uma posição aleatória para a comida
	generateFood();

	// Desenha o jogo a cada x milissegundos
	if (gameId) clearInterval(gameId);
	gameId = setInterval(process, speed);
}

function process() {
	// Reinicia as globais
	canMove = true;
	scored = true;

	// Processamento da cobrinha
	snakeProcess();

	// Atualiza a posição da cobrinha
	updateSnake();

	// Atualiza o placar
	// updateScore();

	// Desenha as informações
	draw();
}

// Gera a matriz do mapa
function buildMap(tail = false) {
	for (x = 0; x < grid; x++) {
		matrixMap[x] = [];
		for (y = 0; y < grid; y++) {
			matrixMap[x][y] = {};
			let neighbors = [];
			if (x % 2 == 0) {
				neighbors.push({ x: x, y: y - 1 });
			} else {
				neighbors.push({ x: x, y: y + 1 });
			}

			if (y % 2 == 0) {
				neighbors.push({ x: x + 1, y: y });
			} else {
				neighbors.push({ x: x - 1, y: y });
			}

			let toRemove = [];
			for (let i = 0; i < neighbors.length; i++) {
				let col = checkCollision(neighbors[i].x, neighbors[i].y, tail);
				if (col.collision && col.obj == 'wall') {
					toRemove.push(i);
				}
			}
			toRemove.reverse();
			for (let i = 0; i < toRemove.length; i++) {
				neighbors.splice(toRemove[i], 1);
			}

			matrixMap[x][y] = { neighbors: neighbors };
		}
	}
}

// Mapeia os locais disponiveis para gerar a comida
function buildFoodMap() {
	foodPositions = [];
	for (let x = 0; x < grid; x++) {
		for (let y = 0; y < grid; y++) {
			if (checkCollision(x, y).collision == false) {
				foodPositions.push({ x: x, y: y });
			}
		}
	}
}

// Gera uma posição aleatória para a comida e calcula a distancia dos pontos do mapa até ela
function generateFood() {
	matrixDistance = [];
	positionFood();

	for (let x = 0; x < grid; x++) {
		matrixDistance[x] = [];
		for (let y = 0; y < grid; y++) {
			matrixDistance[x][y] = heuristic(food, { x: x, y: y });
		}
	}
}

// Posiciona a comida no mapa
function positionFood() {
	buildFoodMap();
	if (foodPositions.length > 0) {
		let index = Math.floor(Math.random() * foodPositions.length);
		food = foodPositions.splice(index, 1)[0];
	} else {
		food = { x: -1, y: -1 };
	}
}

// Atualiza a posição da cobra
function updateSnake() {
	steps++;
	let x = snake[0].x;
	let y = snake[0].y;
	if (direction == 'u') snake.unshift({ x: x, y: y + 1 });
	if (direction == 'd') snake.unshift({ x: x, y: y - 1 });
	if (direction == 'l') snake.unshift({ x: x - 1, y: y });
	if (direction == 'r') snake.unshift({ x: x + 1, y: y });

	x = snake[0].x;
	y = snake[0].y;

	let ret = checkCollision(x, y);
	if (!ret.collision) {
		lastPosition = snake.pop();
	} else {
		if (ret.obj == 'wall') {
			gameOver();
		} else {
			generateFood();
		}
	}

	if (food.x == -1 && food.y == -1) {
		gameOver();
	}
}

function checkCollision(x, y, tail = false) {
	let ret = { collision: false, obj: null };
	if (x == food.x && y == food.y) {
		if (scored && snake[0].x == food.x && snake[0].y == food.y) {
			scored = false;
			score++;
		}
		ret.collision = true;
		ret.obj = 'food';
		return ret;
	}

	if (x < 0 || x >= grid || y < 0 || y >= grid) {
		ret.collision = true;
		ret.obj = 'wall';
		return ret;
	}

	let length = snake.length;
	if (tail) length--;
	for (let i = 1; i < snake.length; i++) {
		if (x == snake[i].x && y == snake[i].y) {
			ret.collision = true;
			ret.obj = 'wall';
			return ret;
		}
	}

	return ret;
}

function gameOver() {
	alert('FIM DE JOGO!\nPontuação: ' + score);
	startGame();
}


// Processamento da cobrinha
function snakeProcess() {
	path = findPath(snake[0], food);
	if (path == null) path = findPath(snake[0], lastPosition);
	if (path == null) path = findPath(snake[0], snake[snake.length - 1], true);

	let nextDirection = '';

	if (path != null && path.length > 0) {
		let nextMove = path[1] ?? path[0];
		if (nextMove.x > snake[0].x) nextDirection = 'r'
		else if (nextMove.x < snake[0].x) nextDirection = 'l'
		else if (nextMove.y > snake[0].y) nextDirection = 'u'
		else if (nextMove.y < snake[0].y) nextDirection = 'd'
	} else {
		nextDirection = direction;
	}
	updateMove(nextDirection);
}

function heuristic(orig, dest) {
	let distX = Math.abs(orig.x - dest.x);
	let distY = Math.abs(orig.y - dest.y);
	let dist = (distX + distY) ** 2;
	return dist;
}

class Node {
	constructor(x, y, g, h, parent) {
		this.x = x;
		this.y = y;
		this.g = g;
		this.h = h;
		this.f = g + h;
		this.parent = parent;
	}
}

function findPath(start, end, tail = false) {
	// Remapeia a matriz
	buildMap(tail);

	let visited = new Array(matrixMap.length).fill(null).map(() => new Array(matrixMap[0].length).fill(false));
	let queue = [{ x: start.x, y: start.y, cost: 0, path: [start] }];

	while (queue.length > 0) {
		queue.sort((a, b) => a.cost - b.cost); // ordena a fila pelo menor custo

		let current = queue.shift();

		if (current.x === end.x && current.y === end.y) {
			return current.path; // retorna o caminho quando encontrar o destino
		}

		if (!visited[current.x][current.y]) {
			visited[current.x][current.y] = true;

			let neighbors = matrixMap[current.x][current.y].neighbors;

			neighbors.forEach((neighbor) => {
				let neighborX = neighbor.x;
				let neighborY = neighbor.y;

				if (!visited[neighborX][neighborY]) {
					let cost = current.cost + 1;
					let path = [...current.path, { x: neighborX, y: neighborY }];
					queue.push({ x: neighborX, y: neighborY, cost, path });
				}
			});
		}
	}

	return null; // retorna null se não encontrar um caminho
}

// Atualiza a direcao de movimento
function updateMove(input) {
	if (canMove) {
		let reverses = [];
		reverses['u'] = 'd';
		reverses['d'] = 'u';
		reverses['l'] = 'r';
		reverses['r'] = 'l';

		if (input != reverses[direction]) {
			direction = input;
			canMove = false;
		}
	}
}

// Gerencia a parte grafica
function draw() {
	// Limpa o canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Desenha o que depende de switch
	drawSwitches();

	// Desenha a comida
	drawFood();

	// Desenha a cobrinha
	drawSnake();
}

// Desenha a cobrinha
function drawSnake() {
	let green = 255;
	let blue = 0;
	let part = 255 / snake.length;
	for (let i = 0; i < snake.length; i++) {
		ctx.fillStyle = "rgb(0, " + green + ", " + blue + ")";
		ctx.fillRect(snake[i].x * size, snake[i].y * size, size, size);
		green -= part;
		blue += part;
		if (green < 0) green = 0;
		if (blue > 255) blue = 255;
	}
}

// Desenha a comida
function drawFood() {
	ctx.fillStyle = "red";
	ctx.fillRect(food.x * size, food.y * size, size, size);
}

// Desenha tudo que pode ser habilitado ou desabilitado
function drawSwitches() {
	// Desenha o caminho da cobra até a comida
	if (sw_drawPath) {
		drawPath();
	}

	// Desenha a grid
	if (sw_drawGrid) {
		drawGrid();
	}
}

// Desenha o caminho identificado pela cobra
function drawPath() {
	if (path) {
		ctx.fillStyle = "yellow";
		for (let i = 0; i < path.length; i++) {
			ctx.fillRect(path[i].x * size, path[i].y * size, size, size);
		}
	}
}

// Desenha a grid
function drawGrid() {
	ctx.fillStyle = "black";
	for (let i = 0; i < canvas.width / size; i++) {
		ctx.fillRect(i * size, 0, 1, canvas.height);
		ctx.fillRect(0, i * size, canvas.width, 1);
	}
}