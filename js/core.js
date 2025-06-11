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
 * Enhanced with responsive design system
 */
function initCore() {
  // Initialize responsive manager first
  window.responsiveManager = new ResponsiveManager();
  
  // Initialize enhanced mobile menu
  new EnhancedMobileMenu();
  
  // Initialize fade-in animations
  new FadeInObserver();
  
  // Initialize responsive form enhancer
  new ResponsiveFormEnhancer();
  
  // Initialize responsive image manager
  new ResponsiveImageManager();

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

  // Header shadow on scroll with responsive behavior
  const header = document.querySelector('.header');
  
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
  
  // Add responsive classes to body for CSS targeting
  document.body.classList.add(`breakpoint-${window.responsiveManager.getCurrentBreakpoint()}`);
  document.body.classList.add(`orientation-${window.responsiveManager.getOrientation()}`);
  
  // Update body classes on breakpoint/orientation changes
  window.responsiveManager.onBreakpointChange((newBreakpoint, oldBreakpoint) => {
    document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
    document.body.classList.add(`breakpoint-${newBreakpoint}`);
  });
  
  window.responsiveManager.onOrientationChange((newOrientation, oldOrientation) => {
    document.body.classList.remove(`orientation-${oldOrientation}`);
    document.body.classList.add(`orientation-${newOrientation}`);
  });
  
  // Add touch device detection
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
  } else {
    document.body.classList.add('no-touch');
  }
  
  console.log('Core features initialized with responsive design system');
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
window.ResponsiveManager = ResponsiveManager;
window.EnhancedMobileMenu = EnhancedMobileMenu;
window.ResponsiveFormEnhancer = ResponsiveFormEnhancer;
window.ResponsiveImageManager = ResponsiveImageManager;

// Proper ES module exports
export {
  Toast,
  validateEmail,
  smoothScrollTo,
  debounce,
  MobileMenu,
  FadeInObserver,
  ResponsiveManager,
  EnhancedMobileMenu,
  ResponsiveFormEnhancer,
  ResponsiveImageManager
};

/* ===========================
   RESPONSIVE UTILITIES AND VIEWPORT MANAGEMENT
   =========================== */

/**
 * Enhanced functionality for responsive design system
 */

/**
 * Responsive Breakpoint Manager
 * Manages responsive breakpoints and provides utilities for JavaScript responsive behavior
 */
class ResponsiveManager {
  constructor() {
    // Define breakpoints (matching CSS variables)
    this.breakpoints = {
      xs: 360,
      sm: 480,
      md: 768,
      lg: 992,
      xl: 1200,
      '2xl': 1440,
      '3xl': 1920
    };
    
    this.currentBreakpoint = null;
    this.orientation = null;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    
    this.callbacks = {
      breakpointChange: [],
      orientationChange: [],
      resize: []
    };
    
    this.init();
  }
  
  init() {
    this.updateViewport();
    this.bindEvents();
    
    // Set initial state
    this.checkBreakpoint();
    this.checkOrientation();
  }
  
