"use strict";
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var counter = document.getElementById('counter');
var colorPicker = document.getElementById('colorPicker');
var gravitySlider = document.getElementById('gravitySlider');
var gravityValue = document.getElementById('gravityValue');
var sizeSlider = document.getElementById('sizeSlider');
var sizeValue = document.getElementById('sizeValue');
var clearButton = document.getElementById('clearButton');
var controlsContainer = document.getElementById('controls');
var toggleControlsButton = document.getElementById('toggleControlsButton');
// Set canvas size to the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Default gravity value (Earth gravity in pixels/s²)
var gravity = 9.81 * 100;
var damping = 0.75;
var friction = 0.99;
var restThreshold = 0.1;
// Array to store all circles
var circles = [];
// Circle class definition
var Circle = /** @class */ (function () {
    function Circle(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = Math.random() * 100 - 50; // Random horizontal velocity
        this.vy = 0; // Initial vertical velocity
        this.color = color;
        this.isAtRest = false;
    }
    // Check if a point is inside the circle
    Circle.prototype.isPointInside = function (px, py) {
        var dx = px - this.x;
        var dy = py - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    };
    // Update the circle's position
    Circle.prototype.update = function (deltaTime) {
        if (!this.isAtRest) {
            this.vy += gravity * deltaTime;
            this.vx *= friction;
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
            // Check for collision with the canvas edges
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -damping;
            }
            else if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -damping;
            }
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -damping;
                if (Math.abs(this.vy) < restThreshold && Math.abs(this.vx) < restThreshold) {
                    this.isAtRest = true;
                    this.vy = 0;
                    this.vx = 0;
                }
                else {
                    this.isAtRest = false;
                }
            }
        }
    };
    // Draw the circle
    Circle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    // Check for collision with another circle
    Circle.prototype.checkCollision = function (other) {
        var dx = other.x - this.x;
        var dy = other.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var minDist = this.radius + other.radius;
        if (distance < minDist) {
            // Resolve overlap
            var angle = Math.atan2(dy, dx);
            var overlap = minDist - distance;
            var totalMass = this.radius * this.radius + other.radius * other.radius;
            var thisMassRatio = this.radius * this.radius / totalMass;
            var otherMassRatio = other.radius * other.radius / totalMass;
            this.x -= Math.cos(angle) * overlap * otherMassRatio;
            this.y -= Math.sin(angle) * overlap * otherMassRatio;
            other.x += Math.cos(angle) * overlap * thisMassRatio;
            other.y += Math.sin(angle) * overlap * thisMassRatio;
            // Exchange velocities (simple elastic collision)
            var combinedMass = this.radius + other.radius;
            var collisionScale = (dx * (this.vx - other.vx) + dy * (this.vy - other.vy)) / (distance * distance);
            var vxTotal = this.vx - other.vx;
            var vyTotal = this.vy - other.vy;
            this.vx -= (dx * collisionScale) * (2 * other.radius / combinedMass);
            this.vy -= (dy * collisionScale) * (2 * other.radius / combinedMass);
            other.vx += (dx * collisionScale) * (2 * this.radius / combinedMass);
            other.vy += (dy * collisionScale) * (2 * this.radius / combinedMass);
        }
    };
    return Circle;
}());
// Generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// To handle mouse clicks for spawning circles
function handleClick(event) {
    var x = event.clientX;
    var y = event.clientY;
    // Check if any circle was clicked
    for (var i = circles.length - 1; i >= 0; i--) {
        if (circles[i].isPointInside(x, y)) {
            circles.splice(i, 1);
            updateCounter();
            return;
        }
    }
    // Determine the radius for the new circle from the slider
    var radius = parseInt(sizeSlider.value, 10);
    var color = colorPicker.value;
    // Add a new circle without any limit
    var circle = new Circle(x, y, radius, color);
    circles.push(circle);
    updateCounter();
    // Hide the title after the first click
    showTitle = false;
}
// Update the counter display
function updateCounter() {
    counter.textContent = "Balls: " + circles.length;
}
// Clear all circles
function clearCircles() {
    circles = [];
    updateCounter();
}
//Toggle Controls
toggleControlsButton.addEventListener('click', function () {
    controlsContainer.style.display = controlsContainer.style.display === 'none' ? 'block' : 'none';
});
// Set background based on user input URL
function setBackgroundFromURL(url) {
    document.body.style.backgroundImage = url ? "url(" + url + ")" : 'none';
    document.body.style.backgroundSize = url ? 'cover' : 'auto';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
}
// Function to set background photo
window.setPhoto = function (photoUrl) {
    setBackgroundFromURL(photoUrl);
};
// Event listener for mouse clicks
canvas.addEventListener('click', handleClick);
// Event listener for gravity slider
gravitySlider.addEventListener('input', function () {
    gravity = parseFloat(gravitySlider.value);
    gravityValue.textContent = (gravity / 100).toFixed(2);
});
// Event listener for size slider
sizeSlider.addEventListener('input', function () {
    sizeValue.textContent = sizeSlider.value;
});
// Event listener for clear button
clearButton.addEventListener('click', clearCircles);
// Previous timestamp for calculating deltaTime
var lastTime = 0;
// Variable to control title visibility
var showTitle = true;
// Animation loop with deltaTime
function tick(currentTime) {
    var deltaTime = (currentTime - lastTime) / 1000; // Convert time to seconds
    lastTime = currentTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    // Draw the title if showTitle is true
    if (showTitle) {
        ctx.font = '32px Courier';
        ctx.fillStyle = 'black';
        var text = 'Click on the screen to spawn a ball';
        var textMetrics = ctx.measureText(text);
        var x = (canvas.width - textMetrics.width) / 2;
        var y = (canvas.height / 2) - (32 / 2); // Adjust for font size
        ctx.fillText(text, x, y);
    }
    // Update and draw each circle
    for (var _i = 0, circles_1 = circles; _i < circles_1.length; _i++) {
        var circle = circles_1[_i];
        circle.update(deltaTime);
    }
    // Check for collisions
    for (var i = 0; i < circles.length; i++) {
        for (var j = i + 1; j < circles.length; j++) {
            circles[i].checkCollision(circles[j]);
        }
    }
    // Draw each circle
    for (var _a = 0, circles_2 = circles; _a < circles_2.length; _a++) {
        var circle = circles_2[_a];
        circle.draw();
    }
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
