# MEMORY.md

Este arquivo registra o contexto funcional do projeto. Ele serve como memória de referência para alunos e agentes de IA entenderem **o que o sistema é**, quais entidades existem e quais decisões já foram tomadas.

Use este arquivo para orientar **o que precisa ser lembrado sobre o projeto**.

## Contexto do projeto

Sistema didático de controle de estacionamento para uso em sala de aula.

O sistema terá duas áreas principais:

1. Área do proprietário.
2. Área do cliente mensalista.

## Tecnologias

### Front-end

- HTML.
- Tailwind CSS.
- JavaScript Vanilla.
- Vite.
- SweetAlert2.

### Back-end

- Supabase.

## Objetivo do sistema

Permitir o controle de clientes mensalistas e avulsos, incluindo:

- Cadastro de marcas.
- Cadastro de modelos.
- Cadastro de clientes.
- Cadastro de veículos.
- Registro de entrada.
- Registro de saída.
- Consulta de veículos no pátio.
- Histórico de movimentações.

## Perfis do sistema

### Proprietário

- Login.
- Dashboard administrativo.
- CRUD de marcas.
- CRUD de modelos.
- CRUD de clientes.
- CRUD de veículos.
- Controle de entrada e saída.
- Consulta ao pátio.
- Consulta ao histórico.

### Cliente mensalista

- Login.
- Consulta dos próprios veículos.
- Consulta do próprio histórico.

## Estrutura principal

```text
/estacionamentos
├── index.html
├── login.html
├── /pages
├── /cliente
├── /js
├── /css
└── /assets
```

## Autenticação

O sistema utiliza a autenticação do Supabase com e-mail e senha.

Após o login, o perfil do usuário é consultado na tabela `perfis`.

Tipos de usuário:

- `proprietario`
- `cliente`

### Fluxo

- Usuário acessa `login.html`.
- Após autenticação, consulta-se o perfil.
- Proprietário é redirecionado para `pages/dashboard.html`.
- Cliente é redirecionado para `cliente/dashboard-cliente.html`.
- O logout encerra a sessão e retorna para `login.html`.

## Entidades

### perfis

- `id`
- `user_id`
- `nome`
- `email`
- `tipo_usuario`

### marcas

- `id`
- `nome`

### modelos

- `id`
- `marca_id`
- `nome`

### clientes

- `id`
- `user_id`
- `nome`
- `telefone`
- `email`
- `ativo`

### veiculos

- `id`
- `cliente_id`
- `marca_id`
- `modelo_id`
- `placa`
- `cor`
- `tipo_cliente`
- `ativo`

### movimentacoes

- `id`
- `veiculo_id`
- `data_hora_entrada`
- `data_hora_saida`
- `valor_cobrado`
- `status`

## Regras de negócio

- Apenas o proprietário pode administrar cadastros.
- O cliente mensalista acessa somente seus próprios dados.
- Veículos avulsos não precisam estar vinculados a clientes.
- Um veículo não pode ter duas entradas em aberto.
- A saída somente pode ocorrer se houver entrada aberta.
- A saída encerra a movimentação aberta.
- Preferir inativação lógica em vez de exclusão física.

## Movimentações

- `pages/movimentacoes.html` usa `js/pages/movimentacoes.js`.
- `pages/patio.html` usa `js/pages/patio.js`.
- `pages/historico.html` usa `js/pages/historico.js`.
- Entrada: buscar placa em `veiculos`, exigir veículo ativo e bloquear se houver movimentação `aberta`.
- Saída: exigir movimentação `aberta`, preencher `data_hora_saida`, `valor_cobrado` e mudar `status` para `encerrada`.
- Pátio: listar somente movimentações `aberta`, com dados do veículo, cliente e horário de entrada.
- Histórico: listar movimentações abertas e encerradas, com filtros por placa, período e status.
- Pátio e histórico devem manter paginação com `.range(inicio, fim)` e `count: 'exact'`.
- Todas as mensagens de validação, confirmação, sucesso e erro devem usar SweetAlert2.

## Dashboard

- `pages/dashboard.html` usa `js/pages/dashboard.js` para carregar dados reais.
- Cards do dashboard devem ser coloridos e usar Heroicons.
- Indicadores do dashboard:
  - Veículos no pátio: contar `movimentacoes.status = 'aberta'`.
  - Mensalistas ativos: contar `clientes.ativo = true`.
  - Entradas hoje: contar `movimentacoes.data_hora_entrada` no intervalo do dia.
  - Saídas hoje: contar `movimentacoes.data_hora_saida` no intervalo do dia.
- Movimentações recentes: buscar até 5 registros em `movimentacoes`, ordenados por `data_hora_entrada` decrescente.
- Erros de carregamento do dashboard devem aparecer com SweetAlert2.

## Supabase RLS e GRANT

RLS não substitui `GRANT`. Toda tabela usada pelo front-end precisa ter permissão SQL para o papel `authenticated`; depois a policy RLS define quais linhas o usuário pode acessar.

Sempre manter estes grants no schema ou em script de correção:

```sql
grant usage on schema public to authenticated;

grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;

grant execute on function public.usuario_e_proprietario() to authenticated;
```

Se surgir `permission denied for table ...`, conferir os grants antes de alterar o front-end.

## Deploy

O projeto será publicado no GitHub Pages.

### Requisitos

- O build deve ser gerado na pasta `dist/`.
- Todos os caminhos devem ser compatíveis com hospedagem estática.
- O projeto deve utilizar `import.meta.env`.
- O `vite.config.js` deve definir corretamente a propriedade `base`.
- A dependência `gh-pages` pode ser usada para publicação quando necessário.
