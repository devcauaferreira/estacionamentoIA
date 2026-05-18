# DESIGN_SYSTEM.md

Este arquivo documenta o padrão visual da aplicação. Ele deve ser usado pelos alunos e por agentes de IA para manter consistência entre telas, componentes, cores, ícones, estados e mensagens.

Use este arquivo para orientar **como a interface deve ser construída**.

## Princípios de interface

- A interface deve ser simples, didática e adequada para um sistema administrativo.
- Textos visíveis devem estar em português do Brasil com acentuação correta.
- Telas de cadastro e consulta devem priorizar clareza, leitura rápida e ações diretas.
- O sistema deve manter compatibilidade com tema claro e escuro.
- Controles principais, menus e ações devem usar Heroicons.
- Mensagens de feedback devem usar SweetAlert2.

## Paleta de cores

### Cores principais

- Primary: `#a855f7`
- Primary Hover: `#6b21a8`
- Secondary: `#64748B`
- Success: `#16A34A`
- Warning: `#F59E0B`
- Danger: `#DC2626`

### Light Mode

- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Text Primary: `#0F172A`
- Text Secondary: `#475569`
- Border: `#E2E8F0`

### Dark Mode

- Background: `#0F172A`
- Surface: `#1E293B`
- Text Primary: `#F8FAFC`
- Text Secondary: `#CBD5E1`
- Border: `#334155`

## Tipografia

- Fonte principal: Inter.
- Títulos: `font-bold`.
- Texto padrão: `text-sm` ou `text-base`.
- Labels: `text-sm font-medium`.
- Evitar textos longos dentro de botões, cards pequenos ou colunas estreitas.

## Layout padrão

- Sidebar fixa com 256px em telas maiores.
- Sidebar recolhível em telas pequenas.
- Header superior em páginas autenticadas.
- Conteúdo central com padding de 24px.
- Largura máxima de formulários: `max-w-3xl`.
- Telas administrativas devem evitar blocos decorativos sem função.

## Componentes

### Botão primário

Use para a ação principal da tela ou do formulário.

```text
bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
```

### Botão secundário

Use para ações neutras, como cancelar, voltar ou limpar filtros.

```text
bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg
```

### Botão de perigo

Use para inativar, excluir logicamente ou confirmar ações críticas.

```text
bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg
```

### Inputs e selects

```text
border border-slate-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500
```

### Cards

```text
bg-white dark:bg-slate-800 rounded-xl shadow p-6
```

Cards devem ser usados para resumos, indicadores e agrupamentos reais de conteúdo, não como decoração.

## Ícones

- A biblioteca padrão é Heroicons.
- Em HTML, usar `data-heroicon="nome-do-icone"`.
- Em JavaScript, usar a função `heroicon()` do módulo `js/ui/icons.js`.
- Menus, botões de ação e controles principais devem ter ícones.
- Evitar símbolos soltos quando houver ícone equivalente.

## Tabelas

- Cabeçalho com fundo cinza claro no tema claro e contraste equivalente no tema escuro.
- Linhas com hover.
- Zebra striping é opcional.
- Ações devem ficar em coluna própria.
- Paginação deve informar página atual, total de páginas e botões Anterior/Próxima.
- Estados vazios devem explicar que não há registros para os filtros atuais.

## Formulários

- Campos obrigatórios devem ser validados no front-end antes do envio ao Supabase.
- Labels devem ser claros e próximos dos campos.
- Erros devem ser exibidos com SweetAlert2, incluindo a mensagem real retornada pelo Supabase quando houver.
- Após salvar, atualizar a listagem relacionada.

## Feedback ao usuário

Todas as mensagens de:

- Sucesso.
- Erro.
- Confirmação.
- Aviso.

devem utilizar SweetAlert2 com estilo compatível com tema claro e escuro.

Não utilizar `alert()`, `confirm()` ou `prompt()` nativos.

## Tela de login

Elementos obrigatórios:

- Logo do sistema.
- Campo de e-mail.
- Campo de senha.
- Botão "Entrar".
- Link "Esqueci minha senha" quando a recuperação for implementada.
- Mensagens de erro com SweetAlert2.

## Cabeçalho autenticado

Deve exibir:

- Nome do usuário.
- Tipo de perfil.
- Botão "Sair".

## Logotipo

Utilize o logotipo disponível na pasta `assets`.
