"use strict";

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d'); // Set canvas size to the window size

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; // Gravity and damping constants using deltaTime

var gravity = 500;
var damping = 0.7; // Array to store all circles

var circles = []; // Circle class definition

var Circle =
/** @class */
function () {
  function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vy = 0;
  } // Update the circle's position


  Circle.prototype.update = function (deltaTime) {
    this.vy += gravity * deltaTime;
    this.y += this.vy * deltaTime; // Check for collision with the bottom of the canvas

    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.vy *= -damping; // Reverse velocity and apply damping
    } // If the bounce velocity is very small, stop the movement


    if (Math.abs(this.vy) < 0.1 && this.y + this.radius >= canvas.height) {
      this.vy = 0;
    }
  }; // Draw the circle


  Circle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
  };

  return Circle;
}(); // Function to handle mouse clicks


function handleClick(event) {
  var x = event.clientX;
  var y = event.clientY;
  var radius = 20;
  var circle = new Circle(x, y, radius);
  circles.push(circle);
} // Previous timestamp for calculating deltaTime


var lastTimestamp = null; // Animation loop with deltaTime

function animate(timestamp) {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  var deltaTime = (timestamp - lastTimestamp) / 1000; // Convert time to seconds

  lastTimestamp = timestamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  // Update and draw each circle

  for (var _i = 0, circles_1 = circles; _i < circles_1.length; _i++) {
    var circle = circles_1[_i];
    circle.update(deltaTime);
    circle.draw();
  }

  requestAnimationFrame(animate); // Request the next frame
} // Event listener for mouse clicks


canvas.addEventListener('click', handleClick); // Start the animation loop

requestAnimationFrame(animate);