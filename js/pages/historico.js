import { supabase } from '../config/supabase.js';
import { aplicarTemaInicial } from '../ui/theme.js';
import { verificarAutenticacao } from '../services/auth.js';
import { configurarLayout } from '../ui/layout.js';
import { exibirErro } from '../ui/alerts.js';
import {
  calcularIntervaloPagina,
  calcularTotalPaginas,
  escaparHtml,
  normalizarMensagemErro,
  renderizarMensagemTabela,
  renderizarPaginacao,
} from '../utils/crud.js';
import { dataFinalExclusiva, formatarDataHora, formatarMoeda, normalizarPlaca } from '../utils/formatters.js';

aplicarTemaInicial();

const form = document.querySelector('[data-historico-form]');
const inputPlaca = document.querySelector('[data-historico-placa]');
const inputInicio = document.querySelector('[data-historico-inicio]');
const inputFim = document.querySelector('[data-historico-fim]');
const selectStatus = document.querySelector('[data-historico-status]');
const tbody = document.querySelector('[data-historico-tbody]');
const pagination = document.querySelector('[data-historico-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;
let idsVeiculosFiltrados = null;

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarEventos();
    await carregarHistorico();
  } catch (error) {
    await exibirErro('Não foi possível carregar o histórico', normalizarMensagemErro(error));
  }
}

function configurarEventos() {
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    paginaAtual = 1;
    idsVeiculosFiltrados = null;
    await carregarHistorico();
  });

  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarHistorico();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarHistorico();
    }
  });
}

async function carregarHistorico() {
  try {
    const placa = normalizarPlaca(inputPlaca.value);

    if (placa && idsVeiculosFiltrados === null) {
      idsVeiculosFiltrados = await buscarIdsVeiculosPorPlaca(placa);
    }

    if (placa && idsVeiculosFiltrados.length === 0) {
      totalPaginas = 1;
      renderizarMensagemTabela(tbody, 'Nenhuma movimentação encontrada.', 7);
      renderizarPaginacao(pagination, 1, 1, 0);
      return;
    }

    const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
    let query = supabase
      .from('movimentacoes')
      .select('id, data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))', { count: 'exact' })
      .order('data_hora_entrada', { ascending: false });

    if (selectStatus.value) {
      query = query.eq('status', selectStatus.value);
    }

    if (inputInicio.value) {
      query = query.gte('data_hora_entrada', new Date(`${inputInicio.value}T00:00:00`).toISOString());
    }

    if (inputFim.value) {
      query = query.lt('data_hora_entrada', dataFinalExclusiva(inputFim.value));
    }

    if (placa) {
      query = query.in('veiculo_id', idsVeiculosFiltrados);
    }

    const { data, error, count } = await query.range(inicio, fim);

    if (error) {
      throw error;
    }

    totalPaginas = calcularTotalPaginas(count || 0);

    if (paginaAtual > totalPaginas) {
      paginaAtual = totalPaginas;
      await carregarHistorico();
      return;
    }

    renderizarHistorico(data || []);
    renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
  } catch (error) {
    await exibirErro('Erro ao carregar histórico', normalizarMensagemErro(error));
    renderizarMensagemTabela(tbody, 'Não foi possível carregar o histórico.', 7);
  }
}

async function buscarIdsVeiculosPorPlaca(placa) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id')
    .ilike('placa', `%${placa}%`);

  if (error) {
    throw error;
  }

  return (data || []).map((veiculo) => veiculo.id);
}

function renderizarHistorico(movimentacoes) {
  if (movimentacoes.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhuma movimentação encontrada.', 7);
    return;
  }

  tbody.innerHTML = movimentacoes
    .map((movimentacao) => {
      const veiculo = movimentacao.veiculos || {};
      const nomeVeiculo = `${veiculo.marcas?.nome || '-'} ${veiculo.modelos?.nome || ''}`.trim();

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(veiculo.placa || '-')}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(nomeVeiculo)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(veiculo.clientes?.nome || '-')}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${formatarDataHora(movimentacao.data_hora_entrada)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${formatarDataHora(movimentacao.data_hora_saida)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${formatarMoeda(movimentacao.valor_cobrado)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${movimentacao.status === 'aberta' ? 'Aberta' : 'Encerrada'}</td>
        </tr>
      `;
    })
    .join('');
}

iniciarPagina();
