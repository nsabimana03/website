/* BRIGHT MIND — script.js
   Implements:
   - Sample scholarship dataset (demonstration data only)
   - Search, filters, sorting, pagination
   - Student profile form validation + rule-based matching
   - Upload validation (client-side only)
   - Frontend admin demo for add/edit/delete (localStorage)
   - Accessibility and safe external link behavior
*/

/* ---------------------------
   Sample data
   - clear "sample" vs "verified" values
   - DO NOT invent real application guarantees or real deadlines for real scholarships
   --------------------------- */
const SAMPLE_DATA_KEY = 'brightmind_demo_scholarships_v1';

const sampleScholarships = [
  {
    id: generateId(),
    name: "Global Merit Scholarship (Sample)",
    provider: "BrightMind Foundation (Sample)",
    country: "United Kingdom",
    eligibleNationalities: ["All"],
    studyLevels: ["Bachelor", "Master"],
    fields: ["Computer Science", "Engineering", "Mathematics"],
    funding: "Partial",
    applicationFee: "No",
    applicationFeeVerified: false,
    deadline: futureDate(45), // demo future date
    status: "open",
    requiredDocuments: ["Transcript", "CV", Motivation letter"],
    sourceUrl: "https://example.org/sample-source",
    applyUrl: "https://example.org/sample-apply",
    lastVerified: todayOffset(-10),
    verifiedState: "sample", // 'sample' | 'verified' | 'closed'
    note: "Demonstration listing — not a verified opportunity."
  },
  {
    id: generateId(),
    name: "EU Research Partnership (Sample)",
    provider: "University Collaboration (Sample)",
    country: "Croatia",
    eligibleNationalities: ["EU", "Croatia"],
    studyLevels: ["PhD"],
    fields: ["Biology", "Medicine"],
    funding: "Full",
    applicationFee: "No",
    applicationFeeVerified: true,
    deadline: pastDate(10), // demo expired
    status: "closed",
    requiredDocuments: ["Transcript", "Research proposal"],
    sourceUrl: "https://www.unizg.hr", // illustrative — not a claim
    applyUrl: "https://www.unizg.hr/announcements",
    lastVerified: todayOffset(-100),
    verifiedState: "closed",
    note: "Sample expired listing for demonstration."
  },
  {
    id: generateId(),
    name: "International STEM Fellowship (Demo)",
    provider: "Global Univ (Sample)",
    country: "United States",
    eligibleNationalities: ["All"],
    studyLevels: ["Master", "PhD"],
    fields: ["Computer Science", "Data Science", "Statistics"],
    funding: "Stipend",
    applicationFee: "Possible",
    applicationFeeVerified: false,
    deadline: futureDate(120),
    status: "open",
    requiredDocuments: ["Transcript", "CV", "Recommendation letters"],
    sourceUrl: "https://example.org/stem-fellow",
    applyUrl: "https://example.org/apply-stem",
    lastVerified: todayOffset(-5),
    verifiedState: "sample",
    note: "Demonstration listing — verify on official site before applying."
  }
];

/* ---------------------------
   Utilities
   --------------------------- */
function generateId(){
  return 's_' + Math.random().toString(36).slice(2,9);
}
function todayOffset(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}
function futureDate(days){ return todayOffset(days); }
function pastDate(days){ return todayOffset(-days); }
function isExpired(dateStr){
  if(!dateStr) return false;
  const d = new Date(dateStr + "T23:59:59");
  return Date.now() > d.getTime();
}
function safeOpen(url){
  window.open(url, '_blank', 'noopener');
}

/* ---------------------------
   Persistence: localStorage for demo
   --------------------------- */
function loadScholarships(){
  const raw = localStorage.getItem(SAMPLE_DATA_KEY);
  if(raw) {
    try {
      return JSON.parse(raw);
    } catch(e){
      console.warn('Failed to parse local data', e);
    }
  }
  // initially seed sample data
  localStorage.setItem(SAMPLE_DATA_KEY, JSON.stringify(sampleScholarships));
  return sampleScholarships.slice();
}
function saveScholarships(arr){
  localStorage.setItem(SAMPLE_DATA_KEY, JSON.stringify(arr));
}

/* ---------------------------
   App state
   --------------------------- */
let scholarships = loadScholarships();

/* ---------------------------
   DOM references
   --------------------------- */
const featuredList = document.getElementById('featuredList');
const directoryList = document.getElementById('directoryList');
const directoryEmpty = document.getElementById('directoryEmpty');
const filterCountry = document.getElementById('filterCountry');
const filterNationality = document.getElementById('filterNationality');
const filterLevel = document.getElementById('filterLevel');
const filterSubject = document.getElementById('filterSubject');
const filterFunding = document.getElementById('filterFunding');
const filterStatus = document.getElementById('filterStatus');
const applyFilters = document.getElementById('applyFilters');
const resetFilters = document.getElementById('resetFilters');
const sortBy = document.getElementById('sortBy');
const perPage = document.getElementById('perPage');
const quickSearchForm = document.getElementById('quickSearchForm');
const quickSearch = document.getElementById('quickSearch');
const featuredIds = new Set(); // optional

/* Profile DOM */
const profileForm = document.getElementById('profileForm');
const profileSubmit = document.getElementById('profileSubmit');
const docUpload = document.getElementById('docUpload');
const uploadList = document.getElementById('uploadList');
const matchResults = document.getElementById('matchResults');
const matchesList = document.getElementById('matchesList');

/* Admin DOM */
const adminForm = document.getElementById('adminForm');
const adminList = document.getElementById('adminList');
const adminSave = document.getElementById('adminSave');
const adminClear = document.getElementById('adminClear');

/* Nav toggle */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------
   Initialization
   --------------------------- */
function init(){
  scholarships = loadScholarships();
  populateFilters();
  renderFeatured();
  renderDirectory();
  populateProfileChoices();
  populateAdminList();
  wireEvents();
}
function wireEvents(){
  applyFilters.addEventListener('click', () => renderDirectory());
  resetFilters.addEventListener('click', resetAllFilters);
  quickSearchForm.addEventListener('submit', (e) => { e.preventDefault(); renderDirectory(); });
  document.getElementById('exploreBtn').addEventListener('click', ()=> location.hash = '#scholarships');
  sortBy.addEventListener('change', ()=> renderDirectory());
  perPage.addEventListener('change', ()=> renderDirectory());

  navToggle.addEventListener('click', toggleNav);

  profileForm.addEventListener('submit', handleProfileSubmit);
  docUpload.addEventListener('change', handleFileSelect);

  adminForm.addEventListener('submit', handleAdminSave);
  adminClear.addEventListener('click', () => {
    adminForm.reset();
    document.getElementById('adminEditId').value = '';
  });

  // delegate admin card actions
  adminList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if(action === 'edit') adminEdit(id);
    if(action === 'delete') adminDelete(id);
    if(action === 'verify') adminToggleVerify(id);
  });
}

