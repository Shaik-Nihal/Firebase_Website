document.addEventListener('DOMContentLoaded', function() {
  // Initialize first year as open by default
  const firstYear = document.querySelector('.timeline-year');
  if (firstYear) {
    firstYear.classList.add('open');
    firstYear.querySelector('.timeline-sems').style.display = 'grid';
    firstYear.setAttribute('aria-expanded', 'true');
  }

  // Year toggle functionality
  document.querySelectorAll('.year-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const year = this.parentElement;
      const isOpen = year.classList.contains('open');
      
      // Close all years first
      document.querySelectorAll('.timeline-year').forEach(y => {
        y.classList.remove('open');
        y.querySelector('.timeline-sems').style.display = 'none';
        y.setAttribute('aria-expanded', 'false');
      });
      
      // Open clicked year if it wasn't open
      if (!isOpen) {
        year.classList.add('open');
        year.querySelector('.timeline-sems').style.display = 'grid';
        year.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Semester toggle functionality
  document.querySelectorAll('.sem-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const sem = this.parentElement;
      const courses = this.nextElementSibling;
      const isActive = sem.classList.contains('active');
      
      // Close all semesters in the same year
      const yearSems = sem.parentElement.querySelectorAll('.timeline-sem');
      yearSems.forEach(s => {
        if (s !== sem) {
          s.classList.remove('active');
          s.querySelector('.sem-courses').style.maxHeight = '0';
          s.querySelector('.sem-toggle').setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current semester
      if (isActive) {
        sem.classList.remove('active');
        courses.style.maxHeight = '0';
        this.setAttribute('aria-expanded', 'false');
      } else {
        sem.classList.add('active');
        courses.style.maxHeight = courses.scrollHeight + 'px';
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Course item hover effects
  document.querySelectorAll('.sem-courses li').forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(0) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });

  // Handle window resize to adjust course list height
  window.addEventListener('resize', function() {
    document.querySelectorAll('.timeline-sem.active').forEach(sem => {
      const courses = sem.querySelector('.sem-courses');
      courses.style.maxHeight = courses.scrollHeight + 'px';
    });
  });
});x