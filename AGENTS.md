# AGENTS.md

Este arquivo define as instruções permanentes para agentes de IA que forem trabalhar neste projeto. Ele deve ser lido como um contrato de desenvolvimento: descreve regras obrigatórias, padrões técnicos e comportamentos que não podem ser ignorados durante alterações no código.

Use este arquivo para orientar a IA sobre **como trabalhar** no projeto.

## Papel do agente

- Atuar como apoio técnico no desenvolvimento da aplicação didática de controle de estacionamento.
- Preservar as regras de negócio já definidas.
- Manter o projeto compatível com HTML, Tailwind CSS, JavaScript Vanilla, Vite, SweetAlert2 e Supabase.
- Evitar alterações fora do escopo solicitado.
- Nunca substituir regras de negócio por dados fixos ou placeholders.

## Regras permanentes de movimentações

- As páginas `pages/movimentacoes.html`, `pages/patio.html` e `pages/historico.html` não podem ficar como placeholders.
- `pages/movimentacoes.html` deve usar `js/pages/movimentacoes.js`.
- `pages/patio.html` deve usar `js/pages/patio.js`.
- `pages/historico.html` deve usar `js/pages/historico.js`.
- Entrada de veículo deve buscar a placa em `veiculos`, exigir veículo ativo e impedir nova entrada quando já existir movimentação `aberta` para o veículo.
- Saída de veículo deve exigir uma movimentação `aberta`; ao confirmar, preencher `data_hora_saida`, `valor_cobrado` e alterar `status` para `encerrada`.
- Todas as ações de entrada e saída devem validar dados no front-end, confirmar com SweetAlert2 e exibir erros reais do Supabase.
- A consulta do pátio deve listar somente movimentações com `status = 'aberta'`, trazendo placa, marca, modelo, cliente, data/hora de entrada e tipo do veículo.
- O histórico deve listar movimentações abertas e encerradas, com filtros por placa, período e status.
- Pátio e histórico devem usar paginação com `.range(inicio, fim)` e `count: 'exact'`.
- As regras de negócio de movimentações devem ser reforçadas no banco quando possível, especialmente a restrição de apenas uma movimentação aberta por veículo.

## Regras permanentes do dashboard

- `pages/dashboard.html` não pode exibir dados fixos quando houver Supabase disponível.
- O dashboard deve carregar dados reais de `clientes` e `movimentacoes` via `js/pages/dashboard.js`.
- Cards de resumo devem ter cores distintas, Heroicons e valores vindos do banco.
- Indicadores mínimos:
  - Veículos no pátio: contar `movimentacoes.status = 'aberta'`.
  - Mensalistas ativos: contar `clientes.ativo = true`.
  - Entradas hoje: contar `movimentacoes.data_hora_entrada` no intervalo do dia.
  - Saídas hoje: contar `movimentacoes.data_hora_saida` no intervalo do dia.
- Movimentações recentes devem listar registros reais, no máximo 5, ordenados por `data_hora_entrada` decrescente.
- Falhas de carregamento devem usar SweetAlert2 e não podem falhar silenciosamente.

## Regras permanentes de interface

- Todo texto visível da interface deve usar português do Brasil com acentuação correta.
- Não deixar grafias sem acento como `veiculos`, `historico`, `patio`, `acoes`, `situacao`, `usuario`, `pagina` ou `proxima` quando forem texto exibido ao usuário.
- Nomes técnicos, colunas do banco, variáveis, rotas, arquivos e atributos `data-*` podem permanecer sem acento.
- A interface deve usar Heroicons nos menus, botões de ação e controles principais.
- Em HTML, preferir `data-heroicon="nome-do-icone"` e renderizar pelo módulo `js/ui/icons.js`.
- Em conteúdo gerado por JavaScript, usar a função `heroicon()` do módulo `js/ui/icons.js`.
- Evitar símbolos soltos como `☰` ou `◐` quando houver ícone Heroicons equivalente.
- Todas as mensagens de sucesso, erro, confirmação e alerta devem utilizar SweetAlert2.
- Não utilizar `alert()`, `confirm()` ou `prompt()` nativos do JavaScript.

## Regras de desenvolvimento

- Não utilizar frameworks como React, Vue ou Angular.
- Utilizar apenas HTML, Tailwind CSS e JavaScript Vanilla.
- Utilizar Supabase para autenticação e banco de dados.
- Organizar o código em módulos.
- Utilizar `async/await`.
- Implementar tratamento de erros com `try/catch`.
- Validar dados no front-end antes de enviar ao Supabase.
- Configurar Row Level Security (RLS).
- Utilizar Vite como ferramenta de build e servidor de desenvolvimento.
- Variáveis de ambiente devem ser acessadas via `import.meta.env`.
- Não hardcodear URLs e chaves do Supabase.
- Garantir compatibilidade com hospedagem estática e GitHub Pages.
- Configurar corretamente a opção `base` do Vite.
- Evitar dependências que exijam servidor próprio.

## Autenticação

O sistema deve utilizar a autenticação nativa do Supabase.

### Regras obrigatórias

- Implementar tela de login com e-mail e senha.
- Implementar funcionalidade de logout.
- Verificar sessão ativa ao carregar páginas protegidas.
- Redirecionar usuários não autenticados para `login.html`.
- Redirecionar o usuário para a área correta de acordo com o perfil.
- Exibir o nome do usuário autenticado no cabeçalho.
- Permitir recuperação futura da senha pelo Supabase.

### Funções mínimas

- `login(email, senha)`
- `logout()`
- `getUsuarioAtual()`
- `verificarAutenticacao()`
- `redirecionarPorPerfil()`

## Supabase RLS e GRANT

- Sempre que criar ou alterar tabelas protegidas por RLS no Supabase, também configurar os `GRANTs` necessários para os papéis usados pelo front-end.
- Para tabelas acessadas após login, incluir pelo menos `grant usage on schema public to authenticated;` e o `grant` adequado na tabela (`select`, `insert`, `update` ou `all`).
- Não considerar uma policy RLS suficiente por si só: o usuário precisa ter permissão SQL na tabela e a policy decide quais linhas ele pode acessar.
- Se aparecer erro como `permission denied for table ...`, verificar primeiro se existem `GRANTs` para `authenticated`.

Exemplos de grants mínimos do projeto:

```sql
grant usage on schema public to authenticated;
grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;
```

Se novas tabelas forem criadas, adicionar o `grant` correspondente e uma policy RLS adequada antes de usar no front-end.

## Padrão obrigatório para CRUDs

Todos os cadastros administrativos devem ser implementados como CRUD completo:

- Listar registros com paginação.
- Criar novos registros.
- Editar registros existentes.
- Inativar registros em vez de excluir fisicamente, quando a entidade possuir campo `ativo`.
- Reativar registros inativos quando fizer sentido para o cadastro.
- Validar campos obrigatórios antes de enviar ao Supabase.
- Exibir mensagens de sucesso, erro, confirmação e alerta com SweetAlert2.
- Mostrar erros reais retornados pelo Supabase ao usuário, sem falhar silenciosamente.
- Usar `async/await` e `try/catch` em todas as operações.
- Atualizar a tabela/listagem após criar, editar, inativar ou reativar.

## Paginação dos cadastros

- Toda listagem de cadastro deve usar paginação no Supabase com `.range(inicio, fim)`.
- Usar `select(..., { count: 'exact' })` quando precisar calcular total de páginas.
- Exibir controles de página anterior/próxima e informação da página atual.
- Definir um tamanho de página padrão, preferencialmente 10 registros por página.
- Manter busca/filtros integrados com a paginação quando existirem.
