/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const l = document.getElementById('loader');
    if (l) l.classList.add('hidden');
  }, 2600);
});

/* ─── CUSTOM CURSOR ─── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
if (cursor && cursorDot) {
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
}

/* ─── SCROLL PROGRESS ─── */
const prog = document.getElementById('scrollProgress');
if (prog) {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    prog.style.width = pct + '%';
  }, { passive: true });
}

/* ─── ENTRY POPUP ─── */
(function initPopup() {
  const overlay = document.getElementById('entryPopup');
  if (!overlay) return;

  const SEEN_KEY = 'cortex_popup_seen';
  if (localStorage.getItem(SEEN_KEY)) return;

  function showPopup() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    localStorage.setItem(SEEN_KEY, '1');
  }

  setTimeout(showPopup, 3000);

  document.getElementById('popupClose').addEventListener('click', hidePopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) hidePopup(); });

  document.getElementById('popupForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name     = document.getElementById('pName').value.trim();
    const email    = document.getElementById('pEmail').value.trim();
    const phone    = document.getElementById('pPhone').value.trim();
    const industry = document.getElementById('pIndustry').value;

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone) {
      if (!name)  document.getElementById('pName').style.borderColor  = 'rgba(255,80,80,.5)';
      if (!email) document.getElementById('pEmail').style.borderColor = 'rgba(255,80,80,.5)';
      if (!phone) document.getElementById('pPhone').style.borderColor = 'rgba(255,80,80,.5)';
      return;
    }

    const btn = document.getElementById('popupSubmit');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    /* window.savePopupLead is set by firebase.js */
    if (typeof window.savePopupLead === 'function') {
      await window.savePopupLead({ name, email, phone, industry, page: location.href });
    }

    document.getElementById('popupSuccess').classList.add('show');
    setTimeout(hidePopup, 2200);
  });
})();

/* ─── THREE.JS HERO ─── */
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth || window.innerWidth, canvas.offsetHeight || window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, (canvas.offsetWidth || window.innerWidth) / (canvas.offsetHeight || window.innerHeight), 0.1, 1000);
  camera.position.z = 40;

  /* floating wireframe shapes */
  const geos = [
    new THREE.IcosahedronGeometry(3, 0),
    new THREE.OctahedronGeometry(2.5, 0),
    new THREE.TetrahedronGeometry(2.8, 0),
    new THREE.IcosahedronGeometry(1.6, 0),
  ];
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12 });

  const meshes = [];
  for (let i = 0; i < 18; i++) {
    const geo  = geos[i % geos.length];
    const mesh = new THREE.Mesh(geo, wireMat.clone());
    mesh.position.set((Math.random() - .5) * 90, (Math.random() - .5) * 60, (Math.random() - .5) * 50);
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    mesh.userData.rx = (Math.random() - .5) * 0.007;
    mesh.userData.ry = (Math.random() - .5) * 0.009;
    mesh.userData.vy = (Math.random() - .5) * 0.02;
    mesh.userData.phase = Math.random() * Math.PI * 2;
    meshes.push(mesh);
    scene.add(mesh);
  }

  /* star particles */
  const pGeo = new THREE.BufferGeometry();
  const pos  = new Float32Array(400 * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - .5) * 120;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.35 });
  scene.add(new THREE.Points(pGeo, pMat));

  /* mouse parallax */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - .5) * 6;
    targetY = (e.clientY / window.innerHeight - .5) * -4;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;
    camera.position.x = curX;
    camera.position.y = curY;

    meshes.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y += Math.sin(t + m.userData.phase) * 0.008;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

/* ─── TYPEWRITER ─── */
(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words   = ['Real Revenue', 'Smarter Teams', 'Faster Workflows', 'Your Competitive Edge'];
  let wi = 0, ci = 0, deleting = false;
  const S = { type: 80, del: 40, pause: 2200 };
  function tick() {
    const w = words[wi];
    if (!deleting) {
      el.textContent = w.slice(0, ++ci);
      if (ci === w.length) { deleting = true; return setTimeout(tick, S.pause); }
    } else {
      el.textContent = w.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, deleting ? S.del : S.type);
  }
  tick();
})();

