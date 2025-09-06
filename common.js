// js/common.js
import { supabase } from './supabase.js';

// DOM helper
export const $ = sel => document.querySelector(sel);
export const $all = sel => document.querySelectorAll(sel);

export function toast(msg, time=3000){
  let el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.right = '12px';
  el.style.bottom = '12px';
  el.style.background = 'linear-gradient(90deg,#2563eb,#8b5cf6)';
  el.style.color = '#fff';
  el.style.padding = '10px 12px';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 6px 20px rgba(0,0,0,.12)';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), time);
}

export function saveSession(user){
  localStorage.setItem('lfs_user', JSON.stringify(user));
}

export function loadSession(){
  try { return JSON.parse(localStorage.getItem('lfs_user')); } catch(e){ return null; }
}

export function logout(){
  localStorage.removeItem('lfs_user');
  window.location.href = '/login.html';
}

export async function loadSettingsToUI(){
  const { data } = await supabase.from('settings').select('*').limit(1).single().catch(()=>({data:null}));
  if(data){
    const nameEl = document.getElementById('schoolNameDisplay');
    if(nameEl) nameEl.textContent = data.school_name || 'Little Flower School';
    const logoEl = document.querySelectorAll('.schoolLogo');
    logoEl.forEach(i=>{ if(i.tagName==='IMG') i.src = data.logo_url || '/assets/logo.png'; else i.textContent = data.school_name || 'Little Flower School';});
  }
}

export function requireAuth(redirect='login.html'){
  const user = loadSession();
  if(!user) window.location.href = redirect;
  return user;
}

