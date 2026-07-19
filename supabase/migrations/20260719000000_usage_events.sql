create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  roast_slug text not null unique references public.roasts(slug) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  dodo_customer_id text not null,
  event_id uuid not null unique,
  status text not null default 'pending' check (status in ('pending', 'sent')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_pending_idx
  on public.usage_events (status, created_at)
  where status = 'pending';

alter table public.usage_events enable row level security;
