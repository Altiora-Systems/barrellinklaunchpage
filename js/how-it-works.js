/* ===========================
   HOW IT WORKS PAGE FUNCTIONALITY
   =========================== */

// Use debounce from core.js

// How It Works Carousel Handler
class HowItWorksCarousel {
  constructor() {
    this.carousel = document.getElementById('stepsCarousel');
    this.track = document.querySelector('.carousel__track');
    this.slides = document.querySelectorAll('.carousel__slide');
    this.prevBtn = document.querySelector('.carousel__nav--prev');
    this.nextBtn = document.querySelector('.carousel__nav--next');
    
    this.currentSlide = 0;
    this.isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.carousel && this.track) {
      this.init();
    }
  }

  init() {
    // Only initialize carousel for mobile/tablet
    if (window.innerWidth > 992) {
      return;
    }

    this.setupCarousel();
    this.bindEvents();
    this.updateActiveState();
  }

  setupCarousel() {
    // Apply scroll-snap styling
    this.track.style.scrollSnapType = 'x mandatory';
    this.track.style.scrollBehavior = this.reduceMotion ? 'auto' : 'smooth';
    
    // Set initial state
    this.updateActiveState();
  }

  bindEvents() {
    // Create locally bound methods for event listeners
    this.handleScrollBound = this.handleScroll.bind(this);
    this.handleKeyboardBound = this.handleKeyboard.bind(this);
    this.handleResizeBound = this.handleResize.bind(this);
    
    // Scroll event for updating current slide with debouncing
    const debounce = window.debounce || ((fn, delay) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    });
    
    const debouncedScroll = debounce(this.handleScrollBound, 100);
    this.track.addEventListener('scroll', debouncedScroll, { passive: true });

    // Navigation buttons (hidden on touch devices)
    if (!this.isTouch) {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.goToPrevious());
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.goToNext());
    }

    // Keyboard navigation
    this.track.addEventListener('keydown', this.handleKeyboardBound);

    // Touch/drag events for better mobile experience
    this.setupTouchEvents();

    // Window resize handler with debouncing
    const debouncedResize = debounce(this.handleResizeBound, 250);
    window.addEventListener('resize', debouncedResize);
  }

  setupTouchEvents() {
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - this.track.offsetLeft;
      scrollLeft = this.track.scrollLeft;
      isDragging = true;
    }, { passive: true });

    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - this.track.offsetLeft;
      const walk = (x - startX) * 2;
      this.track.scrollLeft = scrollLeft - walk;
    });

    this.track.addEventListener('touchend', () => {
      isDragging = false;
      this.snapToClosestSlide();
    });
  }

  handleScroll() {
    this.updateCurrentSlideFromScroll();
    this.updateActiveState();
  }

  updateCurrentSlideFromScroll() {
    const scrollLeft = this.track.scrollLeft;
    const slideWidth = this.slides[0].offsetWidth + 30; // Include gap
    const newSlide = Math.round(scrollLeft / slideWidth);
    
    this.currentSlide = Math.max(0, Math.min(newSlide, this.slides.length - 1));
  }

  updateActiveState() {
    // Update button states
    if (this.prevBtn && this.nextBtn) {
      this.prevBtn.disabled = this.currentSlide === 0;
      this.nextBtn.disabled = this.currentSlide === this.slides.length - 1;
      
      this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
      this.nextBtn.style.opacity = this.currentSlide === this.slides.length - 1 ? '0.5' : '1';
    }
  }

  goToPrevious() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.scrollToSlide();
    }
  }

  goToNext() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.scrollToSlide();
    }
  }

  scrollToSlide() {
    const slideWidth = this.slides[0].offsetWidth + 30; // Include gap
    const scrollPosition = this.currentSlide * slideWidth;
    
    this.track.scrollTo({
      left: scrollPosition,
      behavior: this.reduceMotion ? 'auto' : 'smooth'
    });
    
    this.updateActiveState();
  }

  snapToClosestSlide() {
    this.updateCurrentSlideFromScroll();
    this.scrollToSlide();
  }

  handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.goToNext();
    }
  }

  handleResize() {
    // Re-initialize if viewport changes between mobile/desktop
    const isMobile = window.innerWidth <= 992;
    const carouselVisible = this.carousel.style.display !== 'none';
    
    if (isMobile && !carouselVisible) {
      this.init();
    } else if (!isMobile && carouselVisible) {
      this.cleanup();
    }
  }

  cleanup() {
    // Clean up event listeners if switching to desktop view
    if (this.track) {
      // Use the bound methods we created in bindEvents for proper cleanup
      this.track.removeEventListener('scroll', this.handleScrollBound);
      this.track.removeEventListener('keydown', this.handleKeyboardBound);
    }
    
    window.removeEventListener('resize', this.handleResizeBound);
    
    // Remove button event listeners if they exist
    if (!this.isTouch) {
      if (this.prevBtn) this.prevBtn.onclick = null;
      if (this.nextBtn) this.nextBtn.onclick = null;
    }
  }
}

