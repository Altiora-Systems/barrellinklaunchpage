/* ===========================
   LANDING PAGE SPECIFIC FUNCTIONALITY
   =========================== */

// Animation functionality for smooth page loading
document.addEventListener('DOMContentLoaded', () => {
  // Elements to animate
  const heroTitle = document.querySelector('.hero__title');
  const heroSubtitle = document.querySelector('.hero__subtitle');
  const heroForm = document.querySelector('.hero__form');
  const heroImage = document.querySelector('.hero__image');
  const whyTitle = document.querySelector('.why-section__title');
  const whySubtitle = document.querySelector('.why-section__subtitle');
  const whyCards = document.querySelectorAll('.why-card');
  
  // Add animation classes
  if (heroTitle) heroTitle.classList.add('fade-in-left');
  if (heroSubtitle) heroSubtitle.classList.add('fade-in-left');
  if (heroForm) heroForm.classList.add('fade-in-left');
  if (heroImage) heroImage.classList.add('fade-in-right');
  if (whyTitle) whyTitle.classList.add('fade-in');
  if (whySubtitle) whySubtitle.classList.add('fade-in');
  whyCards.forEach(card => card.classList.add('fade-in'));
  
  // Trigger animations after a short delay
  setTimeout(() => {
    if (heroTitle) heroTitle.classList.add('is-visible');
    
    setTimeout(() => {
      if (heroSubtitle) heroSubtitle.classList.add('is-visible');
      
      setTimeout(() => {
        if (heroForm) heroForm.classList.add('is-visible');
        if (heroImage) heroImage.classList.add('is-visible');
      }, 200);
    }, 200);
  }, 300);
  
  // Intersection Observer for "Why BarrelLink" section
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements
  if (whyTitle) observer.observe(whyTitle);
  if (whySubtitle) observer.observe(whySubtitle);
  
  // Card observer with delay for each card
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, 150 * index);
        cardObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe cards
  whyCards.forEach(card => {
    cardObserver.observe(card);
  });
  
  // Header scroll effect is handled in core.js
});

// Email Subscription Handler
class EmailSubscription {
  constructor() {
    this.form = document.getElementById('homepage-signup');
    this.emailInput = this.form?.querySelector('input[type="email"]');
    this.submitBtn = this.form?.querySelector('.form__btn');
    this.toast = document.getElementById('toast');
    
    console.log('EmailSubscription constructor: Form found?', !!this.form);

    if (this.form && this.emailInput) {
      this.init();
    }
  }

  init() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = this.emailInput.value.trim();
    
    console.log('Attempting to submit email:', email);

    // Basic validation
    if (!email || !this.validateEmail(email)) {
      this.showToast('Please enter a valid email address');
      return;
    }

    // Set loading state
    this.setLoadingState(true);
    
    try {
      // Simulate API call (replace with actual endpoint)
      const response = await this.submitEmail(email);
      
      if (response.success) {
        this.showToast(response.message);
        this.form.reset();
      } else {
        this.showToast(response.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.showToast('Network error. Please check your connection and try again.');
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
      this.submitBtn.textContent = 'Sign Up';
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
 * Main initialization function for landing page
 * Initializes all components and tracks page view
 */
function init() {
  console.log('init() function called');
  // Initialize the email subscription form
  new EmailSubscription();
  
  // Make sure core features are initialized
  if (typeof window.initCore === 'function') {
    window.initCore();
  }
  
  // Track page view for analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'Home',
      page_location: window.location.href
    });
  }
  
  console.log('Landing page initialized');
}

// Export for use in other modules
export { init, EmailSubscription };

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
