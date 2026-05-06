const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrbbNpttyNc-Dz8CiGeQiZsCCmNZSboZAUTtZ6COM5BecELgoCj-iNBYIG-h3bw6Gr8A/exec';

const form        = document.getElementById('event-form');
const submitBtn   = document.getElementById('submit-btn');
const globalError = document.getElementById('form-global-error');

// ── 전화번호 자동 포맷 ──
document.getElementById('participantPhone').addEventListener('input', function () {
  const digits = this.value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3)      this.value = digits;
  else if (digits.length <= 7) this.value = `${digits.slice(0,3)}-${digits.slice(3)}`;
  else                         this.value = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
});

// ── 고객 정보 확인 방법 토글 ──
document.getElementById('helper-toggle').addEventListener('click', function () {
  const helper   = document.getElementById('info-helper');
  const expanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', String(!expanded));
  helper.hidden  = expanded;
});

// ── 닫기 버튼 ──
document.querySelector('.close-btn').addEventListener('click', () => {
  if (window.history.length > 1) window.history.back();
  else window.close();
});

// ── 유효성 검사 ──
function validate() {
  clearErrors();
  let ok = true;

  const name    = document.getElementById('participantName');
  const phone   = document.getElementById('participantPhone');
  const info    = document.getElementById('parentCustomerInfo');
  const privacy = document.getElementById('privacyAgree');

  if (!name.value.trim()) {
    setError('participantName', '이름을 입력해주세요.');
    ok = false;
  }

  const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
  if (!phone.value.trim()) {
    setError('participantPhone', '휴대폰 번호를 입력해주세요.');
    ok = false;
  } else if (!phoneRegex.test(phone.value.trim())) {
    setError('participantPhone', '올바른 형식으로 입력해주세요. (예: 010-1234-5678)');
    ok = false;
  }

  if (!info.value.trim()) {
    setError('parentCustomerInfo', '부모님 고객 정보를 붙여넣기 해주세요.');
    ok = false;
  }

  if (!privacy.checked) {
    setError('privacyAgree', '개인정보 수집 및 이용에 동의해주세요.');
    ok = false;
  }

  return ok;
}

function setError(fieldId, message) {
  const errEl   = document.getElementById(`err-${fieldId}`);
  const inputEl = document.getElementById(fieldId);
  if (errEl)   errEl.textContent = message;
  if (inputEl) inputEl.classList.add('is-invalid');
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  globalError.hidden = true;
}

// ── 폼 제출 ──
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  submitBtn.disabled = true;

  const body = new URLSearchParams({
    participantName:    document.getElementById('participantName').value.trim(),
    participantPhone:   document.getElementById('participantPhone').value.trim(),
    parentCustomerInfo: document.getElementById('parentCustomerInfo').value.trim(),
    privacyAgree:       '동의',
    submittedAt:        new Date().toLocaleString('ko-KR'),
  });

  try {
    await fetch(APP_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
    // 신청 완료 버튼으로 전환
    submitBtn.textContent = '신청 완료';
    submitBtn.classList.add('completed');
  } catch {
    submitBtn.disabled = false;
    globalError.textContent = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    globalError.hidden = false;
  }
});
