// js/teacher.js
import { supabase } from './supabase.js';
import { requireAuth, toast, loadSettingsToUI } from './common.js';

const user = requireAuth('/login.html');

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadSettingsToUI();
  document.getElementById('teacherName').textContent = user.name || user.username;
  await loadStudents();
  await loadMyAttendance();
});

export async function loadStudents(){
  // For simplicity: load all students (later filter by classAssigned)
  const { data } = await supabase.from('users').select('*').eq('role','student').order('name');
  const tbody = document.getElementById('teacherStudentsTbody');
  tbody.innerHTML = data.map(s=>`<tr><td>${s.name}</td><td>${s.class||''}</td><td>${s.roll_no||''}</td>
    <td><button onclick="markAtt('${s.id}','present')">Present</button><button onclick="markAtt('${s.id}','absent')">Absent</button></td></tr>`).join('');
}

window.markAtt = async function(studentId, status){
  const date = new Date().toISOString().slice(0,10);
  await supabase.from('attendance').insert({ user_id: studentId, date, status });
  toast('Marked '+status);
  loadMyAttendance();
};

export async function loadMyAttendance(){
  const { data } = await supabase.from('attendance').select('*').eq('user_id', user.id).order('date',{ascending:false}).limit(50);
  const box = document.getElementById('teacherAttList');
  box.innerHTML = data.map(a=>`<div>${a.date} — ${a.status}</div>`).join('');
}
