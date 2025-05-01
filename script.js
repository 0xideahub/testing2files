const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Physics constants
const FRICTION = 0.999; // Reduced air resistance
const RESTITUTION = 0.95; // Increased bounciness
const MIN_VELOCITY = 0.5; // Minimum velocity threshold

// Ball class
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 8; // Increased initial velocity
        this.dy = (Math.random() - 0.5) * 8;
        this.mass = Math.PI * radius * radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(balls) {
        // Apply friction
        this.dx *= FRICTION;
        this.dy *= FRICTION;

        // Ensure minimum velocity
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (speed < MIN_VELOCITY && speed > 0) {
            const scale = MIN_VELOCITY / speed;
            this.dx *= scale;
            this.dy *= scale;
        }

        // Bounce off walls with energy preservation
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.dx = -Math.abs(this.dx) * RESTITUTION;
        } else if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx = Math.abs(this.dx) * RESTITUTION;
        }

        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy = -Math.abs(this.dy) * RESTITUTION;
        } else if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy = Math.abs(this.dy) * RESTITUTION;
        }

        // Check collision with other balls
        for (let ball of balls) {
            if (ball === this) continue;

            // Calculate distance between balls
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.radius + ball.radius;

            // Check if balls are colliding
            if (distance < minDist) {
                // Calculate collision normal
                const nx = dx / distance;
                const ny = dy / distance;

                // Calculate relative velocity
                const relativeVelocityX = this.dx - ball.dx;
                const relativeVelocityY = this.dy - ball.dy;
                const relativeSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

                // Only resolve if balls are moving toward each other
                if (relativeSpeed < 0) {
                    // Calculate impulse
                    const impulse = 2 * relativeSpeed / (this.mass + ball.mass);

                    // Update velocities with energy preservation
                    this.dx -= impulse * ball.mass * nx;
                    this.dy -= impulse * ball.mass * ny;
                    ball.dx += impulse * this.mass * nx;
                    ball.dy += impulse * this.mass * ny;

                    // Separate balls to prevent sticking
                    const overlap = (minDist - distance) / 2;
                    const moveX = nx * overlap;
                    const moveY = ny * overlap;
                    
                    this.x -= moveX;
                    this.y -= moveY;
                    ball.x += moveX;
                    ball.y += moveY;

                    // Ensure minimum velocity after collision
                    const speed1 = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                    const speed2 = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    
                    if (speed1 < MIN_VELOCITY && speed1 > 0) {
                        const scale = MIN_VELOCITY / speed1;
                        this.dx *= scale;
                        this.dy *= scale;
                    }
                    if (speed2 < MIN_VELOCITY && speed2 > 0) {
                        const scale = MIN_VELOCITY / speed2;
                        ball.dx *= scale;
                        ball.dy *= scale;
                    }
                }
            }
        }

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

// Create balls
const colors = ['red', 'blue', 'green', 'orange', 'white'];
const balls = [];

// Create the original colored balls
for (let i = 0; i < colors.length; i++) {
    const radius = 20;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    balls.push(new Ball(x, y, radius, colors[i]));
}

// Add 4 more green balls
for (let i = 0; i < 4; i++) {
    const radius = 20;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    balls.push(new Ball(x, y, radius, 'green'));
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balls.forEach(ball => {
        ball.update(balls);
    });

    requestAnimationFrame(animate);
}

animate();

// Create starfield
const starField = document.createElement('div');
starField.className = 'star-field';
document.querySelector('.container').appendChild(starField);

// Create stars
const numberOfStars = 200;
for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random star properties
    const size = Math.random() * 3;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 3 + 1) + 's';
    
    starField.appendChild(star);
}

// Cursor trail effect
const trails = [];
const maxTrails = 20;

