/* Shared navbar + footer injected into every page */
(function injectSharedLayout() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function navLink(href, label) {
    const active = currentPage === href ? ' class="active"' : '';
    return `<a href="${href}"${active}>${label}</a>`;
  }

  const navHTML = `
<nav id="navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-logo">
      Cortex<span>AI</span>
    </a>
    <div class="nav-links" id="navLinks">
      ${navLink('index.html',       'Home')}
      ${navLink('services.html',    'Services')}
      ${navLink('ai-training.html', 'AI Training')}
      ${navLink('about.html',       'About')}
      ${navLink('careers.html',     'Careers')}
      ${navLink('blog.html',        'Blog')}
      ${navLink('pricing.html',     'Pricing')}
    </div>
    <div class="nav-right">
      <a href="contact.html" class="btn btn-white btn-sm">Get Started →</a>
      <button class="menu-toggle" id="menuToggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>`;

  const footerHTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo" style="font-size:1.5rem;margin-bottom:16px">Cortex<span>AI</span></div>
        <p>Enterprise AI consulting, automation, DevOps and employee training. Turning intelligence into competitive advantage since 2022.</p>
        <div class="footer-social">
          <a href="https://linkedin.com/in/aviral-uttam" target="_blank" rel="noopener" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="mailto:aviraluttam@gmail.com" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="services.html#automation">AI Automation</a>
        <a href="services.html#agents">AI Agents</a>
        <a href="services.html#devops">DevOps & Cloud</a>
        <a href="ai-training.html">AI Training</a>
        <a href="services.html#analytics">Data & Analytics</a>
        <a href="services.html#custom">Custom AI Dev</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="about.html">About Us</a>
        <a href="careers.html">Careers</a>
        <a href="blog.html">Blog</a>
        <a href="pricing.html">Pricing</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer-col">
        <h4>Contact Us</h4>
        <div class="footer-contact-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.34 2 2 0 0 1 3.59 2.1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/></svg>
          <a href="tel:+919876543210">+91 98765 43210</a>
        </div>
        <div class="footer-contact-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="mailto:aviraluttam@gmail.com">aviraluttam@gmail.com</a>
        </div>
        <div class="footer-contact-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Bengaluru, India</span>
        </div>
        <h4 style="margin-top:20px">Newsletter</h4>
        <div class="footer-sub">
          <input type="email" id="footerEmail" placeholder="your@email.com" aria-label="Newsletter email"/>
          <button id="footerSubBtn">→</button>
        </div>
        <div id="footerMsg" class="footer-msg"></div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span id="year"></span> Cortex AI Pvt. Ltd. All rights reserved.</p>
      <div class="footer-legal">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>`;

  const navEl = document.getElementById('nav-placeholder');
  if (navEl) navEl.innerHTML = navHTML;

  const footerEl = document.getElementById('footer-placeholder');
  if (footerEl) footerEl.innerHTML = footerHTML;

  /* re-attach mobile menu toggle (injected after DOM) */
  requestAnimationFrame(() => {
    const menuBtn  = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
      navLinks.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navLinks.classList.remove('open'))
      );
    }
    /* footer year */
    const yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();

    /* navbar scroll class */
    const nav = document.getElementById('navbar');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });
    }
  });
})();