  bindEvents() {
    // Use debounced resize handler for better performance
    const debouncedResize = debounce(() => {
      this.handleResize();
    }, 150);
    
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure viewport dimensions are updated
      setTimeout(() => this.handleOrientationChange(), 100);
    });
  }
  
  updateViewport() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
  }
  
  handleResize() {
    const oldBreakpoint = this.currentBreakpoint;
    const oldWidth = this.viewportWidth;
    const oldHeight = this.viewportHeight;
    
    this.updateViewport();
    this.checkBreakpoint();
    this.checkOrientation();
    
    // Trigger resize callbacks
    this.callbacks.resize.forEach(callback => {
      callback({
        width: this.viewportWidth,
        height: this.viewportHeight,
        oldWidth,
        oldHeight,
        breakpoint: this.currentBreakpoint,
        orientation: this.orientation
      });
    });
    
    // Trigger breakpoint change if needed
    if (oldBreakpoint !== this.currentBreakpoint) {
      this.callbacks.breakpointChange.forEach(callback => {
        callback(this.currentBreakpoint, oldBreakpoint);
      });
    }
  }
  
  handleOrientationChange() {
    const oldOrientation = this.orientation;
    this.updateViewport();
    this.checkOrientation();
    
    if (oldOrientation !== this.orientation) {
      this.callbacks.orientationChange.forEach(callback => {
        callback(this.orientation, oldOrientation);
      });
    }
  }
  
  checkBreakpoint() {
    const width = this.viewportWidth;
    let newBreakpoint = 'xs';
    
    if (width >= this.breakpoints['3xl']) {
      newBreakpoint = '3xl';
    } else if (width >= this.breakpoints['2xl']) {
      newBreakpoint = '2xl';
    } else if (width >= this.breakpoints.xl) {
      newBreakpoint = 'xl';
    } else if (width >= this.breakpoints.lg) {
      newBreakpoint = 'lg';
    } else if (width >= this.breakpoints.md) {
      newBreakpoint = 'md';
    } else if (width >= this.breakpoints.sm) {
      newBreakpoint = 'sm';
    }
    
    this.currentBreakpoint = newBreakpoint;
  }
  
  checkOrientation() {
    this.orientation = this.viewportWidth > this.viewportHeight ? 'landscape' : 'portrait';
  }
  
  // Public API methods
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }
  
  getViewportSize() {
    return {
      width: this.viewportWidth,
      height: this.viewportHeight
    };
  }
  
  getOrientation() {
    return this.orientation;
  }
  
  isMobile() {
    return this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
  }
  
  isTablet() {
    return this.currentBreakpoint === 'md';
  }
  
  isDesktop() {
    return ['lg', 'xl', '2xl', '3xl'].includes(this.currentBreakpoint);
  }
  
  isLargeScreen() {
    return ['2xl', '3xl'].includes(this.currentBreakpoint);
  }
  
  // Event subscription methods
  onBreakpointChange(callback) {
    this.callbacks.breakpointChange.push(callback);
  }
  
  onOrientationChange(callback) {
    this.callbacks.orientationChange.push(callback);
  }
  
  onResize(callback) {
    this.callbacks.resize.push(callback);
  }
  
  // Utility method to check if current viewport matches a breakpoint
  matches(breakpoint) {
    if (typeof breakpoint === 'string') {
      return this.currentBreakpoint === breakpoint;
    }
    if (Array.isArray(breakpoint)) {
      return breakpoint.includes(this.currentBreakpoint);
    }
    return false;
  }
  
  // Method to get CSS media query string
  getMediaQuery(breakpoint) {
    const bp = this.breakpoints[breakpoint];
    return bp ? `(min-width: ${bp}px)` : null;
  }
}

/**
 * Enhanced Mobile Menu with Responsive Features
 * Extends the existing MobileMenu with better responsive behavior
 */
class EnhancedMobileMenu extends MobileMenu {
  constructor() {
    super();
    this.responsiveManager = null;
    this.initResponsive();
  }
  
  initResponsive() {
    // Wait for ResponsiveManager to be available
    if (window.responsiveManager) {
      this.responsiveManager = window.responsiveManager;
      this.setupResponsiveBehavior();
    } else {
      // Retry after a short delay
      setTimeout(() => this.initResponsive(), 100);
    }
  }
  
  setupResponsiveBehavior() {
    // Close menu when switching from mobile to desktop
    this.responsiveManager.onBreakpointChange((newBreakpoint, oldBreakpoint) => {
      const wasMobile = ['xs', 'sm', 'md'].includes(oldBreakpoint);
      const isDesktop = ['lg', 'xl', '2xl', '3xl'].includes(newBreakpoint);
      
      if (wasMobile && isDesktop && this.isOpen) {
        this.closeMenu();
      }
    });
    
    // Handle orientation changes on mobile
    this.responsiveManager.onOrientationChange((orientation) => {
      if (this.responsiveManager.isMobile() && this.isOpen) {
        // Adjust menu height for landscape mode
        if (orientation === 'landscape') {
          this.nav.style.paddingTop = '60px';
        } else {
          this.nav.style.paddingTop = '';
        }
      }
    });
  }
  
