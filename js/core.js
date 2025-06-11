/* ===========================
   CORE UTILITIES
   =========================== */

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful');
    } catch (error) {
      console.log('ServiceWorker registration failed');
    }
  });
}

// Smooth Scroll Utility
function smoothScrollTo(target, duration = 800) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const targetPosition = targetElement.offsetTop - 80; // Account for sticky header
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  // Respect user's motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetPosition);
  } else {
    requestAnimationFrame(animation);
  }
}

// Mobile Menu Toggle
class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('.header__menu-toggle');
    this.nav = document.querySelector('.header__mobile-nav');
    this.isOpen = false;
    
    if (this.toggle && this.nav) {
      this.init();
    }
  }

  init() {
    this.toggle.addEventListener('click', () => this.toggleMenu());
    
    // Close menu when clicking on links
    const links = this.nav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.toggle.contains(e.target) && !this.nav.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.nav.setAttribute('aria-hidden', 'false');
    this.nav.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  }

  closeMenu() {
    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.nav.setAttribute('aria-hidden', 'true');
    this.nav.classList.remove('is-open');
    document.body.style.overflow = ''; // Restore scroll
  }
}

// Toast Notification Utility
class Toast {
  constructor() {
    this.container = document.getElementById('toast');
  }

  show(message, type = 'success', duration = 4000) {
    if (!this.container) return;

    this.container.textContent = message;
    this.container.className = `toast toast--${type}`;
    
    // Show toast
    requestAnimationFrame(() => {
      this.container.classList.add('show');
    });

    // Hide toast after duration
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    if (!this.container) return;
    this.container.classList.remove('show');
  }
}

// Intersection Observer for Fade-in Animations
class FadeInObserver {
  constructor() {
    this.elements = document.querySelectorAll('.fade-in');
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    // Check for reduced motion preference
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.reduceMotion) {
      // If reduced motion is preferred, show all elements immediately
      this.elements.forEach(el => el.classList.add('is-visible'));
    } else {
      this.init();
    }
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, this.options);

    this.elements.forEach(el => this.observer.observe(el));
  }
}

// Parallax Effect for Hero Waves
class ParallaxEffect {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!this.reduceMotion && this.hero) {
      this.init();
    }
  }

  init() {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      
      if (this.hero) {
        const waves = this.hero.querySelector('::before');
        if (waves) {
          this.hero.style.setProperty('--parallax-offset', `${parallax}px`);
        }
      }
      
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }
}

// Email Validation Utility
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Initialize Core Features
document.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile menu
  new MobileMenu();
  
  // Initialize fade-in animations
  new FadeInObserver();
  
  // Initialize parallax effect
  new ParallaxEffect();
  
  // Initialize smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        smoothScrollTo(target);
      }
    });
  });

  // Header shadow on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Apply fade-in to hero content elements
  document.querySelectorAll('.hero__content, .hero__tagline, .hero__image').forEach(el => el.classList.add('fade-in'));
});

// Export utilities for use in other modules
window.Toast = Toast;
window.validateEmail = validateEmail;
window.smoothScrollTo = smoothScrollTo;
