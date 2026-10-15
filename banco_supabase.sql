-- PAULISTA VERDE — BANCO DE DADOS OPCIONAL (Supabase SQL Editor)
-- Aplique somente no SEU projeto do Supabase.
-- Este exemplo permite leitura e CADASTRO anônimos: não é anti-spam.
-- Para produção, moderação/autenticação e controle de abuso são necessários.

create extension if not exists pgcrypto;

create table if not exists public.plantas (
  id uuid primary key default gen_random_uuid(),
  especie varchar(55) not null check (char_length(especie) between 2 and 55),
  tipo varchar(12) not null check (tipo in ('frutifera','hortalica')),
  bairro varchar(55) not null check (char_length(bairro) between 2 and 55),
  referencia varchar(80) not null default '',
  responsavel varchar(30) not null check (char_length(responsavel) between 2 and 30),
  compartilhamento varchar(12) not null check (compartilhamento in ('frutos','mudas','ambos','informativo')),
  observacao varchar(240) not null default '',
  latitude numeric(6,3) not null check (latitude between -90 and 90),
  longitude numeric(6,3) not null check (longitude between -180 and 180),
  meses integer[] not null default '{}',
  criado_em timestamptz not null default now(),
  constraint meses_no_maximo_doze check (coalesce(array_length(meses,1),0) <= 12),
  constraint meses_validos check (meses <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::integer[])
);

-- RLS e permissões mínimas para o protótipo educativo.
alter table public.plantas enable row level security;
revoke all on table public.plantas from public, anon, authenticated;
grant usage on schema public to anon;
grant select, insert on public.plantas to anon;

-- A consulta mostra apenas os campos inseridos voluntariamente pelo morador.
drop policy if exists "Visitantes podem ler plantas" on public.plantas;
create policy "Visitantes podem ler plantas"
  on public.plantas for select to anon using (true);

drop policy if exists "Visitantes podem cadastrar plantas" on public.plantas;
create policy "Visitantes podem cadastrar plantas"
  on public.plantas for insert to anon with check (true);

-- Sem permissão pública de UPDATE/DELETE: evita que qualquer visitante
-- apague os cadastros de outras pessoas. Para produção, use autenticação.
