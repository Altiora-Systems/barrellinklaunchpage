/* ===========================
   HOW IT WORKS PAGE FUNCTIONALITY
   =========================== */

// Debounce utility for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
    // Scroll event for updating current slide
    const debouncedScroll = debounce(() => this.handleScroll(), 100);
    this.track.addEventListener('scroll', debouncedScroll, { passive: true });

    // Navigation buttons (hidden on touch devices)
    if (!this.isTouch) {
      this.prevBtn?.addEventListener('click', () => this.goToPrevious());
      this.nextBtn?.addEventListener('click', () => this.goToNext());
    }

    // Keyboard navigation
    this.track.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Touch/drag events for better mobile experience
    this.setupTouchEvents();

    // Window resize handler
    window.addEventListener('resize', debounce(() => this.handleResize(), 250));
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
    this.track.removeEventListener('scroll', this.handleScroll);
    this.track.removeEventListener('keydown', this.handleKeyboard);
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

// Main initialization function
function init() {
  // Initialize all components
  new HowItWorksCarousel();
  new PhoneHoverEffects();
  new StepsObserver();
  new PhoneImageLoader();
  new PerformanceMonitor();
  
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
export { init, HowItWorksCarousel };

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
