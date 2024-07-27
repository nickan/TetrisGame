import { Tetris } from "./tetris.js";
import {
  convertPositionToIndex,
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
} from "./utilities.js";
let hammer;
let requesrId;
let timeoutId;
const tetris = new Tetris();
const cells = document.querySelectorAll(".grid>div");
const btnLeft = document.querySelector(".btn__left");
const btnRight = document.querySelector(".btn__right");
const btnRotate = document.querySelector(".btn__rotate");
const btnSwap = document.querySelector(".btn__swap");
const longPressDuration = 500; 
let longPressTimeout;
initKeydown();
initTouch();
moveDown();

function initKeydown() {
  document.addEventListener("keydown", onKeydown);
}

function onKeydown(event) {
  switch (event.key) {
    case "ArrowUp":
      rotate();
      break;
    case "ArrowDown":
      moveDown();
      break;
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case " ":
      dropDown();
      break;

    default:
      break;
  }
}

function initTouch() {
  document.addEventListener("dbclick", (event) => {
    event.preventDefault();
  });
  hammer = new Hammer(document.querySelector("body"));
  hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

  const threshold = 30;
  let deltaX = 0;
  let deltaY = 0;

  hammer.on("panstart", () => {
    deltaX = 0;
    deltaY = 0;
  });
  hammer.on("panleft", (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveLeft();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });
  hammer.on("panright", (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveRight();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });
  hammer.on("pandown", (event) => {
    if (Math.abs(event.deltaY - deltaY) > threshold) {
      moveDown();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });
  hammer.on("swipedown", (event) => {
    dropDown();
  });
  hammer.on("tap", (event) => {
    rotate();
  });
}

function moveDown() {
  tetris.moveTetraminoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}
function moveLeft() {
  tetris.moveTetraminoLeft();
  draw();
}
function moveRight() {
  tetris.moveTetraminoRight();
  draw();
}

function startLoop() {
  timeoutId = setTimeout(
    () => (requesrId = requestAnimationFrame(moveDown)),
    700
  );
}
function stopLoop() {
  cancelAnimationFrame(requesrId);
  clearTimeout(timeoutId);
}

function rotate() {
  tetris.rotateTetromino();
  draw();
}
function dropDown() {
  tetris.dropTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function draw() {
  cells.forEach((cell) => cell.removeAttribute("class"));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
}

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (!tetris.playfield[row][column]) continue;
      const name = tetris.playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetris.tetromino.name;
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.row + row,
        tetris.tetromino.column + column
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.ghostRow + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.ghostRow + row,
        tetris.tetromino.ghostColumn + column
      );
      cells[cellIndex].classList.add("ghost");
    }
  }
}

function gameOver() {
  stopLoop();
  document.removeEventListener("keydown", onKeydown);
}

document.addEventListener("click", function (event) {
  switch (event.target) {
    case btnRotate:
      rotate();
      break;
    case btnSwap:
        moveDown();
      break;
    case btnLeft:
      moveLeft();
      break;
    case btnRight:
      moveRight();
      break;
    case "":
      dropDown();
      break;

    default:
      break;
  }
});


btnSwap.addEventListener('touchstart', function () {
  longPressTimeout = setTimeout(() => {
    dropDown();
  }, longPressDuration);
});

btnSwap.addEventListener('touchend', function () {
  // Очищаем таймер, если палец убран до наступления longPressDuration
  clearTimeout(longPressTimeout);
});

btnSwap.addEventListener('touchmove', function () {
  // Очищаем таймер, если палец перемещается по экрану
  clearTimeout(longPressTimeout);
});