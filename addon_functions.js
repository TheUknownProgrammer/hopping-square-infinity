function rndColor() {
    var rgb1 = Math.floor(Math.random() * 256);
    var rgb2 = Math.floor(Math.random() * 256);
    var rgb3 = Math.floor(Math.random() * 256);
    return `rgb(${rgb1},${rgb2},${rgb3})`;
}

function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function collisionDetection(rect1, rect2) {
    return rect1.x + rect1.width > rect2.x && rect1.x < rect2.width + rect2.x && rect1.y + rect1.height > rect2.y && rect1.y < rect2.height + rect2.y;
}

function capitalizeText(txt) {
    var txtArray = txt.split(" ");
    for (let i = 0; i < txtArray.length; i++) {
        txtArray[i] = txtArray[i][0].toUpperCase() + txtArray[i].substring(1, txtArray[i].length);
    }
    return txtArray.join(" ");
}