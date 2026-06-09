// ============== NAVBAR SCROLL EFFECT ==============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// ============== MOBILE MENU ==============
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ============== FAQ ACCORDION ==============
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// ============== ROI CALCULATOR ==============
const roiEmployees = document.getElementById('roiEmployees');
const roiHours = document.getElementById('roiHours');
const roiHoursVal = document.getElementById('roiHoursVal');
const roiRate = document.getElementById('roiRate');
const roiHoursSaved = document.getElementById('roiHoursSaved');
const roiMonthly = document.getElementById('roiMonthly');
const roiAnnual = document.getElementById('roiAnnual');

function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function calcROI() {
  const emp = parseFloat(roiEmployees.value) || 0;
  const hrs = parseFloat(roiHours.value) || 0;
  const rate = parseFloat(roiRate.value) || 0;
  roiHoursVal.textContent = hrs;
  // Assume AI automates 70% of repetitive work
  const automationRate = 0.7;
  const weeklyHoursSaved = emp * hrs * automationRate;
  const monthlyHoursSaved = weeklyHoursSaved * 4.33;
  const monthlySavings = monthlyHoursSaved * rate;
  const annualSavings = monthlySavings * 12;
  roiHoursSaved.textContent = Math.round(monthlyHoursSaved).toLocaleString('en-IN');
  roiMonthly.textContent = formatINR(monthlySavings);
  roiAnnual.textContent = formatINR(annualSavings);
}

[roiEmployees, roiHours, roiRate].forEach(el => {
  el.addEventListener('input', calcROI);
});
calcROI();

// ============== CONTACT FORM ==============
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  // In production, send to backend / CRM (HubSpot, n8n webhook, etc.)
  formSuccess.classList.add('show');
  contactForm.reset();
  setTimeout(() => {
    formSuccess.classList.remove('show');
  }, 6000);
});

// ============== CHAT WIDGET ==============
const floatChat = document.getElementById('floatChat');
const chatPopup = document.getElementById('chatPopup');
const chatClose = document.getElementById('chatClose');
const chatBody = document.getElementById('chatBody');

floatChat.addEventListener('click', () => chatPopup.classList.toggle('open'));
chatClose.addEventListener('click', () => chatPopup.classList.remove('open'));

document.querySelectorAll('.chat-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const userMsg = btn.dataset.msg;
    appendChatMsg(userMsg, 'user');
    // remove options after first selection
    const opts = document.querySelector('.chat-options');
    if (opts) opts.remove();
    setTimeout(() => {
      let reply = "Great! Let me connect you with our team. Please scroll down to fill out the consultation form and we'll get back within 24 hours.";
      if (userMsg.includes('pricing')) reply = "Our plans start at ₹15,000. Scroll to the pricing section for details — or share your needs and we'll send a custom quote.";
      if (userMsg.includes('services')) reply = "We offer AI Automation, AI Agents, Data Analytics, Chatbots, and Custom AI Development. Which one interests you most?";
      appendChatMsg(reply, 'bot');
    }, 600);
  });
});

function appendChatMsg(text, type) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + type;
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// ============== SCROLL REVEAL ANIMATIONS ==============
const revealEls = document.querySelectorAll('.service-card, .case-card, .price-card, .industry-card, .process-step, .faq-item, .stat, .pillar, .contact-point');
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// ============== FOOTER YEAR ==============
document.getElementById('year').textContent = new Date().getFullYear();

// ============== SMOOTH SCROLL ENHANCEMENT ==============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