/* ---------------------------
   Filters & render helpers
   --------------------------- */
function populateFilters(){
  // unique countries, nationalities, subjects
  const countries = new Set();
  const nationalities = new Set();
  const subjects = new Set();
  scholarships.forEach(s => {
    countries.add(s.country || 'Unknown');
    (s.eligibleNationalities || []).forEach(n => nationalities.add(n));
    (s.fields || []).forEach(f => subjects.add(f));
  });
  fillSelect(filterCountry, Array.from(countries).sort(), true);
  fillSelect(filterNationality, Array.from(nationalities).sort(), true);
  fillSelect(filterSubject, Array.from(subjects).sort(), true);
}

function fillSelect(selectEl, items, includeAny){
  selectEl.innerHTML = '';
  if(includeAny) selectEl.appendChild(new Option('Any',''));
  items.forEach(it => selectEl.appendChild(new Option(it, it)));
}

function resetAllFilters(){
  filterCountry.value = '';
  filterNationality.value = '';
  filterLevel.value = '';
  filterSubject.value = '';
  filterFunding.value = '';
  filterStatus.value = '';
  quickSearch.value = '';
  renderDirectory();
}

/* ---------------------------
   Rendering: Featured & Directory
   --------------------------- */
function renderFeatured(){
  // choose up to 3 non-expired items with recent verification if any
  const now = new Date();
  const items = scholarships
    .slice()
    .sort((a,b) => new Date(b.lastVerified) - new Date(a.lastVerified))
    .slice(0,3);

  featuredList.innerHTML = items.map(s => renderCardHtml(s, {compact:true})).join('');
}

