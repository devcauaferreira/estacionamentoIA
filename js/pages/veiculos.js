import '../main.js';
import { supabase } from '../core/supabase.js';
import { aviso, erro, sucesso } from '../ui/alerts.js';
import { inicializarLayout } from '../ui/layout.js';

const form = document.querySelector('[data-form-veiculo]');
const clienteSelect = document.querySelector('[data-cliente-select]');
const clienteGroup = document.querySelector('[data-cliente-group]');
const tipoSelect = document.querySelector('#veiculo-tipo');
const veiculosList = document.querySelector('[data-veiculos-list]');

function atualizarClienteGroup() {
  const tipo = tipoSelect.value;
  clienteGroup.classList.toggle('hidden', tipo !== 'mensalista');
}

async function carregarClientes() {
  const { data, error } = await supabase.from('clientes').select('id, nome').eq('ativo', true).order('nome');
  if (error) throw error;

  clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>' + data.map((cliente) => `<option value="${cliente.id}">${cliente.nome}</option>`).join('');
}

async function carregarVeiculos() {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, cor, tipo_cliente, ativo, marcas(nome), modelos(nome), clientes(nome)')
    .order('placa');

  if (error) throw error;

  veiculosList.innerHTML = data.length
    ? data.map((item) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
      <td class="table-cell font-semibold">${item.placa}</td>
      <td class="table-cell">${item.marcas?.nome || '-'} ${item.modelos?.nome || ''}</td>
      <td class="table-cell">${item.clientes?.nome || 'Avulso'}</td>
      <td class="table-cell">${item.tipo_cliente === 'mensalista' ? 'Mensalista' : 'Avulso'}</td>
      <td class="table-cell">${item.ativo ? 'Sim' : 'Não'}</td>
    </tr>`).join('')
    : '<tr><td class="table-cell text-center text-slate-500" colspan="5">Nenhum veículo cadastrado.</td></tr>';
}

async function buscarOuCriarMarca(nome) {
  const normalized = nome.trim();
  const { data, error } = await supabase.from('marcas').select('id').ilike('nome', normalized).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertError } = await supabase.from('marcas').insert({ nome: normalized }).select('id').single();
  if (insertError) throw insertError;
  return inserted;
}

async function buscarOuCriarModelo(marcaId, nome) {
  const normalized = nome.trim();
  const { data, error } = await supabase
    .from('modelos')
    .select('id')
    .eq('marca_id', marcaId)
    .ilike('nome', normalized)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertError } = await supabase
    .from('modelos')
    .insert({ marca_id: marcaId, nome: normalized })
    .select('id')
    .single();
  if (insertError) throw insertError;
  return inserted;
}

async function criarVeiculo(event) {
  event.preventDefault();
  const dados = new FormData(form);
  const placa = String(dados.get('placa') || '').trim().toUpperCase();
  const marca = String(dados.get('marca') || '').trim();
  const modelo = String(dados.get('modelo') || '').trim();
  const cor = String(dados.get('cor') || '').trim();
  const tipoCliente = String(dados.get('tipo_cliente') || 'avulso');
  const clienteId = String(dados.get('cliente_id') || '').trim();

  if (!placa || !marca || !modelo) {
    await aviso('Dados obrigatórios', 'Informe a placa, marca e modelo do veículo.');
    return;
  }

  if (tipoCliente === 'mensalista' && !clienteId) {
    await aviso('Cliente obrigatório', 'Selecione um cliente para veículos mensalistas.');
    return;
  }

  try {
    const marcaRegistro = await buscarOuCriarMarca(marca);
    const modeloRegistro = await buscarOuCriarModelo(marcaRegistro.id, modelo);

    const { error } = await supabase.from('veiculos').insert({
      placa,
      cor,
      marca_id: marcaRegistro.id,
      modelo_id: modeloRegistro.id,
      tipo_cliente: tipoCliente,
      cliente_id: tipoCliente === 'mensalista' ? clienteId : null,
      ativo: true,
    });

    if (error) throw error;

    form.reset();
    atualizarClienteGroup();
    await carregarVeiculos();
    await sucesso('Veículo cadastrado', 'O veículo foi registrado com sucesso.');
  } catch (error) {
    erro('Erro ao cadastrar veículo', error.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await inicializarLayout();
  try {
    await carregarClientes();
    await carregarVeiculos();
    atualizarClienteGroup();
    form?.addEventListener('submit', criarVeiculo);
    tipoSelect?.addEventListener('change', atualizarClienteGroup);
  } catch (error) {
    erro('Erro ao carregar página de veículos', error.message);
  }
});
