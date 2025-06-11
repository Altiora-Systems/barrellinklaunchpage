/* ===========================
   LANDING PAGE SPECIFIC FUNCTIONALITY
   =========================== */

// Email Subscription Handler
class EmailSubscription {
  constructor() {
    this.form = document.getElementById('signup-form');
    this.emailInput = document.getElementById('email');
    this.submitBtn = this.form?.querySelector('.signup__btn');
    this.errorContainer = document.getElementById('email-error');
    this.toast = new window.Toast();
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    this.emailInput.addEventListener('input', () => this.clearError());
    this.emailInput.addEventListener('blur', () => this.validateEmail());
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = this.emailInput.value.trim();
    
    // Validate email
    if (!this.validateEmail(email)) {
      return;
    }

    // Set loading state
    this.setLoadingState(true);
    
    try {
      // Simulate API call (replace with actual endpoint)
      const response = await this.submitEmail(email);
      
      if (response.success) {
        this.handleSuccess();
      } else {
        this.handleError(response.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.handleError('Network error. Please check your connection and try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async submitEmail(email) {
    // Simulate API call with delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, simulate success
        // In production, replace with actual fetch to /subscribe endpoint
        resolve({ success: true });
        
        /* Production code would look like:
        try {
          const response = await fetch('/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
          
          const data = await response.json();
          resolve(data);
        } catch (error) {
          resolve({ success: false, message: error.message });
        }
        */
      }, 1000);
    });
  }

  validateEmail(email = this.emailInput.value.trim()) {
    this.clearError();
    
    if (!email) {
      this.showError('Email is required');
      return false;
    }
    
    if (!window.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    
    return true;
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.emailInput.classList.add('error');
    this.emailInput.setAttribute('aria-invalid', 'true');
  }

  clearError() {
    this.errorContainer.textContent = '';
    this.emailInput.classList.remove('error');
    this.emailInput.setAttribute('aria-invalid', 'false');
  }

  setLoadingState(loading) {
    if (loading) {
      this.submitBtn.classList.add('loading');
      this.submitBtn.disabled = true;
      this.emailInput.disabled = true;
    } else {
      this.submitBtn.classList.remove('loading');
      this.submitBtn.disabled = false;
      this.emailInput.disabled = false;
    }
  }

  handleSuccess() {
    this.toast.show('Thank you! We\'ll notify you when BarrelLink launches.', 'success');
    this.form.reset();
    this.clearError();
    
    // Optional: Track successful subscription
    this.trackSubscription();
  }

  handleError(message) {
    this.toast.show(message, 'error');
  }

  trackSubscription() {
    // Analytics tracking (replace with your analytics solution)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'signup', {
        event_category: 'engagement',
        event_label: 'email_subscription'
      });
    }
    
    // Console log for development
    console.log('Email subscription successful');
  }
}

// Why Section Animation
class WhyAnimation {
  constructor() {
    this.section = document.querySelector('.why');
    this.features = document.querySelectorAll('.why__feature');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.section && !this.reduceMotion) {
      this.init();
    }
  }

  init() {
    // Add fade-in class to features
    this.features.forEach((feature, index) => {
      feature.classList.add('fade-in');
      feature.style.transitionDelay = `${index * 0.1}s`;
    });

    // Set up intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateFeatures();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    observer.observe(this.section);
  }

  animateFeatures() {
    this.features.forEach((feature, index) => {
      setTimeout(() => {
        feature.classList.add('is-visible');
      }, index * 100);
    });
  }
}

// Hero Image Loading Optimization
class HeroImageLoader {
  constructor() {
    this.heroImage = document.querySelector('.hero__image img');
    
    if (this.heroImage) {
      this.init();
    }
  }

  init() {
    // Preload the hero image if not already loaded
    if (!this.heroImage.complete) {
      this.heroImage.addEventListener('load', () => {
        this.heroImage.style.opacity = '1';
      });
      
      // Set initial opacity for fade-in effect
      this.heroImage.style.opacity = '0';
      this.heroImage.style.transition = 'opacity 0.3s ease';
    }
  }
}

// Initialize Landing Page Features
document.addEventListener('DOMContentLoaded', () => {
  // Initialize email subscription
  new EmailSubscription();
  
  // Initialize why section animation
  new WhyAnimation();
  
  // Initialize hero image loading
  new HeroImageLoader();
  
  // Add hover effects for interactive elements
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        button.style.transform = 'translateY(-2px)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
});
