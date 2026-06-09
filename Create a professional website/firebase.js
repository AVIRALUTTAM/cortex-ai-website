/**
 * CORTEX AI — Firebase Backend
 * ─────────────────────────────────────────────────────────────
 * SETUP STEPS (do these once):
 *
 *  1. Go to https://console.firebase.google.com
 *  2. Click "Add project" → name it "cortex-ai"
 *  3. Enable Google Analytics (optional)
 *  4. In the project dashboard → "Add app" → Web (</>)
 *  5. Register app name "cortex-ai-web" → copy the firebaseConfig object
 *  6. Replace the placeholder values below with your real config
 *
 *  Firestore:
 *  7. Firestore Database → Create database → Start in production mode
 *  8. Add these Firestore Rules:
 *       rules_version = '2';
 *       service cloud.firestore {
 *         match /databases/{database}/documents {
 *           match /leads/{id}       { allow create: if true; allow read, update, delete: if false; }
 *           match /subscribers/{id} { allow create: if true; allow read, update, delete: if false; }
 *         }
 *       }
 *
 *  Firebase Hosting (deploy):
 *  9.  npm install -g firebase-tools
 *  10. firebase login
 *  11. firebase init  → choose Hosting → public dir = "." → single page = No
 *  12. firebase deploy
 *      Your site will be live at: https://cortex-ai.web.app
 * ─────────────────────────────────────────────────────────────
 */

import { initializeApp }         from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp }
                                  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics }           from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

// ── REPLACE WITH YOUR FIREBASE CONFIG ──
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
  measurementId:     "YOUR_MEASUREMENT_ID",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Analytics only works on real domains (not localhost)
try { getAnalytics(app); } catch (_) {}

// ── CONTACT FORM ──
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const submitText  = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const successEl   = document.getElementById('formSuccess');
const errorEl     = document.getElementById('formError');

async function handleContactSubmit(e) {
  e.preventDefault();

  // Let script.js validate first
  if (typeof validateForm === 'function' && !validateForm()) return;

  // UI: loading state
  submitBtn.disabled     = true;
  submitText.style.display  = 'none';
  submitSpinner.style.display = 'inline-block';
  errorEl.classList.remove('show');

  const data = {
    name:       document.getElementById('fname').value.trim(),
    email:      document.getElementById('femail').value.trim(),
    company:    document.getElementById('fcompany').value.trim(),
    industry:   document.getElementById('findustry').value,
    challenge:  document.getElementById('fchallenge').value.trim(),
    newsletter: document.getElementById('fNewsletter').checked,
    source:     'website-contact-form',
    createdAt:  serverTimestamp(),
    userAgent:  navigator.userAgent,
    page:       window.location.href,
  };

  try {
    // Save lead to Firestore
    await addDoc(collection(db, 'leads'), data);

    // If opted in, also save to subscribers
    if (data.newsletter) {
      await addDoc(collection(db, 'subscribers'), {
        email:     data.email,
        name:      data.name,
        source:    'contact-form',
        createdAt: serverTimestamp(),
      });
    }

    form.reset();
    successEl.classList.add('show');
    setTimeout(() => successEl.classList.remove('show'), 7000);
  } catch (err) {
    console.error('Firebase error:', err);
    errorEl.textContent = 'Something went wrong. Please email us directly at hello@cortexai.in';
    errorEl.classList.add('show');
  } finally {
    submitBtn.disabled      = false;
    submitText.style.display   = 'inline';
    submitSpinner.style.display = 'none';
  }
}

// Override the stub in script.js
form.removeEventListener('submit', window.submitContact);
form.addEventListener('submit', handleContactSubmit);

// ── FOOTER NEWSLETTER ──
const footerEmailEl = document.getElementById('footerEmail');
const footerSubBtn  = document.getElementById('footerSubBtn');
const footerMsg     = document.getElementById('footerMsg');

footerSubBtn.addEventListener('click', async () => {
  const email = footerEmailEl.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    footerMsg.textContent = 'Please enter a valid email.';
    footerMsg.style.color = 'rgba(255,100,100,.8)';
    return;
  }
  footerSubBtn.disabled = true;
  try {
    await addDoc(collection(db, 'subscribers'), {
      email,
      source:    'footer-newsletter',
      createdAt: serverTimestamp(),
    });
    footerEmailEl.value   = '';
    footerMsg.textContent = '✓ You\'re subscribed!';
    footerMsg.style.color = '#888';
  } catch (_) {
    footerMsg.textContent = 'Error — try again.';
    footerMsg.style.color = 'rgba(255,100,100,.8)';
  } finally {
    footerSubBtn.disabled = false;
  }
});