/* ─── AOS ─── */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  els.forEach(el => {
    const d = parseFloat(el.dataset.aosDelay || 0);
    el.style.transitionDelay = d + 'ms';
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

/* ─── COUNTER ─── */
function animCount(el, target) {
  const dur = 1600, start = performance.now();
  const run = now => {
    const t    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.floor(target * ease);
    if (t < 1) requestAnimationFrame(run); else el.textContent = target;
  };
  requestAnimationFrame(run);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animCount(e.target, parseInt(e.target.dataset.count, 10));
    counterObs.unobserve(e.target);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* ─── METRIC BARS ─── */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.style.width = Math.min(parseInt(e.target.dataset.pct || 0, 10), 100) + '%';
    barObs.unobserve(e.target);
  });
}, { threshold: .3 });
document.querySelectorAll('.metric-bar').forEach(b => barObs.observe(b));

/* ─── CARD TILT ─── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    card.style.transform = `perspective(700px) rotateX(${(y - .5) * 10}deg) rotateY(${(x - .5) * -10}deg) translateZ(8px)`;
    card.style.setProperty('--mx', (x * 100) + '%');
    card.style.setProperty('--my', (y * 100) + '%');
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ─── TESTIMONIAL SLIDER ─── */
(function testiSlider() {
  const track = document.getElementById('testiTrack');
  const dots  = document.getElementById('testiDots');
  if (!track || !dots) return;
  const cards = track.querySelectorAll('.testi-card');
  let cur = 0, perView = 3, timer;
  function pv() { return window.innerWidth <= 968 ? 1 : 3; }
  function render() {
    perView = pv();
    const w = (track.parentElement.offsetWidth + 20) / perView;
    track.style.transform = `translateX(-${cur * w}px)`;
    dots.innerHTML = '';
    for (let i = 0; i < cards.length - perView + 1; i++) {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === cur ? ' active' : '');
      d.addEventListener('click', () => { cur = i; render(); reset(); });
      dots.appendChild(d);
    }
  }
  function next() { cur = Math.min(cur + 1, cards.length - perView); render(); }
  function prev() { cur = Math.max(cur - 1, 0); render(); }
  function reset() { clearInterval(timer); timer = setInterval(next, 4000); }
  const nb = document.getElementById('testiBtnNext');
  const pb = document.getElementById('testiBtnPrev');
  if (nb) nb.addEventListener('click', () => { next(); reset(); });
  if (pb) pb.addEventListener('click', () => { prev(); reset(); });
  render(); reset();
  window.addEventListener('resize', render);
})();

/* ─── FAQ ─── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.parentElement;
    const isOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isOpen) item.classList.add('active');
  });
});

/* ─── ROI CALCULATOR ─── */
(function initROI() {
  const roiEmp  = document.getElementById('roiEmp');
  const roiHrs  = document.getElementById('roiHrs');
  const roiHrsV = document.getElementById('roiHrsVal');
  const roiRate = document.getElementById('roiRate');
  if (!roiEmp) return;
  function fmtINR(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function calcROI() {
    const emp = parseFloat(roiEmp.value) || 0;
    const hrs = parseFloat(roiHrs.value) || 0;
    const rate = parseFloat(roiRate.value) || 0;
    if (roiHrsV) roiHrsV.textContent = hrs;
    const mon = emp * hrs * 0.7 * 4.33;
    const mSav = mon * rate;
    const hs = document.getElementById('roiHrsSaved');
    const rm = document.getElementById('roiMon');
    const ra = document.getElementById('roiAnn');
    if (hs) hs.textContent = Math.round(mon).toLocaleString('en-IN') + ' hrs';
    if (rm) rm.textContent = fmtINR(mSav);
    if (ra) ra.textContent = fmtINR(mSav * 12);
  }
  [roiEmp, roiHrs, roiRate].forEach(el => el && el.addEventListener('input', calcROI));
  calcROI();
})();

/* ─── CONTACT FORM VALIDATION ─── */
function validateForm() {
  let ok = true;
  [
    { id: 'fname',      errId: 'err-name',     check: v => v.length > 0 },
    { id: 'femail',     errId: 'err-email',    check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'fchallenge', errId: 'err-challenge', check: v => v.length > 0 },
  ].forEach(({ id, errId, check }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el) return;
    const val = el.value.trim();
    if (!check(val)) {
      el.classList.add('error');
      if (err) err.textContent = id === 'femail' ? 'Valid email required' : 'This field is required';
      ok = false;
    } else {
      el.classList.remove('error');
      if (err) err.textContent = '';
    }
  });
  return ok;
}

