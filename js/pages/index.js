import { supabase } from '../core/supabase.js';
import { redirecionarPorPerfil } from '../core/auth.js';

async function iniciar() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    await redirecionarPorPerfil();
  } else {
    window.location.href = `${import.meta.env.BASE_URL}login.html`;
  }
}

iniciar();
