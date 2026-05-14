/* ===================================================
   PARO — Shared Interactions
   =================================================== */

(function () {
  'use strict';

  // ─── DOM Ready ───────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavActiveStates();
    setupMobileMenu();
    setupRadioCards();
    setupOptionCards();
    setupWizard();
    setupCheckboxProgress();
    setupFileUploads();
    setupChat();
    setupUpvotes();
    setupToasts();
    setupLangToggle();
    setupSmoothReveal();
    setupCounterAnimations();
    setupTabSwitching();
  }

  // ─── Navigation ──────────────────────────────────────
  function setupNavActiveStates() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-page]').forEach(link => {
      if (link.dataset.navPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('sidebar-open');
      if (overlay) overlay.classList.toggle('hidden', !isOpen);
    });
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.add('hidden');
      });
    }
  }

  // ─── Radio Cards ─────────────────────────────────────
  function setupRadioCards() {
    document.querySelectorAll('.radio-card-group').forEach(group => {
      group.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', () => {
          group.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          const input = card.querySelector('input[type="radio"]');
          if (input) input.checked = true;
          card.closest('.wizard-panel')?.dispatchEvent(new Event('selection-changed'));
        });
      });
    });
  }

  // ─── Option Cards (Wizard grid) ──────────────────────
  function setupOptionCards() {
    document.querySelectorAll('.option-card[data-multi]').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('selected'));
    });
    document.querySelectorAll('.option-card:not([data-multi])').forEach(card => {
      card.addEventListener('click', () => {
        const group = card.closest('.option-grid');
        if (!group) return;
        group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  // ─── Wizard ──────────────────────────────────────────
  function setupWizard() {
    const wizard = document.getElementById('wizard');
    if (!wizard) return;

    const panels = wizard.querySelectorAll('.wizard-panel');
    const steps = wizard.querySelectorAll('.wizard-step');
    const nextBtns = wizard.querySelectorAll('[data-wizard-next]');
    const prevBtns = wizard.querySelectorAll('[data-wizard-prev]');
    const submitBtn = wizard.querySelector('[data-wizard-submit]');
    let current = 0;

    function goTo(index) {
      if (index < 0 || index >= panels.length) return;
      panels[current].classList.remove('active');
      steps[current]?.classList.remove('active');
      steps[current]?.classList.add('completed');

      current = index;
      panels[current].classList.add('active');

      // Update step states
      steps.forEach((step, i) => {
        step.classList.remove('active', 'completed');
        if (i < current) step.classList.add('completed');
        if (i === current) step.classList.add('active');
      });

      // Update overall progress bar
      const bar = wizard.querySelector('#wizard-progress-fill');
      if (bar) bar.style.width = `${((current + 1) / panels.length) * 100}%`;

      // Scroll to wizard top
      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (current < panels.length - 1) goTo(current + 1);
      });
    });
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (current > 0) goTo(current - 1);
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        submitBtn.innerHTML = `<span class="spin" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;"></span> Sinisiyasat...`;
        submitBtn.disabled = true;
        setTimeout(() => {
          window.location.href = 'programs.html';
        }, 1800);
      });
    }

    // Init
    panels.forEach((p, i) => { if (i === 0) p.classList.add('active'); else p.classList.remove('active'); });
    steps[0]?.classList.add('active');
  }

  // ─── Checklist Progress ───────────────────────────────
  function setupCheckboxProgress() {
    const checklists = document.querySelectorAll('[data-checklist]');
    checklists.forEach(list => {
      const items = list.querySelectorAll('.checkbox-input');
      const progressFill = document.querySelector('#checklist-progress-fill');
      const progressLabel = document.querySelector('#checklist-progress-label');
      const progressRing = document.querySelector('#checklist-ring-fill');
      const total = items.length;

      function updateProgress() {
        const checked = list.querySelectorAll('.checkbox-input:checked').length;
        const pct = total > 0 ? (checked / total) * 100 : 0;
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressLabel) progressLabel.textContent = `${checked} of ${total} prepared`;
        if (progressRing) {
          const r = parseFloat(progressRing.getAttribute('r') || 34);
          const circumference = 2 * Math.PI * r;
          progressRing.style.strokeDasharray = `${circumference}`;
          progressRing.style.strokeDashoffset = `${circumference * (1 - pct / 100)}`;
        }
        items.forEach(cb => {
          const item = cb.closest('.checklist-item');
          if (item) item.classList.toggle('completed', cb.checked);
        });
      }

      items.forEach(cb => cb.addEventListener('change', updateProgress));
      updateProgress();
    });
  }

  // ─── File Uploads ─────────────────────────────────────
  function setupFileUploads() {
    document.querySelectorAll('.upload-zone').forEach(zone => {
      const input = zone.querySelector('input[type="file"]');
      const statusEl = zone.querySelector('.upload-status');
      const filenameEl = zone.querySelector('.upload-filename');

      zone.addEventListener('click', () => input?.click());

      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer?.files[0];
        if (file) handleFile(zone, file, statusEl, filenameEl);
      });

      input?.addEventListener('change', () => {
        const file = input.files?.[0];
        if (file) handleFile(zone, file, statusEl, filenameEl);
      });
    });
  }

  function handleFile(zone, file, statusEl, filenameEl) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      zone.classList.add('error');
      if (statusEl) { statusEl.textContent = 'Hindi tanggap ang format na ito. Gumamit ng JPG, PNG, o PDF.'; statusEl.style.color = 'var(--color-error)'; }
      return;
    }
    zone.classList.remove('error');
    zone.classList.add('uploaded');
    if (filenameEl) filenameEl.textContent = file.name;
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--color-primary);font-weight:600;">✓ Na-upload</span> — ${(file.size / 1024).toFixed(0)} KB`;
    }
    showToast('Na-upload na ang iyong dokumento', 'success');
    updateUploadProgress();
  }

  function updateUploadProgress() {
    const total = document.querySelectorAll('.upload-zone').length;
    const done = document.querySelectorAll('.upload-zone.uploaded').length;
    const bar = document.querySelector('#upload-progress-fill');
    const label = document.querySelector('#upload-progress-label');
    if (bar) bar.style.width = `${(done / total) * 100}%`;
    if (label) label.textContent = `${done} ng ${total} na dokumento`;
  }

  // ─── Chat ─────────────────────────────────────────────
  function setupChat() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    if (!chatForm || !chatInput || !chatMessages) return;

    const botResponses = {
      default: [
        'Naiintindihan ko ang iyong tanong. Batay sa iyong profile, mayroon kang mga programa na maaaring angkop para sa iyo.',
        'Mahalaga ang impormasyong ito. Hayaan mong tulungan kita na hanapin ang pinaka-angkop na programa.',
        'Para sa iyong sitwasyon, inirerekumenda ko ang PhilHealth Outpatient Benefit Package. Mayroon ka ng mataas na posibilidad na maging karapat-dapat.',
      ],
      philhealth: [
        'Ang PhilHealth ay nag-aalok ng maraming benepisyo para sa mga miyembro. Para mag-claim, kailangan mo ng: PhilHealth ID, hospital bill, at discharge summary.\n\n💡 Pro tip: Magdala ng 2 kopya ng lahat ng dokumento.',
        'Ang iyong PhilHealth membership ay nagbibigay sa iyo ng access sa Inpatient, Outpatient, at Maternity benefits. Alin ang gusto mong malaman pa?',
      ],
      documents: [
        'Para sa karamihan ng programa, kailangan mo ng:\n\n• Valid ID (2 kopya)\n• Barangay Certificate of Indigency\n• PhilHealth Member Data Record\n• Medical Certificate mula sa doktor\n\n💡 Palaging magdala ng certified true copies para sa lahat.',
        'Narito ang listahan ng mga karaniwang kinakailangang dokumento. Maaari mo ring i-check ang iyong personalized checklist sa Checklist page.',
      ],
      doh: [
        'Ang DOH Assistance Program ay nagbibigay ng libreng gamot at medikal na tulong sa mga indigent na pasyente. Pumunta sa pinakamalapit na DOH-accredited na ospital kasama ang iyong Barangay Certificate of Indigency.',
      ],
    };

    function addMessage(text, isUser = false) {
      const time = new Date().toLocaleTimeString('fil-PH', { hour: '2-digit', minute: '2-digit' });
      const div = document.createElement('div');
      div.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
      div.innerHTML = `
        ${isUser ? '' : `<div class="chat-avatar bot"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg></div>`}
        <div style="display:flex;flex-direction:column;align-items:${isUser ? 'flex-end' : 'flex-start'}">
          <div class="chat-bubble" style="white-space:pre-wrap">${text}</div>
          <div class="chat-timestamp">${time}</div>
        </div>
        ${isUser ? `<div class="chat-avatar user-av">JC</div>` : ''}
      `;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.id = 'typing-indicator';
      div.innerHTML = `
        <div class="chat-avatar bot"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg></div>
        <div class="chat-bubble" style="padding:0.5rem 1rem">
          <div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
        </div>
      `;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
      document.getElementById('typing-indicator')?.remove();
    }

    function getBotReply(text) {
      const lower = text.toLowerCase();
      if (lower.includes('philhealth') || lower.includes('phil health')) return pick(botResponses.philhealth);
      if (lower.includes('dokumento') || lower.includes('document') || lower.includes('requirements') || lower.includes('kailangan')) return pick(botResponses.documents);
      if (lower.includes('doh') || lower.includes('department of health')) return pick(botResponses.doh);
      return pick(botResponses.default);
    }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function sendMessage(text) {
      if (!text.trim()) return;
      addMessage(text, true);
      chatInput.value = '';
      chatInput.style.height = 'auto';
      showTyping();
      setTimeout(() => {
        removeTyping();
        addMessage(getBotReply(text));
      }, 1000 + Math.random() * 800);
    }

    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      sendMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput.value); }
    });

    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // Suggestion chips
    document.querySelectorAll('.chat-suggestion').forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.textContent.trim()));
    });
  }

  // ─── Upvotes ──────────────────────────────────────────
  function setupUpvotes() {
    document.querySelectorAll('[data-upvote]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isVoted = btn.classList.toggle('voted');
        const countEl = btn.querySelector('[data-count]');
        if (countEl) {
          const n = parseInt(countEl.textContent) || 0;
          countEl.textContent = isVoted ? n + 1 : n - 1;
        }
        if (isVoted) btn.style.color = 'var(--color-primary)';
        else btn.style.color = '';
      });
    });
  }

  // ─── Toast ─────────────────────────────────────────────
  let toastContainer = null;
  function showToast(message, type = 'default', duration = 3000) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      default: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.default}<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  window.showToast = showToast;

  // ─── Language Toggle ──────────────────────────────────
  function setupLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.lang-toggle')?.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lang = btn.dataset.lang;
        // Swap [data-fil] / [data-en] text
        document.querySelectorAll('[data-fil]').forEach(el => {
          el.textContent = lang === 'en' ? (el.dataset.en || el.textContent) : (el.dataset.fil || el.textContent);
        });
      });
    });
  }

  // ─── Smooth Reveal ────────────────────────────────────
  function setupSmoothReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      obs.observe(el);
    });
  }

  // ─── Counter Animations ────────────────────────────────
  function setupCounterAnimations() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value).toLocaleString() : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── Tab Switching ────────────────────────────────────
  function setupTabSwitching() {
    document.querySelectorAll('[data-tabs]').forEach(tabGroup => {
      const tabs = tabGroup.querySelectorAll('[data-tab]');
      const panels = document.querySelectorAll('[data-tab-panel]');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const target = tab.dataset.tab;
          panels.forEach(p => {
            p.classList.toggle('hidden', p.dataset.tabPanel !== target);
          });
        });
      });
    });
  }

  // ─── Accordion ────────────────────────────────────────
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-accordion-trigger]');
    if (!trigger) return;
    const content = document.getElementById(trigger.dataset.accordionTrigger);
    if (!content) return;
    const isOpen = !content.classList.contains('hidden');
    content.classList.toggle('hidden', isOpen);
    trigger.querySelector('[data-accordion-icon]')?.style && (trigger.querySelector('[data-accordion-icon]').style.transform = isOpen ? '' : 'rotate(180deg)');
  });

  // ─── Confirm Actions ────────────────────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-confirm]');
    if (!btn) return;
    if (!confirm(btn.dataset.confirm)) e.preventDefault();
  });

  // ─── Bookmark ─────────────────────────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-bookmark]');
    if (!btn) return;
    const saved = btn.classList.toggle('bookmarked');
    btn.title = saved ? 'I-unsave' : 'I-save';
    btn.style.color = saved ? 'var(--color-accent)' : '';
    showToast(saved ? 'Na-save ang programa' : 'Tinanggal sa saved', saved ? 'success' : 'default');
  });

  // ─── Mobile sidebar styles inject ────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @media (max-width: 768px) {
      #sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex !important; }
      #sidebar.sidebar-open { transform: translateX(0); box-shadow: 8px 0 24px rgba(0,0,0,0.15); }
      #sidebar-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:49; }
    }
  `;
  document.head.appendChild(styleEl);

})();
