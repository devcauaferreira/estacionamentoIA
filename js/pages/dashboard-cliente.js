import '../main.js';
import { supabase } from '../core/supabase.js';
import { getPerfilAtual } from '../core/auth.js';
import { erro } from '../ui/alerts.js';
import { formatarDataHora, formatarMoeda, inicializarLayout } from '../ui/layout.js';

const veiculosLista = document.querySelector('[data-cliente-veiculos]');
const historicoLista = document.querySelector('[data-cliente-historico]');

async function carregarCliente() {
  const perfil = await getPerfilAtual();
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('user_id', perfil.user_id)
    .single();

  if (clienteError) throw clienteError;

  const { data: veiculos, error: veiculosError } = await supabase
    .from('veiculos')
    .select('id, placa, cor, ativo, marcas(nome), modelos(nome)')
    .eq('cliente_id', cliente.id)
    .order('placa');

  if (veiculosError) throw veiculosError;

  veiculosLista.innerHTML = veiculos.length
    ? veiculos.map((veiculo) => `<article class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <p class="font-semibold">${veiculo.placa} - ${veiculo.marcas?.nome || '-'} ${veiculo.modelos?.nome || ''}</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Cor: ${veiculo.cor || '-'} · ${veiculo.ativo ? 'Ativo' : 'Inativo'}</p>
    </article>`).join('')
    : '<p class="text-sm text-slate-500">Nenhum veículo encontrado.</p>';

  const ids = veiculos.map((veiculo) => veiculo.id);
  if (!ids.length) {
    historicoLista.innerHTML = '<p class="text-sm text-slate-500">Nenhuma movimentação encontrada.</p>';
    return;
  }

  const { data: historico, error: historicoError } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos(placa)')
    .in('veiculo_id', ids)
    .order('data_hora_entrada', { ascending: false })
    .limit(5);

  if (historicoError) throw historicoError;

  historicoLista.innerHTML = historico.length
    ? historico.map((item) => `<article class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <p class="font-semibold">${item.veiculos?.placa || '-'} · ${item.status === 'aberta' ? 'Aberta' : 'Encerrada'}</p>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Entrada: ${formatarDataHora(item.data_hora_entrada)}</p>
      <p class="text-sm text-slate-600 dark:text-slate-300">Saída: ${formatarDataHora(item.data_hora_saida)} · Valor: ${formatarMoeda(item.valor_cobrado)}</p>
    </article>`).join('')
    : '<p class="text-sm text-slate-500">Nenhuma movimentação encontrada.</p>';
}

document.addEventListener('DOMContentLoaded', async () => {
  await inicializarLayout({ area: 'cliente' });
  try {
    await carregarCliente();
  } catch (error) {
    erro('Erro ao carregar área do cliente', error.message);
  }
});
