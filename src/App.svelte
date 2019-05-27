<script>
  import { onMount, onDestroy } from "svelte";
  import {
    ballStart,
    ballStore,
    playerOneStore,
    playerTwoStore,
    scoreStore
  } from "./store.js";
  let canvasDims = {
    w: 800,
    h: 600
  };
  let canvas;
  let canvasContext;
  let ballSub;
  let playerOneSub;
  let playerTwoSub;
  let scoreSub;
  let gameInterval;
  let fps = 30;
  let ball;
  let playerOne;
  let playerTwo;
  let gameStarted;
  let ballPath;
  let score;

  onMount(() => {
    drawCanvas();
    ballSub = ballStore.subscribe(b => {
      ball = b;
      drawGame();
      if (!gameStarted) startGame();
    });
    playerOneSub = playerOneStore.subscribe(p1 => {
      playerOne = p1;
      drawGame();
    });
    playerTwoSub = playerTwoStore.subscribe(p2 => {
      playerTwo = p2;
      drawGame();
    });
    scoreSub = scoreStore.subscribe(s => {
      if (s && (s.p1 >= 5 || s.p2 >= 5)) {
        startGame();
      }
      score = s;
    });
  });

  onDestroy(() => {
    ballSub && ballSub.unsubscribe();
    playerOneSub && playerOneSub.unsubscribe();
    playerTwoSub && playerTwoSub.unsubscribe();
    scoreSub && scoreSub.unsubscribe();
  });

  function resetBall() {
    // TODO Change the speed also
    const speedX = (Math.random() > 0.5 ? 1 : -1) * ballStart.speedX;
    const speedY = (Math.random() < 0.5 ? 1 : -1) * ballStart.speedY;
    return { ...ballStart, speedX, speedY };
  }

  function startGame() {
    if (gameStarted) {
      clearInterval(gameInterval);
      resetBall();
      scoreStore.update(s => ({ p1: 0, p2: 0 }));
    }
    gameStarted = true;
    gameInterval = setInterval(() => {
      ballStore.update(b => {
        // first check if scoreStore?
        if (b.x < 0) {
          scoreStore.update(s => ({ ...s, p2: s.p2 += 1 }));
          return resetBall();
        }
        if (b.x + b.r > canvasDims.w) {
          scoreStore.update(s => ({ ...s, p1: s.p1 += 1 }));
          return resetBall();
        }

        if (ballHitWall(b)) {
          b.speedY = b.speedY * -1;
        } else if (ballHitPaddle(b, playerOne, playerTwo)) {
          b.speedX = b.speedX * -1;
          let deltaY = 1;
          if (b.x < canvasDims.w / 2) {
            deltaY = b.y - (playerOne.y + playerOne.h /2);
          }
          if (b.x > canvasDims.w / 2) {
            deltaY = b.y - (playerTwo.y + playerTwo.h /2);
          }
          b.speedY = deltaY * 0.3;
        }

        return { ...b, x: b.x + b.speedX, y: b.y + b.speedY };
      });
      movePlayerTwo();
    }, 1000 / fps);
  }

  function movePlayerTwo() {
    const diffY = Math.abs(ball.y - (playerTwo.y + playerTwo.h / 2));
    let speedY = 8;
    if (diffY < playerTwo.h / 2) {
      speedY = canvas.width - ball.x <= 25 ? 2 : 4;
    }
    const deltaY = playerTwo.y > ball.y ? -speedY : speedY;
    playerTwoStore.update(p2 => ({ ...p2, y: p2.y + deltaY }));
  }

  function ballHitPaddle(b, p1, p2) {
    const withinYBox =
      ((b.y - b.r > p1.y) && (b.y - b.r < p1.y + p1.h)) ||
      ((b.y - b.r > p2.y) && (b.y - b.r < p2.y + p2.h));
    return withinYBox && ((b.x - b.r <= p1.x + p1.w) || (b.x + b.r >= p2.x));
  }

  function ballHitWall(b) {
    return b.y + b.r > canvasDims.h || b.y + b.r < 0;
  }

  function calculateBallSpeedX(b) {
    return b.x + b.r > canvasDims.w || b.x < 0 ? b.speedX * -1 : b.speedX;
  }

  function calculateBallSpeedY(b) {
    return b.y + b.r > canvasDims.h || b.y < 0 ? b.speedY * -1 : b.speedY;
  }

  // TODO keep reference to the drawn elems?
  function drawGame() {
    drawCanvas();
    ball && drawBall(ball);
    playerOne && drawPlayer(playerOne);
    playerTwo && drawPlayer(playerTwo);
    score && drawScore();
    drawNet();
  }

  function drawNet() {
    for (let i = 0; i < canvasDims.h; i += 40) {
      canvasContext.fillStyle = "white";
      canvasContext.fillRect(canvasDims.w -1, i, 2, 20);
    }
  }

  function drawCanvas() {
    canvas = document.getElementById("game");
    canvasContext = canvas.getContext("2d");
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawScore() {
    canvasContext.fillText(score.p1, 100, 100);
    canvasContext.fillText(score.p2, canvasDims.w - 100, 100);
  }

  function drawBall(b) {
    canvasContext.fillStyle = b.color;
    canvasContext.beginPath();
    canvasContext.arc(b.x, b.y, b.r, 0, Math.PI * 2, true);
    canvasContext.fill();
  }

  function drawPlayer(p) {
    canvasContext.fillStyle = p.color;
    canvasContext.fillRect(p.x, p.y, p.w, p.h);
  }

  function movePlayerOne(e) {
    playerOneStore.update(p1 => ({ ...p1, y: e.y - p1.h / 2 }));
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>

</svelte:head>

<!-- <div class="row">
  <div class="input-field col m3">
    <input placeholder="Ball Speed" id="fps" type="text" bind:value={fps} />
    <label for="fps">Ball Speed</label>
  </div>
  <div class="input-field col m3">
    <button type="button" class="btn" on:click={startGame}>Reset</button>
  </div>
</div> -->

<canvas
  id="game"
  width={canvasDims.w}
  height={canvasDims.h}
  on:mousemove={movePlayerOne} />
