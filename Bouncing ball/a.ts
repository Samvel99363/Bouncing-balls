const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const counter = document.getElementById('counter') as HTMLDivElement;
const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
const gravitySlider = document.getElementById('gravitySlider') as HTMLInputElement;
const gravityValue = document.getElementById('gravityValue') as HTMLSpanElement;
const sizeSlider = document.getElementById('sizeSlider') as HTMLInputElement;
const sizeValue = document.getElementById('sizeValue') as HTMLSpanElement;
const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
const controlsContainer = document.getElementById('controls') as HTMLDivElement;
const toggleControlsButton = document.getElementById('toggleControlsButton') as HTMLButtonElement;

// Set canvas size to the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Default gravity value (Earth gravity in pixels/s²)
let gravity = 9.81 * 100;
const damping = 0.75;
const friction = 0.99;
const restThreshold = 0.1;

// Array to store all circles
let circles: Circle[] = [];

// Circle class definition
class Circle {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
    isAtRest: boolean;

    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = Math.random() * 100 - 50; // Random horizontal velocity
        this.vy = 0; // Initial vertical velocity
        this.color = color;
        this.isAtRest = false;
    }

    // Check if a point is inside the circle
    isPointInside(px: number, py: number): boolean {
        const dx = px - this.x;
        const dy = py - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    // Update the circle's position
    update(deltaTime: number): void {
        if (!this.isAtRest) {
            this.vy += gravity * deltaTime;
            this.vx *= friction;
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;

            // Check for collision with the canvas edges
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -damping; 
            } else if (this.x + this.radius > canvas.width) {
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
                } else {
                    this.isAtRest = false;
                }
            }
        }
    }

    // Draw the circle
    draw(): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    // Check for collision with another circle
    checkCollision(other: Circle): void {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.radius + other.radius;

        if (distance < minDist) {
            // Resolve overlap
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - distance;
            const totalMass = this.radius * this.radius + other.radius * other.radius;

            const thisMassRatio = this.radius * this.radius / totalMass;
            const otherMassRatio = other.radius * other.radius / totalMass;

            this.x -= Math.cos(angle) * overlap * otherMassRatio;
            this.y -= Math.sin(angle) * overlap * otherMassRatio;
            other.x += Math.cos(angle) * overlap * thisMassRatio;
            other.y += Math.sin(angle) * overlap * thisMassRatio;

            // Exchange velocities (simple elastic collision)
            const combinedMass = this.radius + other.radius;
            const collisionScale = (dx * (this.vx - other.vx) + dy * (this.vy - other.vy)) / (distance * distance);
            const vxTotal = this.vx - other.vx;
            const vyTotal = this.vy - other.vy;

            this.vx -= (dx * collisionScale) * (2 * other.radius / combinedMass);
            this.vy -= (dy * collisionScale) * (2 * other.radius / combinedMass);
            other.vx += (dx * collisionScale) * (2 * this.radius / combinedMass);
            other.vy += (dy * collisionScale) * (2 * this.radius / combinedMass);
        }
    }
}

// Generate a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// To handle mouse clicks for spawning circles
function handleClick(event: MouseEvent): void {
    const x = event.clientX;
    const y = event.clientY;

    // Check if any circle was clicked
    for (let i = circles.length - 1; i >= 0; i--) {
        if (circles[i].isPointInside(x, y)) {
            circles.splice(i, 1);
            updateCounter();
            return;
        }
    }

    // Determine the radius for the new circle from the slider
    const radius = parseInt(sizeSlider.value, 10);
    const color = colorPicker.value;

    // Add a new circle without any limit
    const circle = new Circle(x, y, radius, color);
    circles.push(circle);
    updateCounter();

    // Hide the title after the first click
    showTitle = false;
}

// Update the counter display
function updateCounter(): void {
    counter.textContent = `Balls: ${circles.length}`;
}

// Clear all circles
function clearCircles(): void {
    circles = [];
    updateCounter();
}

//Toggle Controls
toggleControlsButton.addEventListener('click', () => {
    controlsContainer.style.display = controlsContainer.style.display === 'none' ? 'block' : 'none';
});

// Set background based on user input URL
function setBackgroundFromURL(url: string): void {
    document.body.style.backgroundImage = url ? `url(${url})` : 'none';
    document.body.style.backgroundSize = url ? 'cover' : 'auto';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
}

// Function to set background photo
(window as any).setPhoto = (photoUrl: string): void => {
    setBackgroundFromURL(photoUrl);
};

// Event listener for mouse clicks
canvas.addEventListener('click', handleClick);

// Event listener for gravity slider
gravitySlider.addEventListener('input', () => {
    gravity = parseFloat(gravitySlider.value);
    gravityValue.textContent = (gravity / 100).toFixed(2);
});

// Event listener for size slider
sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value;
});

// Event listener for clear button
clearButton.addEventListener('click', clearCircles);

// Previous timestamp for calculating deltaTime
let lastTime = 0;

// Variable to control title visibility
let showTitle = true;

// Animation loop with deltaTime
function tick(currentTime: number): void {
    const deltaTime = (currentTime - lastTime) / 1000; // Convert time to seconds
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the title if showTitle is true
    if (showTitle) {
        ctx.font = '32px Courier';
        ctx.fillStyle = 'black';
        const text = 'Click on the screen to spawn a ball';
        const textMetrics = ctx.measureText(text);
        const x = (canvas.width - textMetrics.width) / 2;
        const y = (canvas.height / 2) - (32 / 2); // Adjust for font size
        ctx.fillText(text, x, y);
    }

    
    // Update and draw each circle
    for (let circle of circles) {
        circle.update(deltaTime);
    }

    // Check for collisions
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            circles[i].checkCollision(circles[j]);
        }
    }

    // Draw each circle
    for (let circle of circles) {
        circle.draw();
    }

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