// Badge Animation Controller
class PhoneHoverEffects {
  constructor() {
    this.phones = document.querySelectorAll('.how__phone');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!this.reduceMotion) {
      this.init();
    }
  }

  init() {
    // Add hover effects for phones
    this.phones.forEach(phone => {
      const step = phone.closest('.how__step');
      if (step) {
        step.addEventListener('mouseenter', () => this.animatePhone(phone, true));
        step.addEventListener('mouseleave', () => this.animatePhone(phone, false));
      }
    });
  }

  animatePhone(phone, isHover) {
    if (this.reduceMotion) return;
    
    if (isHover) {
      phone.style.transform = 'translateY(-4px) scale(1.02)';
      phone.style.filter = 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.2))';
    } else {
      phone.style.transform = 'translateY(0) scale(1)';
      phone.style.filter = 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12))';
    }
  }
}

// Steps Intersection Observer
class StepsObserver {
  constructor() {
    this.steps = document.querySelectorAll('.steps__grid .how__step');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.reduceMotion) {
      // Show all steps immediately if motion is reduced
      this.steps.forEach(step => step.classList.add('is-visible'));
    } else {
      this.init();
    }
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.steps.forEach(step => step.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    this.steps.forEach(step => observer.observe(step));
  }
}

// Phone Image Loader with Loading States
class PhoneImageLoader {
  constructor() {
    this.phoneImages = document.querySelectorAll('.how__phone');
    this.init();
  }

  init() {
    this.phoneImages.forEach(img => {
      if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.addEventListener('load', () => {
          img.style.opacity = '1';
        });
        
        img.addEventListener('error', () => {
          console.warn('Failed to load image:', img.src);
          img.style.opacity = '0.5';
        });
      }
    });
  }
}

// Performance Monitoring
class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    // Monitor carousel performance
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name.includes('scroll') && entry.duration > 16) {
              console.warn('Potential scroll performance issue:', entry);
            }
          });
        });
        
        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        // Silently fail if performance monitoring isn't supported
      }
    }
  }
}

// Scroll Indicator Handler
class ScrollIndicator {
  constructor() {
    this.indicator = document.getElementById('scrollIndicator');
    this.isVisible = false;
    this.isAtBottom = false;
    this.ticking = false;
    
    if (this.indicator) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.checkScrollPosition();
  }

  bindEvents() {
    // Throttled scroll handler
    this.handleScrollBound = this.throttleScroll.bind(this);
    window.addEventListener('scroll', this.handleScrollBound, { passive: true });
    
    // Click handler
    this.indicator.addEventListener('click', this.handleClick.bind(this));
    
    // Resize handler
    this.handleResizeBound = () => {
      this.checkScrollPosition();
    };
    window.addEventListener('resize', this.handleResizeBound);
  }

  throttleScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.checkScrollPosition();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  checkScrollPosition() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollThreshold = 200; // Show after scrolling 200px
    const bottomThreshold = 100; // Consider "at bottom" when 100px from actual bottom

    // Determine if we should show the indicator
    const shouldShow = scrollY > scrollThreshold;
    
    // Determine if we're at the bottom
    const isAtBottom = (scrollY + windowHeight) >= (documentHeight - bottomThreshold);

