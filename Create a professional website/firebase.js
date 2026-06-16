/**
 * CORTEX AI — Firebase Backend
 * ─────────────────────────────────────────────────────────────────
 * SETUP (one-time):
 *  1. https://console.firebase.google.com → Add project → "cortex-ai"
 *  2. Add web app → copy firebaseConfig below
 *  3. Firestore → Create database → Production mode
 *  4. Paste these Security Rules:
 *
 *  rules_version = '2';
 *  service cloud.firestore {
 *    match /databases/{database}/documents {
 *      match /leads/{id}          { allow create: if request.resource.data.email is string; allow read, update, delete: if false; }
 *      match /subscribers/{id}    { allow create: if request.resource.data.email is string; allow read, update, delete: if false; }
 *      match /popup_leads/{id}    { allow create: if request.resource.data.email is string; allow read, update, delete: if false; }
 *      match /chatbot_leads/{id}  { allow create: if true; allow read, update, delete: if false; }
 *    }
 *  }
 *
 *  DEPLOY:
 *  npm i -g firebase-tools && firebase login
 *  firebase init → Hosting → public dir = "." → single page = No
 *  firebase deploy
 * ─────────────────────────────────────────────────────────────────
 */

import { initializeApp }    from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp }
                            from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import { getAnalytics }     from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey:            "AIzaSyBOT2OP173d6WMQmgMtzBrjEsyH2Zqn9hA",
  authDomain:        "ai-consulting-firm.firebaseapp.com",
  projectId:         "ai-consulting-firm",
  storageBucket:     "ai-consulting-firm.firebasestorage.app",
  messagingSenderId: "615237897346",
  appId:             "1:615237897346:web:54467479c65efc973f389b",
  measurementId:     "G-C2LG9CJ590",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
try { getAnalytics(app); } catch (_) {}

/* ── RATE LIMIT helper (per-session) ── */
const submitCounts = {};
function rateLimit(key, max = 3) {
  submitCounts[key] = (submitCounts[key] || 0) + 1;
  return submitCounts[key] <= max;
}

/* ── SANITIZE helper ── */
function clean(str) {
  return String(str).replace(/[<>"'`]/g, '').trim().slice(0, 500);
}

/* ════════════════════════════════════════════
   POPUP LEAD CAPTURE
════════════════════════════════════════════ */
window.savePopupLead = async function({ name, email, phone, industry, page }) {
  if (!rateLimit('popup', 2)) return;
  try {
    await addDoc(collection(db, 'popup_leads'), {
      name:      clean(name),
      email:     clean(email),
      phone:     clean(phone),
      industry:  clean(industry),
      page:      clean(page),
      source:    'entry-popup',
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent.slice(0, 200),
    });
    /* also subscribe */
    await addDoc(collection(db, 'subscribers'), {
      email:     clean(email),
      name:      clean(name),
      source:    'entry-popup',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Popup lead save failed:', err.code);
  }
};

/* ════════════════════════════════════════════
   CHATBOT LEAD
════════════════════════════════════════════ */
window.saveChatbotLead = async function({ biz, challenge, name, email, phone, page }) {
  if (!rateLimit('chatbot', 3)) return;
  try {
    await addDoc(collection(db, 'chatbot_leads'), {
      business:  clean(biz),
      challenge: clean(challenge),
      name:      clean(name),
      email:     clean(email),
      phone:     clean(phone),
      page:      clean(page),
      source:    'chatbot',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Chatbot lead save failed:', err.code);
  }
};

/* ════════════════════════════════════════════
   CONTACT FORM
════════════════════════════════════════════ */
const contactForm     = document.getElementById('contactForm');
const submitBtn       = document.getElementById('submitBtn');
const submitText      = document.getElementById('submitText');
const submitSpinner   = document.getElementById('submitSpinner');
const formSuccess     = document.getElementById('formSuccess');
const formError       = document.getElementById('formError');

if (contactForm) {
  async function handleContact(e) {
    e.preventDefault();
    if (typeof validateForm === 'function' && !validateForm()) return;
    if (!rateLimit('contact', 3)) {
      if (formError) { formError.textContent = 'Too many submissions. Please try again later.'; formError.classList.add('show'); }
      return;
    }

    if (submitBtn)    submitBtn.disabled = true;
    if (submitText)   submitText.style.display = 'none';
    if (submitSpinner) submitSpinner.style.display = 'inline-block';
    if (formError)    formError.classList.remove('show');

    const data = {
      name:       clean(document.getElementById('fname')?.value || ''),
      email:      clean(document.getElementById('femail')?.value || ''),
      phone:      clean(document.getElementById('fphone')?.value || ''),
      company:    clean(document.getElementById('fcompany')?.value || ''),
      industry:   clean(document.getElementById('findustry')?.value || ''),
      challenge:  clean(document.getElementById('fchallenge')?.value || ''),
      newsletter: document.getElementById('fNewsletter')?.checked || false,
      source:     'contact-form',
      createdAt:  serverTimestamp(),
      page:       window.location.href,
    };

    try {
      await addDoc(collection(db, 'leads'), data);
      if (data.newsletter) {
        await addDoc(collection(db, 'subscribers'), {
          email: data.email, name: data.name, source: 'contact-form', createdAt: serverTimestamp(),
        });
      }
      contactForm.reset();
      if (formSuccess) { formSuccess.classList.add('show'); setTimeout(() => formSuccess.classList.remove('show'), 7000); }
    } catch (err) {
      console.error(err);
      if (formError) { formError.textContent = 'Error — please email us at aviraluttam@gmail.com'; formError.classList.add('show'); }
    } finally {
      if (submitBtn)    submitBtn.disabled = false;
      if (submitText)   submitText.style.display = 'inline';
      if (submitSpinner) submitSpinner.style.display = 'none';
    }
  }

  contactForm.removeEventListener('submit', window.submitContact);
  contactForm.addEventListener('submit', handleContact);
}

/* ════════════════════════════════════════════
   FOOTER NEWSLETTER
════════════════════════════════════════════ */
function initNewsletter() {
  const emailEl = document.getElementById('footerEmail');
  const subBtn  = document.getElementById('footerSubBtn');
  const msg     = document.getElementById('footerMsg');
  if (!emailEl || !subBtn) return;

  subBtn.addEventListener('click', async () => {
    const email = emailEl.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msg) { msg.textContent = 'Enter a valid email.'; msg.style.color = 'rgba(255,100,100,.8)'; }
      return;
    }
    if (!rateLimit('newsletter', 2)) return;
    subBtn.disabled = true;
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: clean(email), source: 'footer-newsletter', createdAt: serverTimestamp(),
      });
      emailEl.value = '';
      if (msg) { msg.textContent = '✓ Subscribed!'; msg.style.color = 'var(--t2)'; }
    } catch (_) {
      if (msg) { msg.textContent = 'Error — try again.'; msg.style.color = 'rgba(255,100,100,.8)'; }
    } finally {
      subBtn.disabled = false;
    }
  });
}

/* footer is injected dynamically by _nav.js, so wait a tick */
setTimeout(initNewsletter, 200);
