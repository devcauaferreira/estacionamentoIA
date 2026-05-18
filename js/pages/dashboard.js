import { supabase } from '../config/supabase.js';
import { aplicarTemaInicial } from '../ui/theme.js';
import { verificarAutenticacao } from '../services/auth.js';
import { configurarLayout } from '../ui/layout.js';
import { exibirErro } from '../ui/alerts.js';
import { escaparHtml, normalizarMensagemErro, renderizarMensagemTabela } from '../utils/crud.js';
import { formatarDataHora } from '../utils/formatters.js';

aplicarTemaInicial();

const totalPatio = document.querySelector('[data-dashboard-patio]');
const totalMensalistas = document.querySelector('[data-dashboard-mensalistas]');
const totalEntradas = document.querySelector('[data-dashboard-entradas]');
const totalSaidas = document.querySelector('[data-dashboard-saidas]');
const recentesTbody = document.querySelector('[data-dashboard-recentes]');

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    await carregarDashboard();
  } catch (error) {
    await exibirErro('Sessão inválida', normalizarMensagemErro(error));
    window.location.href = '../login.html';
  }
}

async function carregarDashboard() {
  try {
    const [patio, mensalistas, entradas, saidas, recentes] = await Promise.all([
      contarPatio(),
      contarMensalistas(),
      contarEntradasHoje(),
      contarSaidasHoje(),
      carregarMovimentacoesRecentes(),
    ]);

    totalPatio.textContent = patio;
    totalMensalistas.textContent = mensalistas;
    totalEntradas.textContent = entradas;
    totalSaidas.textContent = saidas;
    renderizarRecentes(recentes);
  } catch (error) {
    await exibirErro('Erro ao carregar dashboard', normalizarMensagemErro(error));
    renderizarMensagemTabela(recentesTbody, 'Não foi possível carregar as movimentações recentes.', 3);
  }
}

async function contarPatio() {
  const { count, error } = await supabase
    .from('movimentacoes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'aberta');

  if (error) {
    throw error;
  }

  return count || 0;
}

async function contarMensalistas() {
  const { count, error } = await supabase
    .from('clientes')
    .select('id', { count: 'exact', head: true })
    .eq('ativo', true);

  if (error) {
    throw error;
  }

  return count || 0;
}

async function contarEntradasHoje() {
  const { inicio, fim } = intervaloHoje();
  const { count, error } = await supabase
    .from('movimentacoes')
    .select('id', { count: 'exact', head: true })
    .gte('data_hora_entrada', inicio)
    .lt('data_hora_entrada', fim);

  if (error) {
    throw error;
  }

  return count || 0;
}

async function contarSaidasHoje() {
  const { inicio, fim } = intervaloHoje();
  const { count, error } = await supabase
    .from('movimentacoes')
    .select('id', { count: 'exact', head: true })
    .gte('data_hora_saida', inicio)
    .lt('data_hora_saida', fim);

  if (error) {
    throw error;
  }

  return count || 0;
}

async function carregarMovimentacoesRecentes() {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, status, veiculos(placa)')
    .order('data_hora_entrada', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return data || [];
}

function renderizarRecentes(movimentacoes) {
  if (movimentacoes.length === 0) {
    renderizarMensagemTabela(recentesTbody, 'Nenhuma movimentação cadastrada.', 3);
    return;
  }

  recentesTbody.innerHTML = movimentacoes
    .map((movimentacao) => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
        <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(movimentacao.veiculos?.placa || '-')}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${formatarDataHora(movimentacao.data_hora_entrada)}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${movimentacao.status === 'aberta' ? 'Aberta' : 'Encerrada'}</td>
      </tr>
    `)
    .join('');
}

function intervaloHoje() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  };
}

iniciarPagina();
