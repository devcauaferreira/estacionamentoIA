create extension if not exists "pgcrypto";

create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo_usuario text not null check (tipo_usuario in ('proprietario', 'cliente')),
  criado_em timestamptz not null default now()
);

create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  criado_em timestamptz not null default now()
);

create table if not exists public.modelos (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references public.marcas(id) on delete restrict,
  nome text not null,
  criado_em timestamptz not null default now(),
  unique (marca_id, nome)
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  telefone text,
  email text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  marca_id uuid not null references public.marcas(id) on delete restrict,
  modelo_id uuid not null references public.modelos(id) on delete restrict,
  placa text not null unique,
  cor text,
  tipo_cliente text not null check (tipo_cliente in ('mensalista', 'avulso')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.movimentacoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  data_hora_entrada timestamptz not null default now(),
  data_hora_saida timestamptz,
  valor_cobrado numeric(10, 2),
  status text not null default 'aberta' check (status in ('aberta', 'encerrada')),
  criado_em timestamptz not null default now(),
  constraint saida_obrigatoria_quando_encerrada check (
    (status = 'aberta' and data_hora_saida is null)
    or
    (status = 'encerrada' and data_hora_saida is not null)
  )
);

create unique index if not exists movimentacoes_um_aberto_por_veiculo
  on public.movimentacoes (veiculo_id)
  where status = 'aberta';

create or replace function public.usuario_e_proprietario()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfis
    where user_id = auth.uid()
      and tipo_usuario = 'proprietario'
  );
$$;

alter table public.perfis enable row level security;
alter table public.marcas enable row level security;
alter table public.modelos enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.movimentacoes enable row level security;

drop policy if exists "perfis autenticados leem proprio perfil" on public.perfis;
create policy "perfis autenticados leem proprio perfil"
on public.perfis for select
to authenticated
using (user_id = auth.uid() or public.usuario_e_proprietario());

drop policy if exists "proprietarios gerenciam marcas" on public.marcas;
create policy "proprietarios gerenciam marcas"
on public.marcas for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

drop policy if exists "proprietarios gerenciam modelos" on public.modelos;
create policy "proprietarios gerenciam modelos"
on public.modelos for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

drop policy if exists "proprietarios gerenciam clientes" on public.clientes;
create policy "proprietarios gerenciam clientes"
on public.clientes for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

drop policy if exists "clientes leem proprio cadastro" on public.clientes;
create policy "clientes leem proprio cadastro"
on public.clientes for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "proprietarios gerenciam veiculos" on public.veiculos;
create policy "proprietarios gerenciam veiculos"
on public.veiculos for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

drop policy if exists "clientes leem proprios veiculos" on public.veiculos;
create policy "clientes leem proprios veiculos"
on public.veiculos for select
to authenticated
using (
  exists (
    select 1
    from public.clientes
    where clientes.id = veiculos.cliente_id
      and clientes.user_id = auth.uid()
  )
);

drop policy if exists "proprietarios gerenciam movimentacoes" on public.movimentacoes;
create policy "proprietarios gerenciam movimentacoes"
on public.movimentacoes for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

drop policy if exists "clientes leem proprias movimentacoes" on public.movimentacoes;
create policy "clientes leem proprias movimentacoes"
on public.movimentacoes for select
to authenticated
using (
  exists (
    select 1
    from public.veiculos
    join public.clientes on clientes.id = veiculos.cliente_id
    where veiculos.id = movimentacoes.veiculo_id
      and clientes.user_id = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;
grant execute on function public.usuario_e_proprietario() to authenticated;
