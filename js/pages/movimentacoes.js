import '../main.js';
import { supabase } from '../core/supabase.js';
import { confirmar, erro, sucesso, aviso } from '../ui/alerts.js';
import { formatarDataHora, inicializarLayout } from '../ui/layout.js';

const entradaForm = document.querySelector('[data-form-entrada]');
const saidaForm = document.querySelector('[data-form-saida]');
const resultadoEntrada = document.querySelector('[data-resultado-entrada]');
const resultadoSaida = document.querySelector('[data-resultado-saida]');

function normalizarPlaca(placa) {
  return placa.trim().toUpperCase().replace(/\s/g, '');
}

async function buscarVeiculoAtivo(placa) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, ativo, tipo_cliente, cor, clientes(nome), marcas(nome), modelos(nome)')
    .eq('placa', placa)
    .single();

  if (error) throw error;
  if (!data.ativo) throw new Error('O veículo encontrado está inativo.');
  return data;
}

async function buscarMovimentacaoAberta(veiculoId) {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, data_hora_entrada, status, veiculos(placa, clientes(nome), marcas(nome), modelos(nome))')
    .eq('veiculo_id', veiculoId)
    .eq('status', 'aberta')
    .maybeSingle();

  if (error) throw error;
  return data;
}

function renderVeiculo(container, veiculo, extra = '') {
  container.innerHTML = `<div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
    <p class="font-semibold text-slate-900 dark:text-slate-100">${veiculo.placa} - ${veiculo.marcas?.nome || '-'} ${veiculo.modelos?.nome || ''}</p>
    <p class="mt-1 text-slate-600 dark:text-slate-300">Cliente: ${veiculo.clientes?.nome || 'Avulso'} · Tipo: ${veiculo.tipo_cliente || '-'}</p>
    ${extra}
  </div>`;
}

entradaForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const placa = normalizarPlaca(new FormData(entradaForm).get('placa') || '');

  if (!placa) {
    await aviso('Placa obrigatória', 'Informe a placa do veículo para registrar a entrada.');
    return;
  }

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    const aberta = await buscarMovimentacaoAberta(veiculo.id);
    if (aberta) throw new Error('Este veículo já possui uma movimentação aberta.');

    renderVeiculo(resultadoEntrada, veiculo);
    const resposta = await confirmar({ titulo: 'Confirmar entrada?', texto: `Registrar entrada do veículo ${placa}?`, confirmText: 'Registrar entrada' });
    if (!resposta.isConfirmed) return;

    const { error } = await supabase.from('movimentacoes').insert({
      veiculo_id: veiculo.id,
      data_hora_entrada: new Date().toISOString(),
      status: 'aberta',
    });

    if (error) throw error;
    entradaForm.reset();
    resultadoEntrada.innerHTML = '';
    await sucesso('Entrada registrada', 'A movimentação foi aberta com sucesso.');
  } catch (error) {
    erro('Erro ao registrar entrada', error.message);
  }
});

saidaForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dados = new FormData(saidaForm);
  const placa = normalizarPlaca(dados.get('placa') || '');
  const valor = Number(dados.get('valor_cobrado'));

  if (!placa) {
    await aviso('Placa obrigatória', 'Informe a placa do veículo para registrar a saída.');
    return;
  }

  if (Number.isNaN(valor) || valor < 0) {
    await aviso('Valor inválido', 'Informe um valor cobrado válido.');
    return;
  }

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    const aberta = await buscarMovimentacaoAberta(veiculo.id);
    if (!aberta) throw new Error('Não existe movimentação aberta para este veículo.');

    renderVeiculo(resultadoSaida, veiculo, `<p class="mt-1 text-slate-600 dark:text-slate-300">Entrada: ${formatarDataHora(aberta.data_hora_entrada)}</p>`);
    const resposta = await confirmar({ titulo: 'Confirmar saída?', texto: `Encerrar movimentação do veículo ${placa}?`, confirmText: 'Registrar saída' });
    if (!resposta.isConfirmed) return;

    const { error } = await supabase
      .from('movimentacoes')
      .update({
        data_hora_saida: new Date().toISOString(),
        valor_cobrado: valor,
        status: 'encerrada',
      })
      .eq('id', aberta.id);

    if (error) throw error;
    saidaForm.reset();
    resultadoSaida.innerHTML = '';
    await sucesso('Saída registrada', 'A movimentação foi encerrada com sucesso.');
  } catch (error) {
    erro('Erro ao registrar saída', error.message);
  }
});

document.addEventListener('DOMContentLoaded', () => inicializarLayout());
