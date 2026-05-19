import { supabase } from './supabase.js';

export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = `${import.meta.env.BASE_URL}login.html`;
}

export async function getUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getPerfilAtual() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const { data, error } = await supabase
    .from('perfis')
    .select('id, user_id, nome, email, tipo_usuario')
    .eq('user_id', usuario.id)
    .single();

  if (error) throw error;
  return data;
}

export async function verificarAutenticacao() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!data.session) {
    window.location.href = `${import.meta.env.BASE_URL}login.html`;
    return null;
  }

  return data.session;
}

export async function redirecionarPorPerfil() {
  const perfil = await getPerfilAtual();
  if (!perfil) return;

  if (perfil.tipo_usuario === 'cliente') {
    window.location.href = `${import.meta.env.BASE_URL}cliente/dashboard-cliente.html`;
    return;
  }

  window.location.href = `${import.meta.env.BASE_URL}pages/dashboard.html`;
}