document.addEventListener('mousemove', (e) => {
    // Create new trail element
    const trail = document.createElement('div');
    trail.className = 'star';
    trail.style.position = 'fixed';
    trail.style.width = '10px';
    trail.style.height = '10px';
    trail.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    trail.style.pointerEvents = 'none';
    trail.style.transition = 'all 0.5s ease-out';
    document.body.appendChild(trail);
    
    // Add trail to array
    trails.push({
        element: trail,
        timeCreated: Date.now()
    });
    
    // Fade out and remove old trails
    setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'scale(0.5)';
    }, 100);
    
    // Remove excess trails
    while (trails.length > maxTrails) {
        const oldTrail = trails.shift();
        if (oldTrail.element.parentNode) {
            oldTrail.element.parentNode.removeChild(oldTrail.element);
        }
    }
});

// Section handling
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.content-section');

// Hide all sections
function hideAllSections() {
    sections.forEach(section => {
        section.style.display = 'none';
    });
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
}

// Handle menu item clicks
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        hideAllSections();
        item.classList.add('active');
        
        if (page === 'animations') {
            const section = document.getElementById('animations-section');
            section.style.display = 'block';
            startMatrixAnimation();
        } else if (page === 'downloads') {
            const section = document.getElementById('downloads-section');
            section.style.display = 'block';
            startDownloadAnimations();
        } else if (page === 'guestbook') {
            const section = document.getElementById('guestbook-section');
            section.style.display = 'block';
            animateGuestbook();
        }
    });
});

// Matrix Animation
function startMatrixAnimation() {
    const container = document.querySelector('.matrix-text');
    container.innerHTML = '';
    const columns = Math.floor(container.offsetWidth / 20);
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.left = (i * 20) + 'px';
        column.style.top = '0';
        column.style.color = '#0f0';
        column.style.fontFamily = 'monospace';
        column.style.fontSize = '20px';
        column.style.whiteSpace = 'nowrap';
        container.appendChild(column);
        
        let delay = Math.random() * 3;
        
        function animateColumn() {
            const chars = '01';
            column.textContent = chars[Math.floor(Math.random() * chars.length)];
            column.style.animation = `matrixRain ${delay}s linear infinite`;
            
            if (Math.random() < 0.02) {
                column.style.color = '#fff';
                setTimeout(() => {
                    column.style.color = '#0f0';
                }, 50);
            }
        }
        
        setInterval(animateColumn, 100);
    }
}

// Download Animation
function startDownloadAnimations() {
    const progressBars = document.querySelectorAll('.download-progress');
    progressBars.forEach((bar, index) => {
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.animation = `downloadProgress ${3 + index}s linear`;
            bar.style.width = '100%';
        }, index * 1000);
    });
}

// Guestbook Animation
function animateGuestbook() {
    const entries = document.querySelectorAll('.guestbook-entry');
    entries.forEach((entry, index) => {
        entry.style.opacity = '0';
        entry.style.transform = 'translateX(-20px)';
        entry.style.transition = 'all 0.5s ease-out';
        
        setTimeout(() => {
            entry.style.opacity = '1';
            entry.style.transform = 'translateX(0)';
            entry.style.animation = 'guestbookGlow 2s infinite';
        }, index * 500);
    });
}

// Animate stars
function animateStars() {
    const stars = document.querySelectorAll('.star-field .star');
    stars.forEach(star => {
        const speed = Math.random() * 2 + 0.5;
        star.style.transform = `translateY(${window.innerHeight}px)`;
        star.style.transition = `transform ${speed}s linear`;
        
        setTimeout(() => {
            star.style.transform = 'translateY(-5px)';
            star.style.transition = 'none';
            
            requestAnimationFrame(() => {
                star.style.transform = `translateY(${window.innerHeight}px)`;
                star.style.transition = `transform ${speed}s linear`;
            });
        }, speed * 1000);
    });
}

// Start star animation
animateStars();
setInterval(animateStars, 3000);

// Add random visitor count incrementing
const visitorCounter = document.querySelector('.visitor-counter');
let visitors = 42;

setInterval(() => {
    visitors += Math.floor(Math.random() * 3);
    visitorCounter.textContent = `Visitors: ${visitors.toString().padStart(6, '0')}`;
}, 3000); 