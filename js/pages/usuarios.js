import '../main.js';
import { supabase } from '../core/supabase.js';
import { aviso, erro, sucesso } from '../ui/alerts.js';
import { inicializarLayout } from '../ui/layout.js';

const form = document.querySelector('[data-form-usuario]');
const usuariosList = document.querySelector('[data-usuarios-list]');

function formatarTipo(tipo) {
  return tipo === 'cliente' ? 'Cliente' : 'Proprietário';
}

function formatarData(dataIso) {
  return dataIso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dataIso)) : '-';
}

async function carregarUsuarios() {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, email, tipo_usuario, criado_em')
    .order('criado_em', { ascending: false })
    .limit(10);

  if (error) throw error;

  usuariosList.innerHTML = data.length
    ? data.map((item) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
      <td class="table-cell font-semibold">${item.nome}</td>
      <td class="table-cell">${item.email}</td>
      <td class="table-cell">${formatarTipo(item.tipo_usuario)}</td>
      <td class="table-cell">${formatarData(item.criado_em)}</td>
    </tr>`).join('')
    : '<tr><td class="table-cell text-center text-slate-500" colspan="4">Nenhum usuário encontrado.</td></tr>';
}

async function criarUsuario(event) {
  event.preventDefault();
  const dados = new FormData(form);
  const nome = String(dados.get('nome') || '').trim();
  const email = String(dados.get('email') || '').trim();
  const senha = String(dados.get('senha') || '');
  const tipoUsuario = String(dados.get('tipo_usuario') || 'proprietario');
  const telefone = String(dados.get('telefone') || '').trim();

  if (!nome || !email || !senha) {
    await aviso('Campos obrigatórios', 'Informe nome, e-mail e senha para cadastrar o usuário.');
    return;
  }

  if (senha.length < 6) {
    await aviso('Senha curta', 'A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: senha });
    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error('Não foi possível criar o usuário. Verifique as configurações de autenticação.');
    }

    const { error: perfilError } = await supabase.from('perfis').insert({
      user_id: userId,
      nome,
      email,
      tipo_usuario: tipoUsuario,
    });
    if (perfilError) throw perfilError;

    if (tipoUsuario === 'cliente') {
      const { error: clienteError } = await supabase.from('clientes').insert({
        user_id: userId,
        nome,
        email,
        telefone,
        ativo: true,
      });
      if (clienteError) throw clienteError;
    }

    form.reset();
    await carregarUsuarios();
    await sucesso('Usuário cadastrado', 'O usuário foi criado com sucesso e o cadastro foi atualizado.');
  } catch (error) {
    erro('Erro ao cadastrar usuário', error.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await inicializarLayout();
  try {
    await carregarUsuarios();
    form?.addEventListener('submit', criarUsuario);
  } catch (error) {
    erro('Erro ao carregar usuários', error.message);
  }
});
