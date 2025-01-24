/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

var currentTheme;
var gameOverSfx;
var gameOver = false;
var passed = 0;
var frame = 0;

var arrowColor = rndColor();

var obstacles = [];
var particles = [];
var rotatedSquares = [];
const themes = [];

const playerWidth = 20;
const playerHeight = 20;
const playerXInit = 0;
const playerYInit = Math.floor(Math.random() * (gameHeight - playerHeight));
const gravity = .5;
const gameOverTxt = "Game Over!";

const losing_statements = [
    "atleast you tried.",
    "next time new best.",
    'its ok to lose sometimes. "Descent for the purpose of ascent".',
    "the game over screen, just saying that you lost 1 time. keep try again and again!",
    "game over. but not your spirit.",
    "You learn more from losing than winning",
    "Battles are lost in the same spirit in which they are won.",
    "Losing today, winning tomorrow."
].map((item) => capitalizeText(item));

const sfxs = {
    lose: [],
    jump: new Audio("resources/sfxs/jump_sound.mp3"),
    impact_on_ground: new Audio("resources/sfxs/impact_on_ground.mp3")
}; Object.freeze(sfxs);

const player = {
    width: playerWidth,
    height: playerHeight,
    x: playerXInit,
    y: playerYInit,
    velocityX: 1,
    velocityY: 4,
    maxVelocityX: 10,
    maxVelocityY: -12.5,
    jumpSpeed: { x: 2.5, y: 6 },
    history: [{ x: playerXInit, y: playerYInit + playerHeight / 2 }],
    maxLength: 10,
    init() {
        player.x = playerXInit;
        player.y = Math.floor(Math.random() * (gameHeight - playerHeight));
        player.history = [{ x: player.x, y: player.y + playerHeight / 2 }];
        player.velocityX = 1;
        player.velocityY = 4;
    },
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "gold";
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 0; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.stroke();
    },
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.history.push({ x: this.x, y: this.y + this.height / 2 });

        if (this.history.length > this.maxLength) {
            this.history.shift();
        }

        if (this.y + this.height >= gameHeight) {
            this.velocityY = 0;
            this.y = gameHeight - this.height;
        } else {
            this.velocityY += gravity;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }

        if (this.velocityX > this.maxVelocityX) {
            this.velocityX = this.maxVelocityX;
        }

        if (this.velocityY < this.maxVelocityY) {
            this.velocityY = this.maxVelocityY;
        }

        if (this.velocityX > 2) {
            this.velocityX -= 0.1;
        } else {
            this.velocityX = 2;
        }

        if (this.velocityY < 0 || (this.velocityY > 0 && this.velocityY <= this.jumpSpeed.y)) {
            particles.push(new Particle(player.x + player.width / 2, player.y + player.height / 2));
        }

    }
};

function generateObstacles() {
    var obstacleCount = rndInt(3, 8);
    for (let i = 0; i < obstacleCount; i++) {
        obstacles.push(new Obstacle());
    }
}

function generateRotatedSquares() {
    var amount = rndInt(4, 10);
    for (let i = 0; i < amount; i++) {
        rotatedSquares.push(new rotatedSquare());
    }
}

function handleRotateSquares() {
    rotatedSquares.forEach(square => {
        square.draw();
        square.update();
    });
}

function loadThemes() {
    for (let i = 1; i <= 3; i++) {
        var directory = `resources/themes/theme_${i}/`;
        var background = directory + "background.png";
        var obstacle_texture = directory + "obstacle_texture.png";

        themes.push({ obstacle_texture, background });
    }

    for (let i = 0; i < 3; i++) {
        sfxs.lose.push(new Audio(`resources/sfxs/lose sound effects/lose-${i}.mp3`));
    }
}

function initGame() {
    ctx.fillStyle = "white";
    canvas.width = gameWidth;
    canvas.height = gameHeight;

    loadThemes();
    changeTheme();
    generateObstacles();
    generateRotatedSquares();

    window.addEventListener("keydown", Jump);
    window.addEventListener("keyup", resetJump);

    requestAnimationFrame(Render);
}

function Jump(e) {
    if (e.code == "Space") {
        if (player.velocityY > 0) {
            player.velocityY = 0;
        }

        player.velocityY -= player.velocityY > player.maxVelocityY ? player.jumpSpeed.y : 0;
        player.velocityX += player.velocityX < player.maxVelocityX ? player.jumpSpeed.x : 0;

        if (!sfxs.jump.paused) {
            sfxs.jump.pause();
            sfxs.jump.currentTime = 0;
        }
        sfxs.jump.play();

        window.removeEventListener("keydown", Jump);
    }
}

function resetJump(e) {
    if (e.code == "Space") {
        window.addEventListener("keydown", Jump);
    }
}

function changeTheme() {
    currentTheme = themes[Math.floor(Math.random() * themes.length)];

    canvas.style.backgroundImage = `url(${currentTheme.background})`;

    obstacles = [];
    generateObstacles();
}

function handleObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.draw(ctx);
        if (obstacle.color != "white") {
            ctx.save();
            ctx.beginPath();
            ctx.translate(obstacle.x + 20, obstacle.y);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.textBaseline = "start";
            ctx.fillText("Got You", 0, 0);
            ctx.restore();
        }
    });
}

function handleParticles() {
    if (particles.length) {
        particles.forEach(particle => {
            particle.draw(ctx);
            particle.update();
        });
    }

    particles = particles.filter((particle) => !particle.markedForDeletion);
}

function drawPassedAmount() {
    var txt = `Passed: ${passed}`;

    ctx.font = "20px Arial";
    ctx.textBaseline = "top";
    ctx.textAlign = "start";

    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.rect(0, 0, ctx.measureText(txt).width, 20);
    ctx.fill();

    ctx.strokeStyle = "lightgreen";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillText(txt, 0, 0);

}

function handlePlayer() {
    player.draw(ctx);
    player.update();

    for (let i = 0; i < obstacles.length; i++) {
        if (collisionDetection(player, obstacles[i])) {
            obstacles[i].color = rndColor();
            gameOver = true;
            break;
        }
    }
}

function nextStage() {
    changeTheme();

    if (particles.length) particles = [];

    rotatedSquares = [];
    generateRotatedSquares();

    player.x = 0;
    player.history = [{ x: 0, y: player.y }];
    passed++;
    arrowColor = rndColor();

}



function startNewGame() {

    ctx.clearRect(0, 0, gameWidth, gameHeight);
    arrowColor = rndColor();
    canvas.removeEventListener("click", startNewGame);
    canvas.style.cursor = "auto";
    canvas.removeAttribute("title");

    window.addEventListener("keydown", Jump);
    window.addEventListener("keyup", resetJump);

    if (!gameOverSfx.paused) {
        gameOverSfx.pause();
        gameOverSfx.currentTime = 0;
    }

    gameOverSfx = undefined;

    if (particles.length) {
        particles = [];
    }

    rotatedSquares = [];
    generateRotatedSquares();

    changeTheme();
    generateObstacles();
    player.init();
    passed = 0;
    gameOver = 0;
    requestAnimationFrame(Render);
}

function gameOverState() {
    gameOverDisplay();
    gameOverSfx = sfxs.lose[Math.floor(Math.random() * sfxs.lose.length)];
    gameOverSfx.play();
    canvas.setAttribute("title", "click to start new game.");
    canvas.style.cursor = "pointer";
    canvas.addEventListener("click", startNewGame);

    if (!sfxs.jump.ended) {
        sfxs.jump.pause();
        sfxs.jump.currentTime = 0;
    }

    window.removeEventListener("keydown", Jump);
    window.removeEventListener("keyup", resetJump);
}

function gameOverDisplay() {

    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.375)";
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    const losing_statement = losing_statements[Math.floor(Math.random() * losing_statements.length)];

    ctx.save();
    ctx.beginPath();
    ctx.textBaseline = "top";
    ctx.textAlign = "center";

    var gameOFontSize = 50;

    var statementOffsetY = 10;
    var statementFontSize = 20;

    ctx.font = `${gameOFontSize}px monospace`;
    const gameOverWidth = ctx.measureText(gameOverTxt).width;

    ctx.font = `${statementFontSize}px monospace`;
    const loseTextWidth = ctx.measureText(losing_statement).width;

    const rectWidth = Math.max(gameOverWidth, loseTextWidth);
    const rectHeight = gameOFontSize + statementFontSize + statementOffsetY;

    console.log(`%cgame over width = ${gameOverWidth}\nlose text width ${loseTextWidth}`, "background-color: black; color: white; border: 2.5px solid lightgray;");

    ctx.fillStyle = "green";
    ctx.rect(gameWidth / 2 - rectWidth / 2, gameHeight / 2, rectWidth, rectHeight);
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.fillStyle = "black"
    ctx.fillText(losing_statement, gameWidth / 2, gameHeight / 2 + gameOFontSize + statementOffsetY);

    ctx.font = "50px monospace";
    ctx.fillStyle = "red";
    ctx.fillText(gameOverTxt, gameWidth / 2, gameHeight / 2);

    ctx.restore();
}

function displayArrow() {
    ctx.beginPath();
    ctx.font = "40px Calibri";
    ctx.textBaseline = "middle";



    ctx.fillStyle = arrowColor;
    ctx.fillText("→", gameWidth - ctx.measureText("→").width - 20, gameHeight / 2);

}

function Render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player.x >= gameWidth) nextStage();


    displayArrow();
    handleRotateSquares();
    handleParticles();
    handlePlayer();
    handleObstacles();
    drawPassedAmount();
    frame++;
    if (!gameOver) requestAnimationFrame(Render);
    else gameOverState();
}

initGame();