    // Update visibility
    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      this.updateVisibility();
    }

    // Update bottom state
    if (isAtBottom !== this.isAtBottom) {
      this.isAtBottom = isAtBottom;
      this.updateBottomState();
    }
  }

  updateVisibility() {
    if (this.isVisible) {
      this.indicator.classList.add('visible');
      this.indicator.setAttribute('aria-hidden', 'false');
    } else {
      this.indicator.classList.remove('visible');
      this.indicator.setAttribute('aria-hidden', 'true');
    }
  }

  updateBottomState() {
    if (this.isAtBottom) {
      this.indicator.classList.add('at-bottom');
      this.indicator.setAttribute('aria-label', 'Scroll to top');
    } else {
      this.indicator.classList.remove('at-bottom');
      this.indicator.setAttribute('aria-label', 'Scroll to see more');
    }
  }

  handleClick() {
    const scrollOptions = {
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    };

    if (this.isAtBottom) {
      // Scroll to top
      window.scrollTo({
        top: 0,
        ...scrollOptions
      });
    } else {
      // Scroll to next section (steps section)
      const stepsSection = document.querySelector('.steps-section');
      if (stepsSection) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = stepsSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          ...scrollOptions
        });
      }
    }
  }

  destroy() {
    if (this.handleScrollBound) {
      window.removeEventListener('scroll', this.handleScrollBound);
    }
    if (this.handleResizeBound) {
      window.removeEventListener('resize', this.handleResizeBound);
    }
  }
}

// Email Subscription Handler (for how-it-works page)
class HowItWorksEmailSubscription {
  constructor() {
    this.form = document.getElementById('hiw-signup-form');
    this.emailInput = this.form?.querySelector('input[type="email"]');
    this.submitBtn = this.form?.querySelector('.cta-form__btn');
    this.toast = document.getElementById('toast');
    
    if (this.form && this.emailInput) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = this.emailInput.value.trim();
    
    // Basic validation
    if (!email || !this.validateEmail(email)) {
      this.showToast('Please enter a valid email address', 'error');
      return;
    }

    // Set loading state
    this.setLoadingState(true);
    
    try {
      const response = await this.submitEmail(email);
      
      if (response.success) {
        this.showToast(response.message);
        this.form.reset();
      } else {
        this.showToast(response.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  async submitEmail(email) {
    const endpoint = "https://script.google.com/macros/s/AKfycbxMtHQ5h6LNtIZmR9zPQuf3DQuGGBImS7Wll5GfK8Ox4kYg9C3VYj2U24WExBdUj0z-/exec"; 

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new URLSearchParams({ email: email }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const text = await response.text();
      return { success: text === "Success", message: text === "Success" ? "Thanks for signing up!" : "Error: " + text };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Something went wrong." };
    }
  }

  validateEmail(email) {
    // Use shared utility function from core.js for consistency
    if (window.validateEmail) {
      return window.validateEmail(email);
    }
    
    // Fallback if the core utility isn't available
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  setLoadingState(isLoading) {
    if (!this.submitBtn) return;
    
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Sending...';
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Join Waitlist';
    }
  }
  
  showToast(message, type = 'success') {
    if (!this.toast) return;
    
    // Use shared Toast utility from core.js
    if (typeof window.Toast === 'function') {
      const toast = new window.Toast();
      toast.show(message, type, 3000);
    } else {
      // Fallback if Toast utility is not available
      this.toast.textContent = message;
      this.toast.className = `toast toast--${type}`;
      this.toast.classList.add('show');
      
      setTimeout(() => {
        this.toast.classList.remove('show');
      }, 3000);
    }
  }
}

/**
 * Main initialization function for How It Works page
 * Initializes all components and tracks page view
 */
function init() {
  // Initialize all components
  try {
    new HowItWorksCarousel();
    new PhoneHoverEffects();
    new StepsObserver();
    new PhoneImageLoader();
    new PerformanceMonitor();
    new ScrollIndicator();
    new HowItWorksEmailSubscription();
  } catch (error) {
    console.error('Error initializing How It Works components:', error);
  }
  
  // Make sure core features are initialized
  if (typeof window.initCore === 'function') {
    window.initCore();
  }
  
  // Track page view for analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'How It Works',
      page_location: window.location.href
    });
  }
  
  console.log('How It Works page initialized');
}

// Export for use in other modules
export { 
  init, 
  HowItWorksCarousel,
  PhoneHoverEffects,
  StepsObserver,
  PhoneImageLoader,
  ScrollIndicator
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
