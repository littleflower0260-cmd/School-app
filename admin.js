// js/admin.js
import { supabase } from './supabase.js';
import { requireAuth, loadSettingsToUI, toast } from './common.js';

const user = requireAuth('/login.html'); // ensures logged-in; redirects if not

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadSettingsToUI();
  document.getElementById('adminName').textContent = user.name || user.username;
  await loadUsers();
  await loadNotifications();
  await loadEvents();
  await loadGallery();
  await loadLeaves();
});

export async function loadUsers(){
  const { data } = await supabase.from('users').select('*').order('created_at', {ascending:false});
  const tbody = document.getElementById('usersTbody');
  tbody.innerHTML = data.map(u=>`
    <tr>
      <td>${u.username}</td>
      <td>${u.name||''}</td>
      <td>${u.role}</td>
      <td>${u.class||''}</td>
      <td>
        <button onclick="editUser('${u.id}')" class="btn">Edit</button>
        ${u.role==='admin'?'':'<button onclick="delUser(\\''+u.id+'\\')" class="btn outline">Delete</button>'}
      </td>
    </tr>
  `).join('');
}

window.addUser = async function(){
  const username = prompt('Username (unique)');
  if(!username) return;
  const password = prompt('Password');
  const role = prompt('Role (admin/teacher/student)','student');
  const name = prompt('Name','');
  const klass = role==='student' ? prompt('Class','') : '';
  const { error } = await supabase.from('users').insert({username, password, role, name, class:klass});
  if(error) return toast('Error adding user: '+error.message);
  toast('User added');
  loadUsers();
};

window.editUser = async function(id){
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  const name = prompt('Name', data.name||'');
  const klass = prompt('Class', data.class||'');
  await supabase.from('users').update({ name, class: klass }).eq('id', id);
  toast('Updated');
  loadUsers();
};

window.delUser = async function(id){
  if(!confirm('Delete user?')) return;
  await supabase.from('users').delete().eq('id', id);
  toast('Deleted');
  loadUsers();
};

// Notifications
export async function loadNotifications(){
  const { data } = await supabase.from('notifications').select('*').order('created_at',{ascending:false});
  const box = document.getElementById('notifList');
  box.innerHTML = data.map(n=>`<div class="card"><strong>${n.title}</strong><div class="muted">${n.message}</div><div class="small">${new Date(n.created_at).toLocaleString()}</div></div>`).join('');
}

window.postNotification = async function(){
  const title = prompt('Title');
  const message = prompt('Message');
  const target = prompt('Target (all/student/teacher)','all');
  if(!title||!message) return;
  await supabase.from('notifications').insert({ title, message, target });
  toast('Posted');
  loadNotifications();
};

// Events
export async function loadEvents(){
  const { data } = await supabase.from('calendar_events').select('*').order('date',{ascending:true});
  const box = document.getElementById('eventsList');
  box.innerHTML = data.map(e=>`<div class="card"><strong>${e.title}</strong><div class="muted">${e.description||''}</div><div class="small">${e.date}</div></div>`).join('');
}

window.addEvent = async function(){
  const title = prompt('Event title');
  const date = prompt('Date (YYYY-MM-DD)');
  const desc = prompt('Description','');
  if(!title||!date) return;
  await supabase.from('calendar_events').insert({ title, date, description: desc });
  toast('Event added');
  loadEvents();
};

// Gallery
export async function loadGallery(){
  const { data } = await supabase.from('gallery').select('*').order('created_at',{ascending:false});
  const box = document.getElementById('galleryList');
  box.innerHTML = data.map(g=>`<div><a href="${g.link}" target="_blank">${g.title||g.link}</a></div>`).join('');
}

window.addGallery = async function(){
  const title = prompt('Title');
  const link = prompt('Google Drive link or URL');
  const category = prompt('Category','General');
  if(!link) return;
  await supabase.from('gallery').insert({ title, link, category });
  toast('Added');
  loadGallery();
};

// Leaves
export async function loadLeaves(){
  const { data } = await supabase.from('leaves').select('*, users(username,name)').order('created_at',{ascending:false});
  const box = document.getElementById('leavesList');
  box.innerHTML = data.map(l=>`<div class="card"><strong>${l.users?.name||l.user_id}</strong>
    <div>${l.reason} ${l.from_date}→${l.to_date}</div>
    <div>Status: ${l.status}</div>
    <div><button onclick="approveLeave('${l.id}')">Approve</button> <button onclick="rejectLeave('${l.id}')">Reject</button></div>
    </div>`).join('');
}

window.approveLeave = async id => { await supabase.from('leaves').update({status:'approved'}).eq('id',id); toast('Approved'); loadLeaves();};
window.rejectLeave = async id => { await supabase.from('leaves').update({status:'rejected'}).eq('id',id); toast('Rejected'); loadLeaves();};

// Settings update
window.saveSettings = async function(){
  const schoolName = document.getElementById('setSchoolName').value;
  const logoUrl = document.getElementById('setLogoUrl').value;
  const theme = document.getElementById('setTheme').value;
  // upsert
  const { data } = await supabase.from('settings').select('*').limit(1).single().catch(()=>({data:null}));
  if(data){
    await supabase.from('settings').update({ school_name: schoolName, logo_url: logoUrl, theme }).eq('id', data.id);
  } else {
    await supabase.from('settings').insert({ school_name: schoolName, logo_url: logoUrl, theme });
  }
  toast('Settings saved');
  await loadSettingsToUI();
};