  openMenu() {
    super.openMenu();
    
    // Additional responsive behavior
    if (this.responsiveManager) {
      const { orientation } = this.responsiveManager;
      
      // Adjust for landscape mobile
      if (this.responsiveManager.isMobile() && orientation === 'landscape') {
        this.nav.style.paddingTop = '60px';
      }
    }
    
    // Focus management for accessibility
    const firstLink = this.nav.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }
  
  closeMenu() {
    super.closeMenu();
    
    // Reset any responsive styles
    this.nav.style.paddingTop = '';
    
    // Return focus to toggle button
    this.toggle.focus();
  }
}

/**
 * Form Enhancement for Responsive Design
 * Improves form behavior across different screen sizes
 */
class ResponsiveFormEnhancer {
  constructor() {
    this.forms = document.querySelectorAll('form[id*="signup"], .hero__form, .cta-form');
    this.responsiveManager = null;
    this.init();
  }
  
  init() {
    if (window.responsiveManager) {
      this.responsiveManager = window.responsiveManager;
      this.enhanceForms();
    } else {
      setTimeout(() => this.init(), 100);
    }
  }
  
  enhanceForms() {
    this.forms.forEach(form => this.enhanceForm(form));
    
    // Listen for breakpoint changes
    this.responsiveManager.onBreakpointChange(() => {
      this.forms.forEach(form => this.updateFormLayout(form));
    });
  }
  
  enhanceForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    const buttons = form.querySelectorAll('button, input[type="submit"]');
    
    // Enhance inputs for mobile
    inputs.forEach(input => {
      // Prevent zoom on iOS
      if (this.responsiveManager.isMobile()) {
        input.style.fontSize = '16px';
      }
      
      // Add touch-friendly behavior
      input.addEventListener('focus', () => {
        if (this.responsiveManager.isMobile()) {
          // Scroll input into view on mobile
          setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      });
    });
    
    // Enhance buttons
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        // Add active state for touch devices
        button.classList.add('touch-active');
      });
      
      button.addEventListener('touchend', () => {
        setTimeout(() => {
          button.classList.remove('touch-active');
        }, 150);
      });
    });
    
    this.updateFormLayout(form);
  }
  
  updateFormLayout(form) {
    const isMobile = this.responsiveManager.isMobile();
    const isTablet = this.responsiveManager.isTablet();
    
    // Update form layout based on screen size
    if (isMobile) {
      form.classList.add('form--mobile');
      form.classList.remove('form--tablet', 'form--desktop');
    } else if (isTablet) {
      form.classList.add('form--tablet');
      form.classList.remove('form--mobile', 'form--desktop');
    } else {
      form.classList.add('form--desktop');
      form.classList.remove('form--mobile', 'form--tablet');
    }
  }
}

/**
 * Image Optimization for Responsive Design
 * Handles responsive images and lazy loading optimization
 */
class ResponsiveImageManager {
  constructor() {
    this.images = document.querySelectorAll('img[data-responsive], .hero__image, .why-card__image');
    this.responsiveManager = null;
    this.init();
  }
  
  init() {
    if (window.responsiveManager) {
      this.responsiveManager = window.responsiveManager;
      this.optimizeImages();
    } else {
      setTimeout(() => this.init(), 100);
    }
  }
  
  optimizeImages() {
    this.images.forEach(img => this.optimizeImage(img));
    
    // Re-optimize on breakpoint changes
    this.responsiveManager.onBreakpointChange(() => {
      this.images.forEach(img => this.updateImageSize(img));
    });
  }
  
  optimizeImage(img) {
    // Add loading state
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    
    // Add error handling
    img.addEventListener('error', () => {
      img.classList.add('error');
      console.warn('Failed to load image:', img.src);
    });
    
    this.updateImageSize(img);
  }
  
  updateImageSize(img) {
    const isMobile = this.responsiveManager.isMobile();
    const isTablet = this.responsiveManager.isTablet();
    
    // Update image loading priority based on viewport
    if (img.classList.contains('hero__image')) {
      img.loading = isMobile ? 'eager' : 'eager';
      img.fetchpriority = 'high';
    } else {
      img.loading = 'lazy';
    }
    
    // Update alt text for screen readers on mobile
    if (isMobile && img.hasAttribute('data-mobile-alt')) {
      img.alt = img.getAttribute('data-mobile-alt');
    }
  }
}
