// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  // Initialize hero canvas animations
  initHeroCanvas();
  
  // Initialize typing animation
  initTypingAnimation();
});

// Hero canvas animation with particles
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Handle window resize
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  });
  
  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 5 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
      this.color = getRandomColor();
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Bounce off edges
      if (this.x > canvas.width || this.x < 0) {
        this.speedX = -this.speedX;
      }
      
      if (this.y > canvas.height || this.y < 0) {
        this.speedY = -this.speedY;
      }
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Create particles based on screen size
  function createParticles() {
    particlesArray = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 9000);
    
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  
  // Connect particles with lines if they are close enough
  function connectParticles() {
    const maxDistance = 100;
    
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = 1 - (distance / maxDistance);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    
    connectParticles();
    requestAnimationFrame(animate);
  }
  
  // Get a random color for particles
  function getRandomColor() {
    const colors = [
      'rgba(255, 255, 255, 0.5)',
      'rgba(248, 184, 20, 0.5)',
      'rgba(17, 128, 166, 0.7)'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Create initial particles and start animation
  createParticles();
  animate();
}

// Typing animation for hero subtitle
function initTypingAnimation() {
  const typingElement = document.getElementById('typingText');
  if (!typingElement) return;
  
  const phrases = [
    "Developing Tomorrow's Healthcare Leaders",
    "Transform Healthcare Management",
    "Excel in Hospital Administration",
    "Lead with Strategic Vision"
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      // Deleting text
      typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Faster when deleting
    } else {
      // Typing text
      typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing speed
    }
    
    // If word is complete
    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at the end of phrase
      isDeleting = true;
      typingSpeed = 1500; // Wait before deleting
    } 
    // If deletion is complete
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length; // Move to next phrase
      typingSpeed = 500; // Pause before typing new phrase
    }
    
    setTimeout(typeEffect, typingSpeed);
  }
  
  // Start the typing animation
  setTimeout(typeEffect, 1000);
}

// Set dynamic element heights/positions based on viewport
function adjustDynamicElements() {
  const header = document.getElementById('header');
  const hero = document.getElementById('hero');
  
  if (header && hero) {
    // Adjust hero height to account for header
    const headerHeight = header.offsetHeight;
    hero.style.paddingTop = `${headerHeight}px`;
  }
}

// Call on load and resize
window.addEventListener('load', adjustDynamicElements);
window.addEventListener('resize', adjustDynamicElements);

// Add mousemove parallax effect to hero section
function initParallaxEffect() {
  const hero = document.getElementById('hero');
  
  if (!hero) return;
  
  hero.addEventListener('mousemove', function(e) {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  });
}

// Initialize the parallax effect
initParallaxEffect();

// Animate the application process stepper on scroll
function animateStepperOnScroll() {
  const stepper = document.querySelector('.stepper');
  if (!stepper) return;
  
  const steps = stepper.querySelectorAll('.step');
  const connectors = stepper.querySelectorAll('.step-connector');
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Animate steps sequentially
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('active');
          
          // Animate connector after step
          if (index < connectors.length) {
            connectors[index].classList.add('active');
          }
        }, 300 * index);
      });
      
      observer.unobserve(stepper);
    }
  }, { threshold: 0.5 });
  
  observer.observe(stepper);
}

// Call the stepper animation
animateStepperOnScroll();