function renderDirectory(){
  showLoading(directoryList);
  setTimeout(() => {
    const query = quickSearch.value.trim().toLowerCase();
    let results = scholarships.slice();

    // apply filters
    if(filterCountry.value) results = results.filter(s => (s.country || '').toLowerCase() === filterCountry.value.toLowerCase());
    if(filterNationality.value) results = results.filter(s => (s.eligibleNationalities || []).map(x=>x.toLowerCase()).includes(filterNationality.value.toLowerCase()));
    if(filterLevel.value) results = results.filter(s => (s.studyLevels || []).map(x=>x.toLowerCase()).includes(filterLevel.value.toLowerCase()));
    if(filterSubject.value) results = results.filter(s => (s.fields || []).map(x=>x.toLowerCase()).includes(filterSubject.value.toLowerCase()));
    if(filterFunding.value) results = results.filter(s => (s.funding || '').toLowerCase() === filterFunding.value.toLowerCase());
    if(filterStatus.value){
      if(filterStatus.value === 'open') results = results.filter(s => s.status === 'open' && !isExpired(s.deadline));
      else if(filterStatus.value === 'closed') results = results.filter(s => s.status === 'closed' || isExpired(s.deadline));
      else if(filterStatus.value === 'verified') results = results.filter(s => s.verifiedState === 'verified');
    }

    // text search
    if(query){
      results = results.filter(s => {
        const text = `${s.name} ${s.provider} ${s.fields.join(' ')} ${s.country}`.toLowerCase();
        return text.includes(query);
      });
    }

    // sorting
    if(sortBy.value === 'deadline'){
      results.sort((a,b) => new Date(a.deadline || 9999999999999) - new Date(b.deadline || 9999999999999));
    } else if(sortBy.value === 'lastVerified'){
      results.sort((a,b) => new Date(b.lastVerified) - new Date(a.lastVerified));
    }

    // pagination (simple)
    const per = Number(perPage.value) || 12;
    const pageItems = results.slice(0,per);

    if(pageItems.length === 0){
      directoryList.innerHTML = '';
      directoryEmpty.hidden = false;
    }else{
      directoryEmpty.hidden = true;
      directoryList.innerHTML = pageItems.map(s => renderCardHtml(s)).join('');
    }

    // attach card listeners after render
    attachCardListeners();
  }, 300);
}

function showLoading(container){
  container.innerHTML = `<div class="card" style="grid-column:1/-1"><p class="muted">Loading…</p></div>`;
}

/* ---------------------------
   Card template
   --------------------------- */
function renderCardHtml(s, opts = {}){
  const expired = isExpired(s.deadline);
  const statusLabel = s.verifiedState === 'verified' ? 'Verified' : (s.verifiedState === 'closed' ? 'Closed' : 'Sample');
  const feeText = s.applicationFeeVerified ? `${s.applicationFee} (verified)` : `${s.applicationFee} (unverified)`;
  const compactClass = opts.compact ? 'card-compact' : '';

  return `
  <article class="card ${compactClass}" data-id="${s.id}" role="listitem" tabindex="0" aria-labelledby="title-${s.id}">
    <div class="meta">
      <div>
        <span class="badge">${statusLabel}</span>
      </div>
      <div class="muted">${s.country} • ${s.provider}</div>
    </div>
    <h3 id="title-${s.id}">${escapeHtml(s.name)}</h3>
    <div class="muted small">
      <div><strong>Levels:</strong> ${s.studyLevels.join(', ')}</div>
      <div><strong>Fields:</strong> ${s.fields.join(', ')}</div>
      <div><strong>Funding:</strong> ${s.funding} • <strong>Application fee:</strong> ${feeText}</div>
      <div><strong>Deadline:</strong> ${s.deadline || 'N/A'} ${expired ? '<span style="color:#f68d6a"> (Expired)</span>' : ''}</div>
    </div>
    <p class="muted" style="margin-top:auto">${s.note || ''}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      <a href="${s.sourceUrl}" class="btn ghost" target="_blank" rel="noopener noreferrer">Official source</a>
      <a href="${s.applyUrl}" class="btn primary" target="_blank" rel="noopener noreferrer">Application</a>
      <button class="btn" data-action="view" data-id="${s.id}">View</button>
    </div>
  </article>
  `;
}

function attachCardListeners(){
  // allow 'View' button to open a simple modal or highlight - for this demo we open the source in a new tab
  const viewButtons = Array.from(document.querySelectorAll('button[data-action="view"]'));
  viewButtons.forEach(b => {
    b.removeEventListener('click', viewCardHandler);
    b.addEventListener('click', viewCardHandler);
  });
}
function viewCardHandler(e){
  const id = e.currentTarget.dataset.id;
  const s = scholarships.find(x => x.id === id);
  if(!s) return;
  // open official source for demo
  safeOpen(s.sourceUrl || s.applyUrl || '#');
}

