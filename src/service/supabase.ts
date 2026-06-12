import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;


export const supabase = createClient(supabaseUrl, supabaseKey,{
    auth: {
        persistSession:false,        
        autoRefreshToken: true,
        detectSessionInUrl: true,
        
    },  
});

// sempre que mudar o estado de auth, salvar no sessionStorage
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    sessionStorage.setItem("supabase.auth.token", JSON.stringify(session))
  } else {
    sessionStorage.removeItem("supabase.auth.token")
  }
})

// ao carregar a página, restaurar a sessão se existir
const savedSession = sessionStorage.getItem("supabase.auth.token")
if (savedSession) {
  supabase.auth.setSession(JSON.parse(savedSession))
}