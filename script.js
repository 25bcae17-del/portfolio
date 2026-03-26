// ===========================
// CHINMAY KARTHIK — PORTFOLIO
// script.js
// ===========================

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile hamburger ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- Scroll reveal ----
const reveals = document.querySelectorAll('.section-title, .about-grid, .skills-grid, .projects-grid, .workflow-diagram, .contact-grid, .section-label, .about-right, .workflow-tools, .contact-sub, .workflow-desc, .skills-bars');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ---- Skill bars animation ----
const skillBars = document.querySelectorAll('.skill-bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
    }
  });
}, { threshold: 0.3 });
skillBars.forEach(bar => barObserver.observe(bar));

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let currentSection = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      currentSection = section.id;
    }
  });
  navItems.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === '#' + currentSection) {
      a.style.color = 'var(--white)';
    }
  });
});

// ---- Contact Form ----
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

// IMPORTANT: Replace this URL with your actual Render.com backend URL after deployment
// Example: 'https://chinmay-portfolio-backend.onrender.com/api/contact'
const BACKEND_URL = 'https://portfolio-hfk1.onrender.com/';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Sending...';

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();

    if (response.ok) {
      showStatus('✓ Message sent! I\'ll get back to you soon.', 'success');
      form.reset();
    } else {
      showStatus(data.error || 'Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    // If backend not connected yet, show a friendly message
    showStatus('Backend not connected yet. Set BACKEND_URL in script.js after deploying to Render.', 'error');
    console.error('Error:', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send Message';
  }
});

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status ' + type;
  setTimeout(() => {
    formStatus.className = 'form-status';
  }, 5000);
}
