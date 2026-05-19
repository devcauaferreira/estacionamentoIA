import '../main.js';
import { supabase } from '../core/supabase.js';
import { erro } from '../ui/alerts.js';
import { formatarDataHora, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';

const cards = document.querySelector('[data-dashboard-cards]');
const recentes = document.querySelector('[data-recentes]');

function intervaloHoje() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

async function contar(tabela, aplicarFiltro) {
  let query = supabase.from(tabela).select('id', { count: 'exact', head: true });
  query = aplicarFiltro(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

function renderCard(label, valor, icon, classes) {
  return `<article class="rounded-xl border p-5 shadow-sm ${classes}">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium opacity-80">${label}</p>
        <p class="mt-2 text-3xl font-bold">${valor}</p>
      </div>
      <div class="rounded-lg bg-white/20 p-3">${heroicon(icon, 'h-7 w-7')}</div>
    </div>
  </article>`;
}

async function carregarDashboard() {
  const { inicio, fim } = intervaloHoje();
  const [patio, mensalistas, entradasHoje, saidasHoje] = await Promise.all([
    contar('movimentacoes', (q) => q.eq('status', 'aberta')),
    contar('clientes', (q) => q.eq('ativo', true)),
    contar('movimentacoes', (q) => q.gte('data_hora_entrada', inicio).lte('data_hora_entrada', fim)),
    contar('movimentacoes', (q) => q.gte('data_hora_saida', inicio).lte('data_hora_saida', fim)),
  ]);

  cards.innerHTML = [
    renderCard('Veículos no pátio', patio, 'truck', 'border-purple-200 bg-purple-600 text-white'),
    renderCard('Mensalistas ativos', mensalistas, 'user-group', 'border-emerald-200 bg-emerald-600 text-white'),
    renderCard('Entradas hoje', entradasHoje, 'calendar-days', 'border-amber-200 bg-amber-500 text-white'),
    renderCard('Saídas hoje', saidasHoje, 'arrow-left-on-rectangle', 'border-sky-200 bg-sky-600 text-white'),
  ].join('');

  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, data_hora_saida, status, veiculos(placa, marcas(nome), modelos(nome), clientes(nome))')
    .order('data_hora_entrada', { ascending: false })
    .limit(5);

  if (error) throw error;

  recentes.innerHTML = data.length
    ? data.map((item) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
      <td class="table-cell font-semibold">${item.veiculos?.placa || '-'}</td>
      <td class="table-cell">${item.veiculos?.marcas?.nome || '-'} ${item.veiculos?.modelos?.nome || ''}</td>
      <td class="table-cell">${item.veiculos?.clientes?.nome || 'Avulso'}</td>
      <td class="table-cell">${formatarDataHora(item.data_hora_entrada)}</td>
      <td class="table-cell"><span class="rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'aberta' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">${item.status === 'aberta' ? 'Aberta' : 'Encerrada'}</span></td>
    </tr>`).join('')
    : '<tr><td class="table-cell text-center text-slate-500" colspan="5">Não há movimentações recentes.</td></tr>';
}

document.addEventListener('DOMContentLoaded', async () => {
  await inicializarLayout();
  try {
    await carregarDashboard();
  } catch (error) {
    erro('Erro ao carregar dashboard', error.message);
  }
});