/* ---------------------------
   Student profile: populate dropdowns
   --------------------------- */
function populateProfileChoices(){
  const countries = Array.from(new Set(scholarships.map(s => s.country)));
  const nationalities = new Set();
  scholarships.forEach(s => (s.eligibleNationalities || []).forEach(n=>nationalities.add(n)));

  const studentNationality = document.getElementById('studentNationality');
  const studentResidence = document.getElementById('studentResidence');
  const preferredDestination = document.getElementById('preferredDestination');

  fillSelect(studentNationality, Array.from(nationalities).sort(), true);
  fillSelect(studentResidence, countries.sort(), true);
  fillSelect(preferredDestination, countries.sort(), true);
}

/* ---------------------------
   Profile: file upload handling (client-only)
   --------------------------- */
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

function handleFileSelect(e){
  uploadList.innerHTML = '';
  const files = Array.from(e.target.files || []);
  if(files.length === 0) return;
  const listFrag = document.createDocumentFragment();
  files.forEach(f => {
    const li = document.createElement('div');
    li.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
    // validation
    if(!['application/pdf','image/png','image/jpeg','image/jpg'].includes(f.type) && !f.name.toLowerCase().endsWith('.pdf')){
      li.style.color = '#f1b35c';
      li.textContent += ' — Unsupported file type';
    } else if(f.size > MAX_FILE_BYTES){
      li.style.color = '#f1b35c';
      li.textContent += ' — File too large (max 5MB)';
    } else {
      // valid
      li.style.color = '#bfe6c6';
    }
    listFrag.appendChild(li);
  });
  uploadList.appendChild(listFrag);
}

/* ---------------------------
   Profile: matching logic (rule-based)
   - Modular and simple for demonstration
   --------------------------- */
function handleProfileSubmit(e){
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name?.value || document.getElementById('studentName').value.trim(),
    nationality: form.nationality?.value || document.getElementById('studentNationality').value,
    residence: form.residence?.value || document.getElementById('studentResidence').value,
    qualification: form.qualification?.value || document.getElementById('currentQualification').value,
    gradYear: form.gradYear?.value || document.getElementById('graduationYear').value,
    gpa: parseFloat(form.gpa?.value || document.getElementById('studentGPA').value) || null,
    level: form.level?.value || document.getElementById('preferredLevel').value,
    field: form.field?.value || document.getElementById('intendedField').value.trim(),
    destination: form.destination?.value || document.getElementById('preferredDestination').value,
    fundingPref: form.fundingPref?.value || document.getElementById('fundingPreference').value
  };

  // Validation
  let valid = true;
  const required = ['name','nationality','residence','qualification','gradYear','level','field','destination'];
  required.forEach(k => {
    const val = data[k];
    const el = profileForm.querySelector(`[name="${k}"], #${'student'+capitalize(k)}`);
    if(!val){
      showFieldError(el, 'This field is required');
      valid = false;
    } else {
      clearFieldError(el);
    }
  });
  if(!valid) return;

  // Run matching
  const results = matchScholarships(data);
  displayMatches(results, data);
}