window.submitContact = async function(e) {
  e.preventDefault();
  if (!validateForm()) return;
};

const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', window.submitContact);

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    }
  });
});

/* ─── CHATBOT (conversational) ─── */
(function initChatbot() {
  const floatBtn  = document.getElementById('floatChat');
  const popup     = document.getElementById('chatPopup');
  const closeBtn  = document.getElementById('chatClose');
  const body      = document.getElementById('chatBody');
  const inputWrap = document.getElementById('chatInputWrap');
  const input     = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSendBtn');
  if (!floatBtn || !popup) return;

  floatBtn.addEventListener('click', () => {
    popup.classList.toggle('open');
    if (popup.classList.contains('open') && !body.hasChildNodes()) startChat();
  });
  closeBtn.addEventListener('click', () => popup.classList.remove('open'));

  /* conversation state */
  const state = { step: 0, biz: '', challenge: '', name: '', email: '', phone: '' };

  const flow = [
    { key: 'biz',       q: "Hi! 👋 I'm the Cortex AI assistant. What does your business do?",  input: true },
    { key: 'challenge', q: "Great! What's your biggest challenge right now?",                   opts: ['AI Automation', 'Lead Generation', 'Data & Analytics', 'DevOps / Cloud', 'AI Training for Staff', 'Something else'] },
    { key: 'name',      q: "Got it! What's your name?",                                         input: true },
    { key: 'email',     q: "Nice to meet you, [name]! What's your work email?",                 input: true },
    { key: 'phone',     q: "Almost done! What's your WhatsApp or phone number?",                input: true },
  ];

  function addMsg(text, type) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + type;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function botTyping(text, delay, cb) {
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.textContent = '…';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    setTimeout(() => {
      el.textContent = text;
      body.scrollTop = body.scrollHeight;
      if (cb) cb();
    }, delay);
  }

  function showStep(idx) {
    if (idx >= flow.length) { finish(); return; }
    const step = flow[idx];
    let q = step.q.replace('[name]', state.name);

    if (step.opts) {
      botTyping(q, 400, () => {
        const opts = document.createElement('div');
        opts.className = 'chat-opts';
        step.opts.forEach(o => {
          const btn = document.createElement('button');
          btn.className = 'chat-opt';
          btn.textContent = o;
          btn.addEventListener('click', () => {
            state[step.key] = o;
            addMsg(o, 'user');
            opts.remove();
            state.step++;
            setTimeout(() => showStep(state.step), 300);
          });
          opts.appendChild(btn);
        });
        body.appendChild(opts);
        body.scrollTop = body.scrollHeight;
      });
    } else {
      botTyping(q, 400, () => {
        if (inputWrap) inputWrap.style.display = 'flex';
        if (input) { input.focus(); input.placeholder = step.key === 'email' ? 'your@email.com' : step.key === 'phone' ? '+91 ...' : 'Type here…'; }
      });
    }
  }

  function handleInput() {
    const val = input.value.trim();
    if (!val) return;
    const step = flow[state.step];
    if (step && step.input) {
      /* basic email validation */
      if (step.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        addMsg('Please enter a valid email address.', 'bot'); return;
      }
      state[step.key] = val;
      addMsg(val, 'user');
      input.value = '';
      if (inputWrap) inputWrap.style.display = 'none';
      state.step++;
      setTimeout(() => showStep(state.step), 300);
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', handleInput);
  if (input)   input.addEventListener('keydown', e => { if (e.key === 'Enter') handleInput(); });

  function finish() {
    if (inputWrap) inputWrap.style.display = 'none';
    botTyping(`Thanks ${state.name}! 🎉 We'll reach out to ${state.email} within 24 hours with a personalised AI plan for your business.`, 500);
    /* save via firebase.js hook */
    if (typeof window.saveChatbotLead === 'function') {
      window.saveChatbotLead({ ...state, page: location.href });
    }
  }

  function startChat() {
    state.step = 0;
    showStep(0);
  }
})();

/* ─── PWA INSTALL ─── */
(function initPWA() {
  let deferredPrompt;
  const btn = document.getElementById('pwaInstall');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (btn) btn.style.display = 'block';
  });
  if (btn) btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') btn.style.display = 'none';
    deferredPrompt = null;
  });
  /* register service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
