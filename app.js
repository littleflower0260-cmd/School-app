// app.js - UI wiring and placeholders
// NOTE: this file assumes supabase.js is available (ESM). If your hosting doesn't support modules, we'll adapt.

import { supabase, getUserById, fetchNotices } from './supabase.js';

// helpers
const $ = s => document.querySelector(s);
const qs = s => document.querySelectorAll(s);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function toast(msg, ms=2000){
  const root = document.getElementById('toastRoot');
  root.innerHTML = `<div class="toast">${msg}</div>`;
  setTimeout(()=> root.innerHTML = '', ms);
}

// State
let SESSION = null;

// init UI
document.addEventListener('DOMContentLoaded', async ()=>{
  // theme
  const t = localStorage.getItem('lfs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  $('#themeSelect').value = t;
  $('#themeSelect').addEventListener('change', e=>{
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('lfs_theme', e.target.value);
  });

  // nav
  $('#btnPrimaryLogin').addEventListener('click', ()=> navigateTo('login'));
  $('#btnLoginNav').addEventListener('click', ()=> navigateTo('login'));
  $('#btnCancelLogin').addEventListener('click', ()=> navigateTo('home'));
  $('#btnHome').addEventListener('click', ()=> navigateTo('home'));
  $('#btnMenu').addEventListener('click', openMenu);
  $('#btnOpenCalendarHome').addEventListener('click', ()=> openModule('calendar'));
  $('#btnDashHome')?.addEventListener('click', ()=> navigateTo('home'));

  $('#btnLogin')?.addEventListener('click', attemptLogin);
  $('#btnForgot')?.addEventListener('click', ()=> toast('Use Supabase Auth reset flow — will configure later'));

  buildModulesGrid();
  await loadHomeNotices();
});

// nav & UI
function navigateTo(screen){
  hide($('#loginScreen'));
  hide($('#dashScreen'));
  hide($('#moduleScreen'));
  show($('#homeScreen'));
  if (screen === 'login'){ show($('#loginScreen')); hide($('#homeScreen')); }
  if (screen === 'dashboard'){ show($('#dashScreen')); hide($('#homeScreen')); hide($('#loginScreen')); }
  if (screen === 'home'){ show($('#homeScreen')); hide($('#loginScreen')); hide($('#dashScreen')); hide($('#moduleScreen')); }
}

function openMenu(){
  // simple menu modal
  const html = `<div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn" onclick="openModule('calendar')">Calendar</button>
    <button class="btn" onclick="openModule('notices')">Notifications</button>
    <button class="btn" onclick="openModule('gallery')">Gallery</button>
    <button class="btn" onclick="openModule('settings')">Settings</button>
    <button class="btn" onclick="logout()">Logout</button>
  </div>`;
  showModal('Menu', html, [{label:'Close'}]);
}

// modules grid
function buildModulesGrid(){
  const modules = [
    {id:'login', label:'Login'},
    {id:'notices', label:'Notification Board'},
    {id:'calendar', label:'Calendar & Events'},
    {id:'gallery', label:'Gallery'},
    {id:'attendance', label:'Attendance'},
    {id:'fees', label:'Fees'},
    {id:'leaves', label:'Leaves'},
    {id:'settings', label:'Settings'}
  ];
  const grid = $('#modulesGrid');
  grid.innerHTML = '';
  modules.forEach(m=>{
    const node = document.createElement('div');
    node.className = 'module fade-in';
    node.innerHTML = `<div style="font-size:22px">🔹</div><h4>${m.label}</h4>`;
    node.addEventListener('click', ()=> {
      if (m.id === 'login') navigateTo('login');
      else openModule(m.id);
    });
    grid.appendChild(node);
  });
}

// open module placeholder
function openModule(name){
  hide($('#homeScreen'));
  hide($('#loginScreen'));
  hide($('#dashScreen'));
  show($('#moduleScreen'));
  const content = document.getElementById('moduleContent');
  content.innerHTML = `<div class="card"><div class="section-title"><h3>${name.toUpperCase()}</h3></div>
    <div style="margin-top:12px">This module is not yet implemented. We'll wire Supabase and UI here next.</div></div>`;
}

// login (uses DB-stored password approach as placeholder)
// NOTE: we will later switch to Supabase Auth (recommended)
async function attemptLogin(){
  const id = $('#inputId').value.trim();
  const pwd = $('#inputPwd').value;
  if (!id || !pwd) return toast('Enter ID & password');
  // fetch user via helper
  const user = await getUserById(id);
  if (!user) { toast('User not found'); return; }
  if (user.password !== pwd) { toast('Incorrect password'); return; }
  SESSION = { id: user.id, role: user.role, name: user.name || user.id };
  localStorage.setItem('lfs_session', JSON.stringify(SESSION));
  renderAfterLogin();
  toast('Welcome '+(user.name||user.id));
}

function logout(){
  SESSION = null;
  localStorage.removeItem('lfs_session');
  navigateTo('home');
  toast('Logged out');
}

async function renderAfterLogin(){
  if (!SESSION) return;
  $('#dashTitle').textContent = SESSION.name || SESSION.id;
  $('#dashRole').textContent = (SESSION.role || 'user').toUpperCase();
  $('#signedUser').textContent = SESSION.id;
  show($('#dashScreen'));
  hide($('#homeScreen'));
  hide($('#loginScreen'));
  hide($('#moduleScreen'));
  renderDashboardModules();
}

function renderDashboardModules(){
  const container = $('#dashModules');
  container.innerHTML = '';
  const role = SESSION.role;
  // Admin: master modules
  if (role === 'admin'){
    container.appendChild(el(`<div class="card"><div class="section-title"><h3>Admin — Master Control</h3><div class="muted small right">All modules in one place</div></div>
      <div style="height:10px"></div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
        <button class="btn" data-open="users">Users</button>
        <button class="btn" data-open="attendance">Attendance</button>
        <button class="btn" data-open="fees">Fees</button>
        <button class="btn" data-open="events">Calendar</button>
        <button class="btn" data-open="notices">Notices</button>
        <button class="btn" data-open="gallery">Gallery</button>
       `));
    // TODO: wire click handlers for these buttons (open module)
  } else if (role === 'teacher'){
    container.appendChild(el(`<div class="card"><div class="section-title"><h3>Teacher — Class Tools</h3><div class="muted small right">Manage your class</div></div>
      <div style="height:10px"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <button class="btn" data-open="attendance">Attendance</button>
        <button class="btn" data-open="notices">Notices</button>
        <button class="btn" data-open="leaves">Leaves</button>
       `));
  } else {
    container.appendChild(el(`<div class="card"><div class="section-title"><h3>Student / Parent</h3><div class="muted small right">View-only dashboard</div></div>
      <div style="height:10px"></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
        <button class="btn" data-open="attendance">Attendance</button>
        <button class="btn" data-open="fees">Fees</button>
       `));
  }
}

// home: load short notices (uses supabase helper)
async function loadHomeNotices(){
  try{
    const notices = await fetchNotices(3);
    const preview = notices.length ? notices[0].title || notices[0].message : 'No notices';
    $('#homeNoticePreview').textContent = preview;
  }catch(e){ console.error(e); }
}

/* ========== small UI helpers copied from the premium file ========== */
function showModal(title, contentHtml, buttons=[]){
  const root = document.getElementById('modalRoot');
  root.classList.remove('hidden');
  root.innerHTML = `<div class="modal-back"><div class="modal"><h3>${title}</h3><div style="margin-top:10px">${contentHtml}</div><div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px" id="modalActions"></div></div></div>`;
  const act = document.getElementById('modalActions');
  buttons.forEach(b=>{
    const btn = document.createElement('button');
    btn.className = 'btn';
    if (b.class) btn.className += ' '+b.class;
    btn.textContent = b.label;
    btn.onclick = ()=>{ if (b.cb) b.cb(); root.classList.add('hidden'); root.innerHTML=''; };
    act.appendChild(btn);
  });
}
function closeModal(){ document.getElementById('modalRoot').classList.add('hidden'); document.getElementById('modalRoot').innerHTML=''; }
function el(html){ const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild || d; }
function escapeHtml(s){ if (!s) return ''; return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }


// app.js
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const dashboard = document.getElementById('dashboard');
  const roleDisplay = document.getElementById('role-display');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // Fetch user from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role, password_hash')
        .eq('email', username) // username as email
        .single();

      if (error || !data) {
        alert('User not found or error fetching data!');
        return;
      }

      // Temporary password check (plaintext)
      if (data.password_hash !== password) {
        alert('Incorrect password!');
        return;
      }

      // Show dashboard based on role
      document.getElementById('login-section').style.display = 'none';
      dashboard.style.display = 'block';
      roleDisplay.textContent = `Welcome ${data.full_name} (${data.role})`;

      // Role-specific logic
      if (data.role === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
      } else if (data.role === 'teacher') {
        document.getElementById('teacher-panel').style.display = 'block';
      } else {
        document.getElementById('student-panel').style.display = 'block';
      }
    });
  }
});