/* Matching algorithm:
   - Scoring based on study level, destination, field, nationality eligibility, funding preference, deadline
   - Returns ranked array with explanation strings
*/
function matchScholarships(profile){
  const now = Date.now();
  const scored = scholarships.map(s => {
    const reasons = [];
    let score = 0;

    // exclude expired/closed
    if(s.status === 'closed' || isExpired(s.deadline)){
      reasons.push('Closed or expired');
      return {s, score: -100, reasons};
    }

    // level match
    if((s.studyLevels || []).map(x=>x.toLowerCase()).includes(profile.level.toLowerCase())){
      score += 30;
      reasons.push('Study level matches');
    } else {
      reasons.push('Different study level');
    }

    // field match (partial match if substring)
    const fieldMatch = (s.fields || []).some(f => f.toLowerCase().includes(profile.field.toLowerCase()));
    if(fieldMatch){
      score += 25;
      reasons.push('Field of study matches');
    } else {
      // possible match if not exact
      reasons.push('Field may not match');
    }

    // country/destination
    if(profile.destination && s.country && profile.destination.toLowerCase() === s.country.toLowerCase()){
      score += 20;
      reasons.push('Destination country matches');
    } else if(profile.destination){
      reasons.push('Different destination');
    }

    // nationality eligibility
    const eligible = (s.eligibleNationalities || []).map(x=>x.toLowerCase());
    if(eligible.includes('all') || eligible.includes(profile.nationality?.toLowerCase()) || eligible.includes('eu') && ['croatia','france','germany'].includes(profile.nationality?.toLowerCase())){
      score += 15;
      reasons.push('Nationality appears eligible');
    } else {
      reasons.push('Nationality may not be eligible');
    }

    // funding preference
    if(profile.fundingPref && s.funding && profile.fundingPref.toLowerCase() === s.funding.toLowerCase()){
      score += 10;
      reasons.push('Funding type matches preference');
    }

    // GPA heuristic (if provided)
    if(profile.gpa){
      // For demo: if scholarship is for "PhD" give higher threshold
      const thresh = s.studyLevels.includes('PhD') ? 3.5 : 2.5;
      if(profile.gpa >= thresh){
        score += 5;
        reasons.push(`GPA (${profile.gpa}) meets threshold (${thresh})`);
      } else {
        reasons.push(`GPA (${profile.gpa}) may be below threshold (${thresh})`);
      }
    }

    // verification/notes
    if(s.verifiedState === 'verified'){
      reasons.push('Opportunity is marked verified (official)');
      score += 8;
    } else if(s.verifiedState === 'sample'){
      reasons.push('Demo/sample listing — verify on official source');
    }

    return {s, score, reasons};
  });

  // filter out closed ones
  const filtered = scored.filter(r => r.score > -50);
  filtered.sort((a,b) => b.score - a.score);
  return filtered;
}

function displayMatches(results, profile){
  matchesList.innerHTML = '';
  matchResults.hidden = false;
  if(results.length === 0){
    matchesList.innerHTML = `<div class="card"><p>No matches found. Try broadening preferences.</p></div>`;
    return;
  }

  results.forEach(item => {
    const s = item.s;
    const explanation = item.reasons.map(r => `<li>${escapeHtml(r)}</li>`).join('');
    const matchTier = item.score >= 60 ? 'Likely match' : (item.score >= 35 ? 'Possible match (needs verification)' : 'Unlikely match');
    const html = `
      <article class="card" tabindex="0">
        <div class="meta"><div><strong>${escapeHtml(matchTier)}</strong></div><div class="muted">${s.country} • ${s.provider}</div></div>
        <h3>${escapeHtml(s.name)}</h3>
        <div class="muted"><strong>Score:</strong> ${Math.round(item.score)}</div>
        <ul class="muted small">${explanation}</ul>
        <div style="display:flex;gap:8px;margin-top:8px">
          <a href="${s.sourceUrl}" class="btn ghost" target="_blank" rel="noopener noreferrer">Official source</a>
          <a href="${s.applyUrl}" class="btn primary" target="_blank" rel="noopener noreferrer">Application</a>
        </div>
      </article>
    `;
    matchesList.insertAdjacentHTML('beforeend', html);
  });
}

/* ---------------------------
   Admin demo functions (frontend only)
   --------------------------- */
function populateAdminList(){
  adminList.innerHTML = scholarships.map(s => adminCardHtml(s)).join('');
}

function adminCardHtml(s){
  const expired = isExpired(s.deadline);
  return `
    <article class="card" data-id="${s.id}">
      <div class="meta">
        <div><strong>${escapeHtml(s.name)}</strong></div>
        <div class="muted">${s.country} • ${s.provider}</div>
      </div>
      <p class="muted small">${s.fields.join(', ')} • ${s.studyLevels.join(', ')}</p>
      <p class="muted">Deadline: ${s.deadline || 'N/A'} ${expired ? '(Expired)' : ''} • ${s.verifiedState}</p>
      <div style="display:flex;gap:8px;margin-top:auto">
        <button class="btn" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn" data-action="delete" data-id="${s.id}">Delete</button>
        <button class="btn" data-action="verify" data-id="${s.id}">Toggle Verify</button>
      </div>
    </article>
  `;
}

