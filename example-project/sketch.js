let priest;
let demons = [];
let gameStarted = false;
let timeLeft = 30;
let maxDemons = 25;
let spawnedDemons = 0;
let gameOverState = null;
let animationFrame = 0;
let showEndMessageTimer = 60;
let demonSpawnRate = 60;
let speedUpFactor = 1;
let restartButton, ripButton;

function setup() {
  createCanvas(600, 400);
  priest = new Priest();
  textAlign(CENTER, CENTER);
  textSize(32);
  frameRate(30);
  createButtons();
}

function draw() {
  background(20);

  if (gameStarted) {
    fill(255);
    text("Час: " + timeLeft, width / 2, 30);

    if (frameCount % int(demonSpawnRate / speedUpFactor) === 0 && timeLeft > 5) {
      let demonsToSpawn = int(random(1, 4));
      for (let i = 0; i < demonsToSpawn; i++) {
        if (spawnedDemons < maxDemons) {
          demons.push(new Demon());
          spawnedDemons++;
        }
      }
    }

    if (frameCount % 30 === 0 && timeLeft > 0) {
      timeLeft--;
    }

    if (demons.length === 0 && spawnedDemons === maxDemons && gameOverState === null) {
      gameOverState = 'win';
      animationFrame = 0;
      showEndMessageTimer = 90;
      removeButtons();
    }

    if (timeLeft <= 0 && gameOverState === null) {
      gameOverState = 'lose';
      animationFrame = 0;
      showEndMessageTimer = 90;
      removeButtons();
    }

    if (gameOverState === null) {
      priest.move();
      priest.display();

      for (let i = demons.length - 1; i >= 0; i--) {
        demons[i].display();
        if (priest.hits(demons[i])) {
          demons.splice(i, 1);
          speedUpFactor += 0.2;
        }
      }
    } else {
      drawEndSequence();
    }
  } else {
    fill(255);
    textSize(48);
    text("ГРІШНА МІСІЯ", width / 2, height / 2 - 50);
    textSize(28);
    text("Натисни, щоб почати гру", width / 2, height / 2 + 50);
  }
}

function drawEndSequence() {
  if (showEndMessageTimer > 0) {
    showEndMessageTimer--;

    if (gameOverState === 'lose') {
      fill(255, 0, 255);
      textSize(40);
      text("ТИ НЕ ЧИСТИЙ", width / 2, height / 2);
    } else if (gameOverState === 'win') {
      fill(0, 255, 255);
      textSize(40);
      text("ТИ ОЧИСТИВ МІСТО", width / 2, height / 2);
    }

    priest.display();
  } else {
    animationFrame++;

    if (gameOverState === 'lose') {
      if (animationFrame < 60 && animationFrame % 10 < 5) {
        fill(random(200, 255), 0, random(100, 255));
        ellipse(priest.x, priest.y, priest.size + random(-5, 5));
      } else if (animationFrame === 60) {
        priest.becomeZombie();
        priest.display();
        showRestartBible();
      } else {
        priest.display();
      }
    } else if (gameOverState === 'win') {
      priest.display();

      if (animationFrame === 30) {
        drawAngelAndDevil();
      }

      if (animationFrame > 60 && animationFrame < 120) {
        stroke(255, 255, 0);
        strokeWeight(3);
        line(priest.x - 60, priest.y - 70, priest.x, priest.y);
        line(priest.x + 60, priest.y - 70, priest.x, priest.y);
      }

      if (animationFrame === 120) {
        fill(255, 0, 0);
        ellipse(priest.x, priest.y, priest.size + 30);
        showRipGrave();
      }
    }
  }
}

function drawAngelAndDevil() {
  textSize(40);
  text("👼", priest.x - 60, priest.y - 70);
  text("👿", priest.x + 60, priest.y - 70);
}

function mousePressed() {
  if (!gameStarted) {
    startGame();
  }
}

function startGame() {
  gameStarted = true;
  timeLeft = 30;
  spawnedDemons = 0;
  demons = [];
  gameOverState = null;
  priest = new Priest();
  animationFrame = 0;
  showEndMessageTimer = 60;
  speedUpFactor = 1;
  removeButtons();
}

class Priest {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.size = 40;
    this.speed = 5.5;
    this.isZombie = false;
  }

  display() {
    fill(this.isZombie ? color(80, 200, 80) : 255);
    ellipse(this.x, this.y, this.size);

    push();
    stroke(0);
    strokeWeight(3);
    fill(this.isZombie ? color(180, 0, 0) : color(255, 255, 0));
    let cx = this.x;
    let cy = this.y - 12;
    rectMode(CENTER);
    rect(cx, cy, 6, 24, 3);
    rect(cx, cy, 20, 6, 3);
    pop();
  }

  move() {
    if (this.isZombie) return;

    let dx = 0;
    let dy = 0;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx -= 1;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx += 1;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy -= 1;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy += 1;

    if (dx !== 0 || dy !== 0) {
      let len = sqrt(dx * dx + dy * dy);
      this.x += (this.speed * dx) / len;
      this.y += (this.speed * dy) / len;
    }

    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }

  hits(demon) {
    let d = dist(this.x, this.y, demon.x, demon.y);
    return d < this.size;
  }

  becomeZombie() {
    this.isZombie = true;
  }
}

class Demon {
  constructor() {
    this.x = random(50, width - 50);
    this.y = random(50, height - 100);
    this.size = 40;
  }

  display() {
    textSize(32);
    text("👿", this.x, this.y);
  }
}

function createButtons() {
  restartButton = createButton("Holy Bible");
  restartButton.position(width + 10, 50);
  restartButton.mousePressed(startGame);
  restartButton.hide();

  ripButton = createButton("RIP");
  ripButton.position(width + 10, 100);
  ripButton.mousePressed(() => window.location.href = "/");
  ripButton.hide();
}

function showRestartBible() {
  restartButton.show();
  ripButton.hide();
}

function showRipGrave() {
  ripButton.show();
  restartButton.hide();
}

function removeButtons() {
  if (restartButton) restartButton.hide();
  if (ripButton) ripButton.hide();
}
