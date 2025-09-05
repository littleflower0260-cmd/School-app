// supabase.js - Client-side helper for Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Tumhara Supabase Project Details
const SUPABASE_URL = 'https://uyomjihzletbizdtgzxa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5b21qaWh6bGV0Yml6ZHRnenhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjE0MDAsImV4cCI6MjA3MjM5NzQwMH0.6bkFxkdvUc-mWwEC6NiD8ac4EEgtioXUCkiykzLF0Vs';

// Supabase Client Create karo
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example helper functions

// User data fetch by ID
export async function getUserById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data?.[0] || null;
}

// Latest notices fetch
export async function fetchNotices(limit = 5) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
  return data || [];
}