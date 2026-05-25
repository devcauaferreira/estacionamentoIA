import { verificarAutenticacao, getPerfilAtual, logout } from '../core/auth.js';
import { erro } from './alerts.js';
import { heroicon, renderHeroicons } from './icons.js';

const linksProprietario = [
  ['Dashboard', 'pages/dashboard.html', 'chart-bar'],
  ['Movimentações', 'pages/movimentacoes.html', 'truck'],
  ['Pátio', 'pages/patio.html', 'home'],
  ['Histórico', 'pages/historico.html', 'clock'],
  ['Usuários', 'pages/usuarios.html', 'user-group'],
  ['Veículos', 'pages/veiculos.html', 'truck'],
];

const linksCliente = [
  ['Dashboard', 'cliente/dashboard-cliente.html', 'chart-bar'],
];

function resolveUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function montarLink([label, path, icon]) {
  const ativo = window.location.pathname.endsWith(path);
  const classes = ativo
    ? 'bg-primary text-white'
    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700';
  return `<a class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${classes}" href="${resolveUrl(path)}">${heroicon(icon)}<span>${label}</span></a>`;
}

export async function inicializarLayout({ area = 'proprietario' } = {}) {
  try {
    await verificarAutenticacao();
    const perfil = await getPerfilAtual();
    const sidebar = document.querySelector('[data-sidebar]');
    const userName = document.querySelector('[data-user-name]');
    const userRole = document.querySelector('[data-user-role]');
    const logoutButton = document.querySelector('[data-logout]');
    const themeButton = document.querySelector('[data-theme-toggle]');

    if (sidebar) {
      const links = area === 'cliente' ? linksCliente : linksProprietario;
      sidebar.innerHTML = links.map(montarLink).join('');
    }

    if (userName) userName.textContent = perfil?.nome || perfil?.email || 'Usuário';
    if (userRole) userRole.textContent = perfil?.tipo_usuario === 'cliente' ? 'Cliente mensalista' : 'Proprietário';

    logoutButton?.addEventListener('click', async () => {
      try {
        await logout();
      } catch (error) {
        erro('Erro ao sair', error.message);
      }
    });

    themeButton?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('tema', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      renderHeroicons();
    });

    if (localStorage.getItem('tema') === 'dark') {
      document.documentElement.classList.add('dark');
    }

    renderHeroicons();
    return perfil;
  } catch (error) {
    erro('Erro de autenticação', error.message);
    return null;
  }
}

export function formatarDataHora(valor) {
  if (!valor) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
}
