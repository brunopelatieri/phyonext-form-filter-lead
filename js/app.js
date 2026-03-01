(function () {
  'use strict';

  const WEBHOOK_URL = 'https://webhook.chatdevendas.online/webhook/96bac5f4-95ad-42dc-9fe9-51f698d7cc20';
  const TOTAL_STEPS = 10;
  const SUBMITTABLE_STEPS = 9;

  let currentStep = 1;
  let formData = {};
  let itiInstance = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const progressFill = $('#progressFill');
  const btnPrev = $('#btnPrev');
  const btnNext = $('#btnNext');
  const loadingOverlay = $('#loadingOverlay');
  const successOverlay = $('#successOverlay');
  const leadForm = $('#leadForm');

  // ========================================
  // INIT
  // ========================================

  function init() {
    initPhoneInput();
    bindNavigation();
    bindRadioOptions();
    bindKeyboard();
    bindInputOkButtons();
    updateProgress();
    updateNavArrows();
    focusCurrentInput();
  }

  // ========================================
  // INTL TEL INPUT
  // ========================================

  function initPhoneInput() {
    const phoneInput = $('#whatsapp');
    if (!phoneInput || typeof intlTelInput === 'undefined') return;

    itiInstance = intlTelInput(phoneInput, {
      initialCountry: 'br',
      preferredCountries: ['br', 'us', 'pt', 'ar', 'co', 'mx'],
      separateDialCode: true,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js',
      i18n: {
        searchPlaceholder: 'Buscar país...',
      },
      formatOnDisplay: true,
    });
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function bindNavigation() {
    btnPrev.addEventListener('click', () => {
      collectStepData(currentStep);
      goToStep(currentStep - 1);
    });
    btnNext.addEventListener('click', () => attemptNext());

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm();
    });
  }

  function attemptNext() {
    if (currentStep >= TOTAL_STEPS) return;
    if (validateStep(currentStep)) {
      collectStepData(currentStep);
      goToStep(currentStep + 1);
    }
  }

  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    const currentEl = $(`.step[data-step="${currentStep}"]`);
    const nextEl = $(`.step[data-step="${step}"]`);

    if (!currentEl || !nextEl) return;

    const goingForward = step > currentStep;

    currentEl.classList.remove('active');
    if (goingForward) {
      currentEl.classList.add('exit-up');
    }

    setTimeout(() => {
      currentEl.classList.remove('exit-up');
    }, 400);

    nextEl.style.transform = goingForward ? 'translateY(40px)' : 'translateY(-40px)';
    void nextEl.offsetHeight;
    nextEl.classList.add('active');

    currentStep = step;
    updateProgress();
    updateNavArrows();

    setTimeout(() => focusCurrentInput(), 350);
  }

  function updateProgress() {
    const pct = (currentStep / SUBMITTABLE_STEPS) * 100;
    progressFill.style.width = Math.min(pct, 100) + '%';
  }

  function updateNavArrows() {
    btnPrev.disabled = currentStep <= 1;
    btnNext.disabled = currentStep >= TOTAL_STEPS;
  }

  // ========================================
  // RADIO OPTIONS
  // ========================================

  function bindRadioOptions() {
    $$('.radio-option').forEach((opt) => {
      opt.addEventListener('click', function () {
        const group = this.closest('.radio-group');
        group.querySelectorAll('.radio-option').forEach((o) => o.classList.remove('selected'));
        this.classList.add('selected');

        const name = group.dataset.name;
        formData[name] = this.dataset.value;

        setTimeout(() => {
          collectStepData(currentStep);
          goToStep(currentStep + 1);
        }, 300);
      });
    });
  }

  // ========================================
  // KEYBOARD
  // ========================================

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        if (currentStep === TOTAL_STEPS) {
          submitForm();
          return;
        }

        const radioStep = $(`.step[data-step="${currentStep}"] .radio-group`);
        if (radioStep) return;

        attemptNext();
      }
    });

    $$('.radio-group').forEach((group) => {
      document.addEventListener('keydown', (e) => {
        const step = $(`.step[data-step="${currentStep}"]`);
        if (!step) return;
        const radioGroup = step.querySelector('.radio-group');
        if (!radioGroup) return;

        const key = e.key.toUpperCase();
        const options = radioGroup.querySelectorAll('.radio-option');
        const letterMap = 'ABCDEFGH';
        const idx = letterMap.indexOf(key);

        if (idx >= 0 && idx < options.length) {
          options[idx].click();
        }
      });
    });
  }

  // ========================================
  // OK BUTTONS
  // ========================================

  function bindInputOkButtons() {
    $$('.btn-next').forEach((btn) => {
      btn.addEventListener('click', () => {
        attemptNext();
      });
    });
  }

  // ========================================
  // VALIDATION
  // ========================================

  function validateStep(step) {
    switch (step) {
      case 1:
        return validateRequired('nome');
      case 2:
        return validateEmail();
      case 3:
        return validatePhone();
      case 4:
        return validateRadio('cargo');
      case 5:
        return validateRequired('clinica');
      case 6:
        return true; // optional
      case 7:
        return validateRadio('faturamento');
      case 8:
        return validateRadio('time_atendimento');
      case 9:
        return validateRadio('media_leads');
      default:
        return true;
    }
  }

  function validateRequired(fieldId) {
    const input = $(`#${fieldId}`);
    if (!input) return false;
    const val = input.value.trim();
    if (!val) {
      input.classList.add('invalid');
      input.focus();
      shakeElement(input);
      input.addEventListener('input', function handler() {
        input.classList.remove('invalid');
        input.removeEventListener('input', handler);
      });
      return false;
    }
    input.classList.remove('invalid');
    return true;
  }

  function validateEmail() {
    const input = $('#email');
    const error = $('#emailError');
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!val || !emailRegex.test(val)) {
      input.classList.add('invalid');
      error.classList.add('visible');
      input.focus();
      shakeElement(input);
      input.addEventListener('input', function handler() {
        input.classList.remove('invalid');
        error.classList.remove('visible');
        input.removeEventListener('input', handler);
      });
      return false;
    }

    input.classList.remove('invalid');
    error.classList.remove('visible');
    return true;
  }

  function validatePhone() {
    const input = $('#whatsapp');
    const error = $('#phoneError');
    const digits = input.value.replace(/\D/g, '');

    if (digits.length < 10 || digits.length > 11) {
      input.classList.add('invalid');
      error.classList.add('visible');
      input.focus();
      shakeElement(input);
      input.addEventListener('input', function handler() {
        input.classList.remove('invalid');
        error.classList.remove('visible');
        input.removeEventListener('input', handler);
      });
      return false;
    }

    input.classList.remove('invalid');
    error.classList.remove('visible');
    return true;
  }

  function validateRadio(name) {
    if (formData[name]) return true;

    const group = $(`.radio-group[data-name="${name}"]`);
    if (group) shakeElement(group);
    return false;
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shakeIn 0.3s ease';
    setTimeout(() => {
      el.style.animation = '';
    }, 300);
  }

  // ========================================
  // DATA COLLECTION
  // ========================================

  function collectStepData(step) {
    switch (step) {
      case 1:
        formData.nome = $('#nome').value.trim();
        break;
      case 2:
        formData.email = $('#email').value.trim();
        break;
      case 3:
        if (itiInstance) {
          formData.whatsapp = itiInstance.getNumber();
          try {
            formData.whatsapp_national = itiInstance.getNumber(intlTelInput.utils.numberFormat.NATIONAL);
          } catch (_) {
            formData.whatsapp_national = $('#whatsapp').value.trim();
          }
          formData.whatsapp_country = itiInstance.getSelectedCountryData().iso2;
        } else {
          formData.whatsapp = $('#whatsapp').value.trim();
        }
        break;
      case 5:
        formData.clinica = $('#clinica').value.trim();
        break;
      case 6: {
        const siteVal = $('#site').value.trim();
        formData.site = siteVal ? 'https://' + siteVal.replace(/^https?:\/\//, '') : '';
        break;
      }
    }
  }

  // ========================================
  // SUBMIT
  // ========================================

  async function submitForm() {
    if (currentStep !== TOTAL_STEPS) return;

    collectStepData(6);

    const payload = {
      nome: formData.nome || '',
      email: formData.email || '',
      whatsapp: formData.whatsapp || '',
      whatsapp_national: formData.whatsapp_national || '',
      whatsapp_country: formData.whatsapp_country || '',
      cargo: formData.cargo || '',
      clinica: formData.clinica || '',
      site: formData.site || '',
      faturamento: formData.faturamento || '',
      time_atendimento: formData.time_atendimento || '',
      media_leads: formData.media_leads || '',
      submitted_at: new Date().toISOString(),
      source: window.location.href,
    };

    const submitBtn = $('#btnSubmit');
    submitBtn.disabled = true;
    loadingOverlay.classList.add('active');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      loadingOverlay.classList.remove('active');

      if (response.ok || response.status === 0) {
        successOverlay.classList.add('active');
      } else {
        successOverlay.classList.add('active');
      }
    } catch (err) {
      loadingOverlay.classList.remove('active');
      successOverlay.classList.add('active');
    }
  }

  // ========================================
  // FOCUS MANAGEMENT
  // ========================================

  function focusCurrentInput() {
    const step = $(`.step[data-step="${currentStep}"]`);
    if (!step) return;
    const input = step.querySelector('input:not([type="hidden"])');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }

  // ========================================
  // BOOT
  // ========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
