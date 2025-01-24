class Rgba {
    constructor(red, green, blue, opacity) {
        this.opacity = opacity;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    set setOpacity(newOpacity) {
        this.opacity = newOpacity;
    }
    set setRed(newRed) {
        this.red = newRed;
    }
    set setGreen(newGreen) {
        this.green = newGreen;
    }
    set setBlue(newBlue) {
        this.blue = newBlue;
    }
    get getFullRgba() {
        return `rgba(${this.red},${this.green},${this.blue},${this.opacity})`;
    }
}

class Obstacle {
    constructor() {
        this.width = Math.random() * 50 + 25;
        this.height = Math.random() * 200 + 50;
        this.x = Math.random() * (gameWidth - this.width - playerWidth * 2) + playerWidth * 2;
        this.y = Math.floor(Math.random() * 2) ? 0 : (gameHeight - this.height);
        this.color = "white";
        this.texture = new Image();
        this.texture.src = currentTheme.obstacle_texture;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);

        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Particle {
    constructor(x, y) {
        this.radius = 10;
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.color = new Rgba(rndInt(0, 255), rndInt(0, 255), rndInt(0, 255), 1);
        this.strokeColor = new Rgba(0, 0, 0, 1);
        this.markedForDeletion = false;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color.getFullRgba;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.strokeColor.getFullRgba;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    update() {
        this.radius -= 0.1;
        this.color.opacity -= 0.025;
        this.strokeColor.opacity -= 0.025;
        if (this.radius <= 0) {
            this.markedForDeletion = true;
        }
    }
}

class rotatedSquare {
    constructor() {
        this.size = Math.random() * 20 + 20;
        this.width = this.size;
        this.height = this.size;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.width - this.height);
        this.color = new Rgba(rndInt(0, 255), rndInt(0, 255), rndInt(0, 255), Math.random());
        this.angle = 0;
    }
    draw() {
        ctx.save();

        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color.getFullRgba;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.restore();
    }
    update() {
        if (frame % 4 == 0) {
            this.angle++;
            if (this.angle > Math.PI * 2) {
                this.angle = 0;
            }
        }
    }
}