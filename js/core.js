/* ===========================
   CORE UTILITIES
   =========================== */

/**
 * This file contains shared functionality across the website:
 * - Service Worker registration for offline capabilities
 * - Smooth scrolling implementation
 * - Mobile menu functionality
 * - Toast notification system
 * - Animation utilities
 * - Shared helper functions (debounce, email validation)
 *
 * All utilities are either attached to the window object or
 * initialized in the DOMContentLoaded event.
 */

/**
 * Service Worker Registration
 * Enables offline capabilities and caching for the website
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, inform user if needed
            console.log('New content is available; please refresh the page.');
          }
        });
      });
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      // Don't let service worker errors break the site
    }
  });
}

/**
 * Smooth Scroll Utility
 * Scrolls the page to a target element with smooth animation
 * Respects user's motion preferences
 * 
 * @param {HTMLElement|string} target - The element or selector to scroll to
 * @param {number} duration - Animation duration in milliseconds
 * @returns {void}
 */
function smoothScrollTo(target, duration = 800) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const targetPosition = targetElement.offsetTop - 80; // Account for sticky header
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  /**
   * Animation frame callback
   * @param {number} currentTime - Current timestamp
   */
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  /**
   * Easing function for smooth animation
   * @param {number} t - Current time
   * @param {number} b - Start position
   * @param {number} c - Change in position
   * @param {number} d - Duration
   * @returns {number} - Next position
   */
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

// [Removed Parallax Effect for Hero Waves]

/**
 * Debounce utility function
 * Limits how often a function can be called
 * Useful for scroll, resize and input events
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    // Store the context and args for the pending function call
    const context = this;
    
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    
    // Reset the timer
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Email Validation Utility
 * Validates email format using regex
 * 
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Regex to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Initialize core features and functionality
 * Used both internally and can be called by other modules
 */
function initCore() {
  // Initialize mobile menu
  new MobileMenu();
  
  // Initialize fade-in animations
  new FadeInObserver();

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
  
  // Use debounce for scroll events for better performance
  const handleScroll = debounce(() => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, 50);
  
  window.addEventListener('scroll', handleScroll);

  // Apply fade-in to hero content elements
  document.querySelectorAll('.hero__content, .hero__subtitle, .hero__image').forEach(el => el.classList.add('fade-in'));
  
  console.log('Core features initialized');
}

// Initialize Core Features when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCore);
} else {
  initCore();
}

// Export the init function for use in other modules
window.initCore = initCore;

// Export utilities for use in other modules
window.Toast = Toast;
window.validateEmail = validateEmail;
window.smoothScrollTo = smoothScrollTo;
window.debounce = debounce;

// Proper ES module exports
export {
  Toast,
  validateEmail,
  smoothScrollTo,
  debounce,
  MobileMenu,
  FadeInObserver
};
