import '../main.js';
import { supabase } from '../core/supabase.js';
import { erro } from '../ui/alerts.js';
import { formatarDataHora, formatarMoeda, inicializarLayout } from '../ui/layout.js';

const form = document.querySelector('[data-filtros-historico]');
const corpoTabela = document.querySelector('[data-historico-lista]');
const paginaInfo = document.querySelector('[data-pagina-info]');
const anterior = document.querySelector('[data-pagina-anterior]');
const proxima = document.querySelector('[data-pagina-proxima]');
const tamanhoPagina = 10;
let paginaAtual = 1;
let totalPaginas = 1;

function filtros() {
  const dados = new FormData(form);
  return {
    placa: String(dados.get('placa') || '').trim().toUpperCase(),
    inicio: dados.get('inicio'),
    fim: dados.get('fim'),
    status: dados.get('status'),
  };
}

async function carregarHistorico() {
  const inicioRange = (paginaAtual - 1) * tamanhoPagina;
  const fimRange = inicioRange + tamanhoPagina - 1;
  const filtro = filtros();

  const veiculoSelect = filtro.placa ? 'veiculos!inner' : 'veiculos';
  let query = supabase
    .from('movimentacoes')
    .select(`id, data_hora_entrada, data_hora_saida, valor_cobrado, status, ${veiculoSelect}(placa, tipo_cliente, clientes(nome), marcas(nome), modelos(nome))`, { count: 'exact' });

  if (filtro.status) query = query.eq('status', filtro.status);
  if (filtro.inicio) query = query.gte('data_hora_entrada', `${filtro.inicio}T00:00:00`);
  if (filtro.fim) query = query.lte('data_hora_entrada', `${filtro.fim}T23:59:59`);
  if (filtro.placa) query = query.ilike('veiculos.placa', `%${filtro.placa}%`);

  const { data, error, count } = await query.order('data_hora_entrada', { ascending: false }).range(inicioRange, fimRange);
  if (error) throw error;

  totalPaginas = Math.max(1, Math.ceil((count || 0) / tamanhoPagina));
  corpoTabela.innerHTML = data.length
    ? data.map((item) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
      <td class="table-cell font-semibold">${item.veiculos?.placa || '-'}</td>
      <td class="table-cell">${item.veiculos?.marcas?.nome || '-'} ${item.veiculos?.modelos?.nome || ''}</td>
      <td class="table-cell">${item.veiculos?.clientes?.nome || 'Avulso'}</td>
      <td class="table-cell">${formatarDataHora(item.data_hora_entrada)}</td>
      <td class="table-cell">${formatarDataHora(item.data_hora_saida)}</td>
      <td class="table-cell">${formatarMoeda(item.valor_cobrado)}</td>
      <td class="table-cell"><span class="rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'aberta' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">${item.status === 'aberta' ? 'Aberta' : 'Encerrada'}</span></td>
    </tr>`).join('')
    : '<tr><td class="table-cell text-center text-slate-500" colspan="7">Não há movimentações para os filtros atuais.</td></tr>';

  paginaInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  anterior.disabled = paginaAtual <= 1;
  proxima.disabled = paginaAtual >= totalPaginas;
}

async function tentarCarregar() {
  try {
    await carregarHistorico();
  } catch (error) {
    erro('Erro ao carregar histórico', error.message);
  }
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  paginaAtual = 1;
  tentarCarregar();
});

form?.addEventListener('reset', () => {
  setTimeout(() => {
    paginaAtual = 1;
    tentarCarregar();
  });
});

anterior?.addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual -= 1;
    tentarCarregar();
  }
});

proxima?.addEventListener('click', () => {
  if (paginaAtual < totalPaginas) {
    paginaAtual += 1;
    tentarCarregar();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await inicializarLayout();
  await tentarCarregar();
});
