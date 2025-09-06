// js/student.js
import { supabase } from './supabase.js';
import { requireAuth, loadSettingsToUI, toast } from './common.js';

const user = requireAuth('/login.html');

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadSettingsToUI();
  document.getElementById('studentName').textContent = user.name || user.username;
  await loadMyAttendance();
  await loadMyFees();
  await loadNotices();
});

export async function loadMyAttendance(){
  const { data } = await supabase.from('attendance').select('*').eq('user_id', user.id).order('date',{ascending:false});
  const tbody = document.getElementById('studentAttTbody');
  if(!data || !tbody) return;
  tbody.innerHTML = data.map(a=>`<tr><td>${a.date}</td><td>${a.status}</td></tr>`).join('');
}

export async function loadMyFees(){
  const { data } = await supabase.from('fees').select('*').eq('student_id', user.id).order('year',{ascending:false});
  const tbody = document.getElementById('studentFeesTbody');
  if(!data || !tbody) return;
  tbody.innerHTML = data.map(f=>`<tr><td>${f.year}</td><td>${f.total}</td><td>${f.paid}</td><td>${f.remaining}</td></tr>`).join('');
}

export async function loadNotices(){
  const { data } = await supabase.from('notifications').select('*').order('created_at',{ascending:false});
  const box = document.getElementById('studentNotices');
  if(!box) return;
  box.innerHTML = data.map(n=>`<div class="card"><strong>${n.title}</strong><div class="muted">${n.message}</div></div>`).join('');
}

window.applyLeave = async function(){
  const from_date = prompt('From date (YYYY-MM-DD)');
  const to_date = prompt('To date (YYYY-MM-DD)');
  const reason = prompt('Reason (sick/out_of_town/family_emergency/personal/other)','sick');
  if(!from_date || !to_date) return;
  await supabase.from('leaves').insert({ user_id: user.id, reason, from_date, to_date, status: 'pending' });
  toast('Leave applied');
}

