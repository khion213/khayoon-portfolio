/**
 * Khayoon Alaayedi — Portfolio Client Application Orchestrator
 * Handles navigation drawer, smooth scrolling, active section tracking,
 * animations, and the real secure contact form conduit.
 */

import { CelestialScene } from './three-scene.js';
import {
  profileData,
  socialLinks,
  educationData,
  leadershipData,
  skillsData,
  projectsData,
  spaceData,
  impactData,
  achievementsData,
  certificationsData
} from './data.js';

class PortfolioApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.celestialScene = null;
    this.navToggle = document.getElementById('nav-toggle');
    this.navDrawer = document.getElementById('nav-drawer');
    this.navOverlay = document.getElementById('nav-overlay');
    this.navClose = document.getElementById('nav-close');
    this.navLinks = document.querySelectorAll('.nav-drawer-link, .nav-bar-link');
    this.contactForm = document.getElementById('contact-form');
    this.formFeedback = document.getElementById('form-feedback');
    this.sections = document.querySelectorAll('section[id]');
    this.currentActiveSection = 'hero';

    this.init();
  }

  init() {
    // 1. Initialize Three.js celestial background
    if (this.canvas) {
      try {
        this.celestialScene = new CelestialScene(this.canvas);
      } catch (err) {
        console.error('Three.js scene initialization error:', err);
      }
    }

    // 2. Bind navigation events
    this.bindNavigation();

    // 3. Setup ScrollSpy & Reveal Animations
    this.bindScrollObservers();

    // 4. Bind Real Working Contact Form
    this.bindContactForm();

    // 5. Bind Direct Email Actions & Copy Conduit
    this.bindDirectMailActions();

    // 6. Header scroll appearance
    this.bindHeaderScroll();
  }

  bindDirectMailActions() {
    const copyBtn = document.getElementById('btn-copy-email');
    const copyText = document.getElementById('copy-email-text');
    if (copyBtn && copyText) {
      copyBtn.addEventListener('click', async () => {
        const emailAddress = 'Khion2002@gmail.com';
        try {
          await navigator.clipboard.writeText(emailAddress);
          copyText.textContent = 'Copied!';
          copyBtn.style.borderColor = '#34d399';
          setTimeout(() => {
            copyText.textContent = 'Copy: Khion2002@gmail.com';
            copyBtn.style.borderColor = '';
          }, 3000);
        } catch (err) {
          copyText.textContent = 'Copy: ' + emailAddress;
        }
      });
    }
  }

  bindNavigation() {
    // Hamburger toggle click
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        const isOpen = this.navDrawer.classList.contains('is-open');
        if (isOpen) {
          this.closeDrawer();
        } else {
          this.openDrawer();
        }
      });
    }

    // Close button inside drawer
    if (this.navClose) {
      this.navClose.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Click outside on backdrop overlay to close
    if (this.navOverlay) {
      this.navOverlay.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Press Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navDrawer?.classList.contains('is-open')) {
        this.closeDrawer();
      }
    });

    // Links click handling with smooth scroll & auto-close
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            this.closeDrawer();

            // Calculate header offset for perfect alignment
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight + 10;

            window.scrollTo({
              top: targetId === 'hero' ? 0 : offsetPosition,
              behavior: 'smooth'
            });

            // Update URL hash smoothly without jump
            history.pushState(null, null, `#${targetId}`);
          }
        }
      });
    });
  }

  openDrawer() {
    if (!this.navDrawer) return;
    this.navDrawer.classList.add('is-open');
    this.navOverlay?.classList.add('is-visible');
    this.navToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    if (!this.navDrawer) return;
    this.navDrawer.classList.remove('is-open');
    this.navOverlay?.classList.remove('is-visible');
    this.navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  bindHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  bindScrollObservers() {
    // 1. ScrollSpy for Active Section Indicator
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.currentActiveSection = sectionId;
          this.updateActiveNavIndicators(sectionId);
        }
      });
    }, observerOptions);

    this.sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    // 2. Reveal animations on cards & headers
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  updateActiveNavIndicators(sectionId) {
    this.navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    // Update active chapter badge in header
    const currentChapterBadge = document.getElementById('current-chapter-title');
    if (currentChapterBadge) {
      const formattedTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      currentChapterBadge.textContent = formattedTitle;
    }
  }

  bindContactForm() {
    if (!this.contactForm) return;

    this.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = this.contactForm.querySelector('button[type="submit"]');
      const btnText = submitBtn?.querySelector('.btn-label');
      const btnSpinner = submitBtn?.querySelector('.btn-spinner');

      // Clear previous feedback
      this.showFeedback('', 'neutral');

      // Extract form values
      const formData = new FormData(this.contactForm);
      const name = formData.get('name')?.toString().trim();
      const email = formData.get('email')?.toString().trim();
      const subject = formData.get('subject')?.toString().trim();
      const message = formData.get('message')?.toString().trim();
      const website = formData.get('website')?.toString().trim(); // Honeypot

      // Client-side validation checks
      if (!name || name.length < 2) {
        this.showFeedback('Please provide your full name (at least 2 characters).', 'error');
        document.getElementById('contact-name')?.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        this.showFeedback('Please provide a valid email address so Khayoon can reply.', 'error');
        document.getElementById('contact-email')?.focus();
        return;
      }

      if (!message || message.length < 10) {
        this.showFeedback('Please provide a message with at least 10 characters.', 'error');
        document.getElementById('contact-message')?.focus();
        return;
      }

      // Enter loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Transmitting Message...';
      if (btnSpinner) btnSpinner.classList.remove('is-hidden');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            subject: subject || 'Portfolio General Inquiry',
            message,
            website // Honeypot
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const refText = data.referenceId ? ` (Ref: ${data.referenceId})` : '';

          if (data.deliveredViaServer) {
            this.showFeedback(
              `Message transmitted successfully!${refText} Khayoon has received your communication and will reply promptly.`,
              'success'
            );
            this.contactForm.reset();
          } else {
            // Provide immediate one-click link so the user can send via Gmail
            this.showFeedback(
              `Your inquiry has been recorded (${refText}). Click below to complete sending directly to <strong>Khion2002@gmail.com</strong>:`,
              'success',
              `
                <div class="feedback-action-row">
                  <a href="${data.gmailUrl}" target="_blank" rel="noopener noreferrer" class="btn-mail-action btn-mail-gmail">
                    Open & Send in Gmail &rarr;
                  </a>
                </div>
              `
            );
            // Also attempt to open Gmail compose in a new tab automatically
            try {
              window.open(data.gmailUrl, '_blank');
            } catch (_) {}
          }
        } else {
          this.showFeedback(
            data.error || 'Unable to deliver message right now. Please try again shortly.',
            'error'
          );
        }
      } catch (err) {
        console.error('Contact submit exception:', err);
        this.showFeedback(
          'Network connection error. Please check your connectivity or email Khion2002@gmail.com directly.',
          'error'
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        if (btnSpinner) btnSpinner.classList.add('is-hidden');
      }
    });
  }

  showFeedback(message, type, extraHtml = '') {
    if (!this.formFeedback) return;

    if (!message) {
      this.formFeedback.className = 'form-feedback is-hidden';
      this.formFeedback.textContent = '';
      return;
    }

    this.formFeedback.className = `form-feedback form-feedback--${type}`;
    this.formFeedback.innerHTML = `
      <div class="form-feedback-inner">
        <span class="form-feedback-icon">${type === 'success' ? '✓' : '⚠'}</span>
        <div>
          <span class="form-feedback-text">${message}</span>
          ${extraHtml}
        </div>
      </div>
    `;
    this.formFeedback.classList.remove('is-hidden');
    this.formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Bootstrap application on DOM readiness
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new PortfolioApp();
});