function handleAdminSave(e){
  e.preventDefault();
  const id = document.getElementById('adminEditId').value;
  const record = {
    id: id || generateId(),
    name: document.getElementById('admName').value.trim(),
    provider: document.getElementById('admProvider').value.trim(),
    country: document.getElementById('admCountry').value.trim(),
    eligibleNationalities: splitAndTrim(document.getElementById('admNationalities').value),
    studyLevels: [document.getElementById('admLevel').value],
    fields: splitAndTrim(document.getElementById('admFields').value),
    funding: document.getElementById('admFunding').value.trim() || 'Partial',
    applicationFee: document.getElementById('admFeeVerified').value === 'no' ? 'No' : 'Possible',
    applicationFeeVerified: document.getElementById('admFeeVerified').value === 'verified',
    deadline: document.getElementById('admDeadline').value || null,
    status: document.getElementById('admStatus').value,
    requiredDocuments: splitAndTrim(document.getElementById('admDocs').value),
    sourceUrl: document.getElementById('admSourceUrl').value.trim(),
    applyUrl: document.getElementById('admApplyUrl').value.trim(),
    lastVerified: todayOffset(0),
    verifiedState: document.getElementById('admVerified').value,
    note: 'Entered via demo admin interface'
  };

  // basic validation
  if(!record.name || !record.provider || !record.country){
    alert('Please fill required fields (name, provider, country). Demo admin is not secure.');
    return;
  }

  // update or insert
  const idx = scholarships.findIndex(s => s.id === record.id);
  if(idx >= 0){
    scholarships[idx] = record;
  } else {
    scholarships.unshift(record);
  }
  saveScholarships(scholarships);
  populateFilters();
  renderDirectory();
  populateAdminList();
  adminForm.reset();
  document.getElementById('adminEditId').value = '';
  alert('Saved (browser-only demo). Changes persist in this browser localStorage.');
}

function adminEdit(id){
  const s = scholarships.find(x => x.id === id);
  if(!s) return;
  document.getElementById('adminEditId').value = s.id;
  document.getElementById('admName').value = s.name || '';
  document.getElementById('admProvider').value = s.provider || '';
  document.getElementById('admCountry').value = s.country || '';
  document.getElementById('admNationalities').value = (s.eligibleNationalities || []).join(', ');
  document.getElementById('admLevel').value = (s.studyLevels && s.studyLevels[0]) || 'Bachelor';
  document.getElementById('admFields').value = (s.fields || []).join(', ');
  document.getElementById('admFunding').value = s.funding || '';
  document.getElementById('admFeeVerified').value = s.applicationFeeVerified ? 'verified' : 'unknown';
  document.getElementById('admDeadline').value = s.deadline || '';
  document.getElementById('admStatus').value = s.status || 'open';
  document.getElementById('admDocs').value = (s.requiredDocuments || []).join(', ');
  document.getElementById('admSourceUrl').value = s.sourceUrl || '';
  document.getElementById('admApplyUrl').value = s.applyUrl || '';
  document.getElementById('admVerified').value = s.verifiedState || 'sample';
  window.scrollTo({top: document.getElementById('admin').offsetTop - 40, behavior:'smooth'});
}

function adminDelete(id){
  if(!confirm('Delete this listing from the browser demo? This action is not reversible.')) return;
  scholarships = scholarships.filter(s => s.id !== id);
  saveScholarships(scholarships);
  populateFilters();
  renderDirectory();
  populateAdminList();
}

function adminToggleVerify(id){
  const s = scholarships.find(x => x.id === id);
  if(!s) return;
  if(s.verifiedState === 'verified') s.verifiedState = 'sample';
  else s.verifiedState = 'verified';
  s.lastVerified = todayOffset(0);
  saveScholarships(scholarships);
  populateFilters();
  renderDirectory();
  populateAdminList();
}

/* ---------------------------
   Small helpers & escaping
   --------------------------- */
function splitAndTrim(str){
  if(!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}
function escapeHtml(s){
  if(!s) return '';
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function capitalize(s){ return s && s[0].toUpperCase() + s.slice(1); }
function showFieldError(el, msg){
  if(!el) return;
  const name = el.name || el.id;
  const err = document.querySelector(`.field-error[data-for="${name}"]`);
  if(err) err.textContent = msg;
}
function clearFieldError(el){
  if(!el) return;
  const name = el.name || el.id;
  const err = document.querySelector(`.field-error[data-for="${name}"]`);
  if(err) err.textContent = '';
}

/* ---------------------------
   Nav toggle for mobile
   --------------------------- */
function toggleNav(){
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.style.display = expanded ? 'none' : 'flex';
}

/* ---------------------------
   Initialize and attach events on page load
   --------------------------- */
document.addEventListener('DOMContentLoaded', init);