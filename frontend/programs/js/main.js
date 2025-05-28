// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Set page title
  // document.title = "MBA in Health Service Management | Apollo University";

  // Initialize header scroll effect
  initHeaderScroll();
  
  // Initialize mobile navigation
  initMobileNav();
  
  // Initialize accordions (Course Structure)
  initAccordions();
  
  // Initialize FAQ
  initFAQ();
  
  // Initialize animate on scroll (AOS)
  initAOS();
  
  // Initialize carousel for testimonials
  initCarousel();
  
  // Initialize statistics counter
  initStatCounter();
  
  // Initialize fee calculator
  initFeeCalculator();
  
  // Initialize application process stepper
  initStepper();
  
  // Initialize back to top button
  initBackToTop();
  
  // Smooth scroll for anchor links
  initSmoothScroll();
});

// Header scroll effect
function initHeaderScroll() {
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Trigger scroll event on load to set initial state
  window.dispatchEvent(new Event('scroll'));
}

// Mobile navigation
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Ensure menu options are displayed in mobile layout
      if (navMenu.classList.contains('active')) {
        navMenu.style.display = 'block';
      } else {
        navMenu.style.display = 'none';
      }
    });
  }
  
  // Close mobile menu when link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navMenu.style.display = 'none';
    });
  });
}

// Accordions for Course Structure
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const accordion = this.parentElement;
      accordion.classList.toggle('active');
    });
  });
}

// FAQ functionality
function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearch = document.getElementById('faqSearch');
  
  // Toggle FAQ answers
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      faqItem.classList.toggle('active');
    });
  });
  
  // FAQ category filtering
  if (faqTabs.length > 0 && faqItems.length > 0) {
    faqTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        faqTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        
        faqItems.forEach(item => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
  
  // FAQ search functionality
  if (faqSearch) {
    faqSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

// Animate on scroll (AOS)
function initAOS() {
  const aosElements = document.querySelectorAll('[data-aos]');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  aosElements.forEach(element => {
    observer.observe(element);
  });
}

// Testimonial carousel
function initCarousel() {
  const carousel = document.getElementById('testimonialCarousel');
  
  if (!carousel) return;
  
  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  
  let currentIndex = 0;
  const slideWidth = 100; // percentage width of each slide
  const slideCount = slides.length;
  
  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = dotsContainer.querySelectorAll('.carousel-dot');
  
  // Go to specific slide
  function goToSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${slideWidth * currentIndex}%)`;
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
  
  // Event listeners for buttons
  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  
  // Auto slide
  let interval = setInterval(() => goToSlide(currentIndex + 1), 5000);
  
  // Pause on hover
  carousel.addEventListener('mouseenter', () => clearInterval(interval));
  carousel.addEventListener('mouseleave', () => {
    clearInterval(interval);
    interval = setInterval(() => goToSlide(currentIndex + 1), 5000);
  });
  
  // Swipe support for touch devices
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  carousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const difference = touchStartX - touchEndX;
    if (difference > 50) {
      // Swipe left, go to next slide
      goToSlide(currentIndex + 1);
    } else if (difference < -50) {
      // Swipe right, go to previous slide
      goToSlide(currentIndex - 1);
    }
  }
}

// Statistics counter animation
function initStatCounter() {
  const stats = document.querySelectorAll('.stat-number');
  
  if (stats.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statElement = entry.target;
        const targetValue = parseInt(statElement.getAttribute('data-target'));
        let currentValue = 0;
        const duration = 2000; // 2 seconds
        const stepTime = 50; // Update every 50ms
        const totalSteps = duration / stepTime;
        const stepValue = targetValue / totalSteps;
        
        statElement.classList.add('visible');
        
        const counter = setInterval(() => {
          currentValue += stepValue;
          
          if (currentValue >= targetValue) {
            statElement.textContent = targetValue;
            clearInterval(counter);
          } else {
            statElement.textContent = Math.floor(currentValue);
          }
        }, stepTime);
        
        observer.unobserve(statElement);
      }
    });
  }, observerOptions);
  
  stats.forEach(stat => {
    observer.observe(stat);
  });
}

// Fee calculator
function initFeeCalculator() {
  const includeHostelCheckbox = document.getElementById('includeHostel');
  const calculatedTotal = document.getElementById('calculatedTotal');
  
  if (!includeHostelCheckbox || !calculatedTotal) return;
  
  const baseAmount = 177000; // Without hostel
  const hostelAmount = 60000;
  
  includeHostelCheckbox.addEventListener('change', function() {
    if (this.checked) {
      calculatedTotal.textContent = `₹${baseAmount + hostelAmount}`;
    } else {
      calculatedTotal.textContent = `₹${baseAmount}`;
    }
  });
}

// Application process stepper
function initStepper() {
  const steps = document.querySelectorAll('.step');
  
  if (steps.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };
  
  let lastActiveStep = 0;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = entry.target;
        const stepIndex = parseInt(step.getAttribute('data-step'));
        
        // Only activate steps sequentially
        if (stepIndex > lastActiveStep) {
          lastActiveStep = stepIndex;
        }
        
        // Activate all steps up to the current one
        steps.forEach(s => {
          const sIndex = parseInt(s.getAttribute('data-step'));
          if (sIndex <= lastActiveStep) {
            s.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);
  
  steps.forEach(step => {
    observer.observe(step);
  });
}

// Back to top button
function initBackToTop() {
  const backToTopButton = document.getElementById('backToTop');
  
  if (!backToTopButton) return;
  
  backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      backToTopButton.style.display = 'flex';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.getElementById('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        
        window.scrollTo({
          top: targetPosition - headerHeight,
          behavior: 'smooth'
        });
      }
    });
  });
}