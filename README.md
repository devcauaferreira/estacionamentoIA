# Estacionamentos

Aplicação didática para controle de estacionamento com área do proprietário e área do cliente mensalista.

## Stack

- HTML.
- Tailwind CSS.
- JavaScript Vanilla.
- Vite.
- SweetAlert2.
- Supabase.

## Como executar

```bash
npm install
npm run dev
```

Crie um arquivo `.env` com base em `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica
```

## Build

```bash
npm run build
```

O build será gerado na pasta `dist/`. O Vite está configurado com `base: '/estacionamentos/'` para publicação em GitHub Pages.

## Arquivos de orientação do projeto

Este projeto usa três arquivos de documentação para orientar o trabalho em sala de aula e também o uso de agentes de IA.

| Arquivo | Função | Quando consultar |
| --- | --- | --- |
| [AGENTS.md](AGENTS.md) | Define as regras obrigatórias para agentes de IA trabalharem no projeto. Inclui padrões de desenvolvimento, movimentações, dashboard, autenticação, CRUDs, Supabase, RLS, GRANTs, paginação e interface. | Antes de pedir alterações para uma IA ou quando houver dúvida sobre regras que não podem ser quebradas. |
| [MEMORY.md](MEMORY.md) | Registra a memória funcional do sistema: objetivo, tecnologias, perfis, entidades, autenticação, regras de negócio, dashboard, movimentações e deploy. | Durante explicações em aula, revisão do domínio do sistema ou retomada do contexto do projeto. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Documenta o padrão visual: cores, tipografia, layout, componentes, tabelas, formulários, ícones, feedback e telas principais. | Antes de criar ou alterar telas, componentes visuais e mensagens da interface. |

## Como usar esses arquivos no projeto

- Use `MEMORY.md` para explicar o domínio do estacionamento e o que o sistema precisa fazer.
- Use `DESIGN_SYSTEM.md` para padronizar a construção das telas.
- Use `AGENTS.md` para mostrar como transformar regras de projeto em instruções claras para ferramentas de IA.

Os três arquivos se complementam: `MEMORY.md` guarda o contexto, `DESIGN_SYSTEM.md` define a aparência e `AGENTS.md` impõe as regras de execução.
