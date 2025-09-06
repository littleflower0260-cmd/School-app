// js/supabase.js
// Replace values below if you want to change project keys.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jwgqyvbhaylzmohqdsps.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Z3F5dmJoYXlsem1vaHFkc3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDAwNjEsImV4cCI6MjA3MTg3NjA2MX0.JgeXl0fgOkuMRWB_9RKr3lYbSUSyelmizbFGT4RIw8Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

