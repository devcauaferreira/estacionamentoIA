import '../main.js';
import { supabase } from '../core/supabase.js';
import { erro } from '../ui/alerts.js';
import { formatarDataHora, inicializarLayout } from '../ui/layout.js';

const corpoTabela = document.querySelector('[data-patio-lista]');
const paginaInfo = document.querySelector('[data-pagina-info]');
const anterior = document.querySelector('[data-pagina-anterior]');
const proxima = document.querySelector('[data-pagina-proxima]');
const tamanhoPagina = 10;
let paginaAtual = 1;
let totalPaginas = 1;

async function carregarPatio() {
  const inicio = (paginaAtual - 1) * tamanhoPagina;
  const fim = inicio + tamanhoPagina - 1;
  const { data, error, count } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, veiculos(placa, tipo_cliente, clientes(nome), marcas(nome), modelos(nome))', { count: 'exact' })
    .eq('status', 'aberta')
    .order('data_hora_entrada', { ascending: true })
    .range(inicio, fim);

  if (error) throw error;
  totalPaginas = Math.max(1, Math.ceil((count || 0) / tamanhoPagina));

  corpoTabela.innerHTML = data.length
    ? data.map((item) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
      <td class="table-cell font-semibold">${item.veiculos?.placa || '-'}</td>
      <td class="table-cell">${item.veiculos?.marcas?.nome || '-'} ${item.veiculos?.modelos?.nome || ''}</td>
      <td class="table-cell">${item.veiculos?.clientes?.nome || 'Avulso'}</td>
      <td class="table-cell">${item.veiculos?.tipo_cliente || '-'}</td>
      <td class="table-cell">${formatarDataHora(item.data_hora_entrada)}</td>
    </tr>`).join('')
    : '<tr><td class="table-cell text-center text-slate-500" colspan="5">Não há veículos no pátio.</td></tr>';

  paginaInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  anterior.disabled = paginaAtual <= 1;
  proxima.disabled = paginaAtual >= totalPaginas;
}

async function tentarCarregar() {
  try {
    await carregarPatio();
  } catch (error) {
    erro('Erro ao carregar pátio', error.message);
  }
}

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
