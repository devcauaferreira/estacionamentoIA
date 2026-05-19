import '../main.js';
import { login, redirecionarPorPerfil } from '../core/auth.js';
import { erro, aviso } from '../ui/alerts.js';

const form = document.querySelector('[data-login-form]');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dados = new FormData(form);
  const email = String(dados.get('email') || '').trim();
  const senha = String(dados.get('senha') || '');

  if (!email || !senha) {
    await aviso('Campos obrigatórios', 'Informe e-mail e senha para entrar.');
    return;
  }

  try {
    await login(email, senha);
    await redirecionarPorPerfil();
  } catch (error) {
    erro('Não foi possível entrar', error.message);
  }
});
