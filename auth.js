// js/auth.js
import { supabase } from './supabase.js';
import { saveSession, toast } from './common.js';

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if(!username || !password){ toast('Enter username & password'); return; }
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if(error || !data){ toast('Invalid credentials'); return; }
    if(data.password !== password){ toast('Invalid credentials'); return; }
    // Save session (only minimal)
    saveSession({ id: data.id, username: data.username, role: data.role, name: data.name });
    if(data.role === 'admin') window.location.href = '/admin.html';
    else if(data.role === 'teacher') window.location.href = '/teacher.html';
    else window.location.href = '/student.html';
  });
}

