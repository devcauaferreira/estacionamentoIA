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
import { formatarDataHora } from '../utils/formatters.js';

aplicarTemaInicial();

const tbody = document.querySelector('[data-patio-tbody]');
const pagination = document.querySelector('[data-patio-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarPaginacao();
    await carregarPatio();
  } catch (error) {
    await exibirErro('Não foi possível carregar o pátio', normalizarMensagemErro(error));
  }
}

function configurarPaginacao() {
  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarPatio();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarPatio();
    }
  });
}

async function carregarPatio() {
  const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
  const { data, error, count } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, veiculos(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))', { count: 'exact' })
    .eq('status', 'aberta')
    .order('data_hora_entrada', { ascending: false })
    .range(inicio, fim);

  if (error) {
    await exibirErro('Erro ao carregar pátio', normalizarMensagemErro(error));
    renderizarMensagemTabela(tbody, 'Não foi possível carregar os veículos no pátio.', 5);
    return;
  }

  totalPaginas = calcularTotalPaginas(count || 0);

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
    await carregarPatio();
    return;
  }

  renderizarPatio(data || []);
  renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
}

function renderizarPatio(movimentacoes) {
  if (movimentacoes.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhum veículo no pátio.', 5);
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
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${veiculo.tipo_cliente === 'mensalista' ? 'Mensalista' : 'Avulso'}</td>
        </tr>
      `;
    })
    .join('');
}

iniciarPagina();
