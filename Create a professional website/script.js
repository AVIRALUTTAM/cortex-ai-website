/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2600);
});

/* ─── CUSTOM CURSOR ─── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

(function animCursor() {
  cx += (mx - cx) * 0.1;
  cy += (my - cy) * 0.1;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animCursor);
})();

/* ─── SCROLL PROGRESS ─── */
const prog = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  prog.style.width = pct + '%';
}, { passive: true });

/* ─── NAVBAR ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── MOBILE MENU ─── */
const menuBtn  = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

/* ─── HERO CANVAS — mesh network ─── */
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, pts;
  const NUM = 80, LINK_DIST = 140;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkPt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.5 + .5,
    };
  }

  function init() { resize(); pts = Array.from({ length: NUM }, mkPt); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const b   = pts[j];
        const dx  = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / LINK_DIST) * 0.12})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  init(); draw();
  window.addEventListener('resize', () => { resize(); pts = Array.from({ length: NUM }, mkPt); });
})();

/* ─── TYPEWRITER ─── */
(function typewriter() {
  const el    = document.getElementById('typewriter');
  const words = ['Real Revenue', 'Smarter Teams', 'Faster Workflows', 'Your Competitive Edge'];
  let wi = 0, ci = 0, deleting = false;
  const speed = { type: 80, delete: 40, pause: 2200 };

  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; return setTimeout(tick, speed.pause); }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, deleting ? speed.delete : speed.type);
  }
  tick();
})();

/* ─── AOS — scroll reveal ─── */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  els.forEach(el => {
    const delay = parseFloat(el.dataset.aosDelay || 0);
    el.style.transitionDelay = delay + 'ms';
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

/* ─── COUNTER ANIMATION ─── */
function animCount(el, target) {
  const dur = 1600, start = performance.now();
  const run = now => {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.floor(target * ease);
    if (t < 1) requestAnimationFrame(run);
    else el.textContent = target;
  };
  requestAnimationFrame(run);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const val = parseInt(el.dataset.count, 10);
    animCount(el, val);
    counterObs.unobserve(el);
  });
}, { threshold: .5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* ─── METRIC BARS ─── */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const bar = e.target;
    const pct = Math.min(parseInt(bar.dataset.pct, 10), 100);
    bar.style.width = pct + '%';
    barObs.unobserve(bar);
  });
}, { threshold: .3 });
document.querySelectorAll('.metric-bar').forEach(b => barObs.observe(b));

/* ─── CARD TILT ─── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = (e.clientY - rect.top)  / rect.height;
    const rx   = (y - .5) * 10;
    const ry   = (x - .5) * -10;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    card.style.setProperty('--mx', (x * 100) + '%');
    card.style.setProperty('--my', (y * 100) + '%');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── TESTIMONIAL SLIDER ─── */
(function testiSlider() {
  const track  = document.getElementById('testiTrack');
  const dotsEl = document.getElementById('testiDots');
  const cards  = track.querySelectorAll('.testi-card');
  const total  = cards.length;
  let   cur    = 0, perView = 3, autoTimer;

  function getPerView() {
    return window.innerWidth <= 968 ? 1 : 3;
  }

  function render() {
    perView = getPerView();
    const w = (track.parentElement.offsetWidth + 20) / perView;
    track.style.transform = `translateX(-${cur * w}px)`;
    dotsEl.innerHTML = '';
    const pages = total - perView + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === cur ? ' active' : '');
      d.addEventListener('click', () => { cur = i; render(); resetAuto(); });
      dotsEl.appendChild(d);
    }
  }

  function next() { cur = Math.min(cur + 1, total - perView); render(); }
  function prev() { cur = Math.max(cur - 1, 0); render(); }

  function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(next, 4000); }

  document.getElementById('testiBtnNext').addEventListener('click', () => { next(); resetAuto(); });
  document.getElementById('testiBtnPrev').addEventListener('click', () => { prev(); resetAuto(); });

  render(); resetAuto();
  window.addEventListener('resize', render);
})();

/* ─── FAQ ACCORDION ─── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.parentElement;
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

/* ─── ROI CALCULATOR ─── */
const roiEmp  = document.getElementById('roiEmp');
const roiHrs  = document.getElementById('roiHrs');
const roiHrsV = document.getElementById('roiHrsVal');
const roiRate = document.getElementById('roiRate');
const roiHSav = document.getElementById('roiHrsSaved');
const roiMon  = document.getElementById('roiMon');
const roiAnn  = document.getElementById('roiAnn');

function fmtINR(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

function calcROI() {
  const emp  = parseFloat(roiEmp.value)  || 0;
  const hrs  = parseFloat(roiHrs.value)  || 0;
  const rate = parseFloat(roiRate.value) || 0;
  roiHrsV.textContent = hrs;
  const mon  = emp * hrs * 0.7 * 4.33;
  const mSav = mon * rate;
  roiHSav.textContent = Math.round(mon).toLocaleString('en-IN') + ' hrs';
  roiMon.textContent  = fmtINR(mSav);
  roiAnn.textContent  = fmtINR(mSav * 12);
}
[roiEmp, roiHrs, roiRate].forEach(el => el && el.addEventListener('input', calcROI));
calcROI();

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); }
  });
});

/* ─── CHAT WIDGET ─── */
const floatChat = document.getElementById('floatChat');
const chatPopup = document.getElementById('chatPopup');
const chatClose = document.getElementById('chatClose');
const chatBody  = document.getElementById('chatBody');

floatChat.addEventListener('click', () => chatPopup.classList.toggle('open'));
chatClose.addEventListener('click',  () => chatPopup.classList.remove('open'));

document.querySelectorAll('.chat-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    addChatMsg(btn.dataset.msg, 'user');
    document.querySelector('.chat-opts')?.remove();
    setTimeout(() => {
      const r = {
        'Book a consultation':       "Great choice! Please scroll to our contact form and we'll schedule a 30-min call within 24 hours.",
        'Tell me about pricing':     "Our plans start at ₹15,000 for startups. Check the pricing section, or tell us your team size for a custom quote.",
        'What services do you offer?': "We offer AI Automation, Agents, Analytics, Chatbots, Custom AI Dev, and Strategy Consulting. Which area interests you most?",
      };
      addChatMsg(r[btn.dataset.msg] || "Happy to help! Scroll down to our contact form for a free consultation.", 'bot');
    }, 600);
  });
});

function addChatMsg(text, type) {
  const el = document.createElement('div');
  el.className = 'chat-msg ' + type;
  el.textContent = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* ─── FOOTER YEAR ─── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─── CONTACT FORM VALIDATION (Firebase submit in firebase.js) ─── */
function validateForm() {
  let ok = true;
  const fields = [
    { id: 'fname',      errId: 'err-name',      msg: 'Name is required' },
    { id: 'femail',     errId: 'err-email',      msg: 'Valid email required' },
    { id: 'fchallenge', errId: 'err-challenge',  msg: 'Please describe your challenge' },
  ];
  fields.forEach(({ id, errId, msg }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    const val = el.value.trim();
    if (!val || (id === 'femail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
      el.classList.add('error');
      err.textContent = msg;
      ok = false;
    } else {
      el.classList.remove('error');
      err.textContent = '';
    }
  });
  return ok;
}

window.submitContact = async function(e) {
  e.preventDefault();
  if (!validateForm()) return;
  // Actual submission handled in firebase.js
};

document.getElementById('contactForm').addEventListener('submit', window.submitContact);
