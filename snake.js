// Canvas
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

// Globais
let matrixMap = [];
let matrixDistance = [];
let snake = [];
let food = {};
let path = [];
let direction = "r";
let score = 0;
let steps = 0;
let gameId = null;

// Grid e jogo
let size = 20;
let grid = 20;
let speed = 100;
let initialSize = 1;

let fontSize = 10;
let fontColor = "black";

// Switches
let sw_drawGrid = false;
let sw_drawPath = true;

function startGame() {
	// Reinicia as globais
	matrixMap = [];
	snake = [];
	food = {};
	path = [];
	matrixDistance = [];
	direction = "r";

	// Gera o mapa
	buildMap();

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

	// process();
}

function process() {
	// Reinicia as globais
	canMove = true;

	// Processamento da cobrinha
	snakeProcess();

	// Atualiza a posição da cobrinha
	updateSnake();

	buildMap();

	// Verifica se a cobrinha colidiu com a borda ou consigo mesma
	// checkCollision();

	// Atualiza o placar
	// updateScore();

	// Desenha as informações
	draw();
}

// Gera a matriz do mapa
function buildMap() {
	// matrixMap = [];
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
				let col = checkCollision(neighbors[i].x, neighbors[i].y);
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
	food.x = Math.floor(Math.random() * grid);
	food.y = Math.floor(Math.random() * grid);

	// Se a posição está sobre a cobrinha, reposiciona
	for (let i = 0; i < snake.length; i++) {
		if (food.x === snake[i].x && food.y === snake[i].y) {
			positionFood();
		}
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
		snake.pop();
	} else {
		if (ret.obj == 'wall') {
			gameOver();
		} else {
			generateFood();
		}
	}
}

function checkCollision(x, y) {
	let ret = { collision: false, obj: null };
	if (x == food.x && y == food.y) {
		score++;
		ret.collision = true;
		ret.obj = 'food';
		return ret;
	}

	if (x < 0 || x >= grid || y < 0 || y >= grid) {
		ret.collision = true;
		ret.obj = 'wall';
		return ret;
	}

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
	if (path == null) path = findPath(snake[0], snake.at(-1));
	// if (path == null) path = analyze();

	let nextMove = path[0];

	let nextDirection = '';
	if (nextMove.x > snake[0].x) nextDirection = 'r'
	else if (nextMove.x < snake[0].x) nextDirection = 'l'
	else if (nextMove.y > snake[0].y) nextDirection = 'u'
	else if (nextMove.y < snake[0].y) nextDirection = 'd'
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

function findPath(start, end) {
	let visited = new Array(matrixMap.length).fill(null).map(() => new Array(matrixMap[0].length).fill(false));
	let queue = [{ x: start.x, y: start.y, cost: 0, path: [] }];

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

function analyze() {
	let x = snake[0].x;
	let y = snake[0].y;

	let marginMin = 0;
	let marginMax = grid - 1;

	let options = matrixMap[x][y].neighbors;
	/*
	for (let i = 0; i < options.length; i++) {
		if (options[i].x > x) direction = 'r'
		else if (options[i].x < x) direction = 'l'
		else if (options[i].y > y) direction = 'u'
		else if (options[i].y < y) direction = 'd'
	}
	*/
	/*
	let toRemove = [];
	for (let i = 0; i < options.length; i++) {
		let chance = options[i];
	
		// Verifica se o proximo movimento vai bater na parede
		if (chance.x < marginMin || chance.y < marginMin || chance.x > marginMax || chance.y > marginMax) {
			toRemove.push(i);
		}
	
		// Verifica se o proximo movimento vai bater na cobra
		for (let j = 0; j < snake.length; j++) {
			if (chance.x == snake[j].x && chance.y == snake[j].y) {
				toRemove.push(i);
			}
		}
	}
	
	toRemove = toRemove.filter((elem, index) => toRemove.indexOf(elem) === index);
	toRemove.sort(function (a, b) { return b - a });
	
	for (let i = 0; i < toRemove.length; i++) {
		options.splice(toRemove[i], 1);
	}
	
	let minDist = grid + grid;
	let chosen = {};
	let minDistOptions = [];
	
	for (let i = 0; i < options.length; i++) {
		let chance = options[i];
		if (matrixDistance[chance.x][chance.y] < minDist) {
			minDistOptions = [chance];
			minDist = matrixDistance[chance.x][chance.y];
		} else if (matrixDistance[chance.x][chance.y] == minDist) {
			minDistOptions.push(chance);
		}
	}
	*/
	if (options.length > 1) {
		chosen = options[Math.floor(Math.random() * (options.length))];
	} else {
		chosen = options[0];
	}

	return [chosen];
}

function draw() {
	// Limpa o canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Desenha o que depende de switch
	drawSwitches();

	// Desenha a cobrinha
	drawSnake();

	// Desenha a comida
	drawFood();
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

function drawSwitches() {
	// Desenha o caminho da cobra até a comida
	if (sw_drawPath) {
		drawPath();
	}

	// Desenha a grid
	if (sw_drawGrid) {
		// drawGrid();
	}
}

function drawPath() {
	ctx.fillStyle = "yellow";
	for (let i = 0; i < path.length; i++) {
		ctx.fillRect(path[i].x * size, path[i].y * size, size, size);
	}
}