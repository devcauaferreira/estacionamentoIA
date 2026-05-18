import { supabase } from '../config/supabase.js';
import { aplicarTemaInicial } from '../ui/theme.js';
import { verificarAutenticacao } from '../services/auth.js';
import { configurarLayout } from '../ui/layout.js';
import { confirmarAcao, exibirErro, exibirSucesso, exibirAviso } from '../ui/alerts.js';
import { heroicon } from '../ui/icons.js';
import { normalizarMensagemErro } from '../utils/crud.js';
import { formatarMoeda, normalizarPlaca } from '../utils/formatters.js';

aplicarTemaInicial();

const entradaForm = document.querySelector('[data-entrada-form]');
const entradaPlaca = document.querySelector('[data-entrada-placa]');
const entradaSubmit = document.querySelector('[data-entrada-submit]');
const saidaForm = document.querySelector('[data-saida-form]');
const saidaPlaca = document.querySelector('[data-saida-placa]');
const saidaValor = document.querySelector('[data-saida-valor]');
const saidaSubmit = document.querySelector('[data-saida-submit]');

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarEventos();
  } catch (error) {
    await exibirErro('Não foi possível carregar a página', normalizarMensagemErro(error));
  }
}

function configurarEventos() {
  entradaForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await registrarEntrada();
  });

  saidaForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await registrarSaida();
  });
}

async function registrarEntrada() {
  const placa = normalizarPlaca(entradaPlaca.value);

  if (!placa) {
    await exibirAviso('Informe a placa', 'A placa é obrigatória para registrar entrada.');
    entradaPlaca.focus();
    return;
  }

  entradaSubmit.disabled = true;
  entradaSubmit.innerHTML = `${heroicon('save')}Registrando...`;

  try {
    const veiculo = await buscarVeiculoPorPlaca(placa);

    if (!veiculo) {
      await exibirAviso('Veículo não encontrado', 'Cadastre o veículo antes de registrar a entrada.');
      return;
    }

    const movimentacaoAberta = await buscarMovimentacaoAberta(veiculo.id);

    if (movimentacaoAberta) {
      await exibirAviso('Entrada já registrada', 'Este veículo já possui uma entrada aberta.');
      return;
    }

    const resultado = await confirmarAcao('Confirmar entrada?', `Registrar entrada do veículo ${placa}?`, 'Registrar');

    if (!resultado.isConfirmed) {
      return;
    }

    const { error } = await supabase.from('movimentacoes').insert({
      veiculo_id: veiculo.id,
      status: 'aberta',
    });

    if (error) {
      throw error;
    }

    entradaForm.reset();
    await exibirSucesso('Entrada registrada com sucesso');
  } catch (error) {
    await exibirErro('Não foi possível registrar a entrada', normalizarMensagemErro(error));
  } finally {
    entradaSubmit.disabled = false;
    entradaSubmit.innerHTML = `${heroicon('save')}Confirmar entrada`;
  }
}

async function registrarSaida() {
  const placa = normalizarPlaca(saidaPlaca.value);
  const valorCobrado = saidaValor.value === '' ? null : Number(saidaValor.value);

  if (!placa) {
    await exibirAviso('Informe a placa', 'A placa é obrigatória para registrar saída.');
    saidaPlaca.focus();
    return;
  }

  if (valorCobrado !== null && valorCobrado < 0) {
    await exibirAviso('Valor inválido', 'O valor cobrado não pode ser negativo.');
    saidaValor.focus();
    return;
  }

  saidaSubmit.disabled = true;
  saidaSubmit.innerHTML = `${heroicon('save')}Registrando...`;

  try {
    const veiculo = await buscarVeiculoPorPlaca(placa);

    if (!veiculo) {
      await exibirAviso('Veículo não encontrado', 'Não há veículo cadastrado com essa placa.');
      return;
    }

    const movimentacaoAberta = await buscarMovimentacaoAberta(veiculo.id);

    if (!movimentacaoAberta) {
      await exibirAviso('Sem entrada aberta', 'A saída só pode ser registrada se houver uma entrada aberta.');
      return;
    }

    const valorTexto = valorCobrado === null ? 'sem valor cobrado' : `com valor ${formatarMoeda(valorCobrado)}`;
    const resultado = await confirmarAcao('Confirmar saída?', `Encerrar movimentação do veículo ${placa} ${valorTexto}?`, 'Registrar saída');

    if (!resultado.isConfirmed) {
      return;
    }

    const { error } = await supabase
      .from('movimentacoes')
      .update({
        data_hora_saida: new Date().toISOString(),
        valor_cobrado: valorCobrado,
        status: 'encerrada',
      })
      .eq('id', movimentacaoAberta.id);

    if (error) {
      throw error;
    }

    saidaForm.reset();
    await exibirSucesso('Saída registrada com sucesso');
  } catch (error) {
    await exibirErro('Não foi possível registrar a saída', normalizarMensagemErro(error));
  } finally {
    saidaSubmit.disabled = false;
    saidaSubmit.innerHTML = `${heroicon('save')}Confirmar saída`;
  }
}

async function buscarVeiculoPorPlaca(placa) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, ativo')
    .eq('placa', placa)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.ativo) {
    return null;
  }

  return data;
}

async function buscarMovimentacaoAberta(veiculoId) {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, veiculo_id')
    .eq('veiculo_id', veiculoId)
    .eq('status', 'aberta')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

iniciarPagina();
