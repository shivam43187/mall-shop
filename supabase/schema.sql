-- Mall Shop database. Paste this whole file into Supabase → SQL Editor → New query, then Run.
-- Safe to run more than once.

-- ---------- Admins ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Every new sign-up gets a profile row (not an admin).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the signed-in user is an admin. security definer so policies can call it without recursion.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
-- No insert/update/delete policies: users cannot make themselves admin.

-- ---------- Products added from the admin page ----------
-- The 48 built-in products live in the code; this table holds the extra ones.
create table if not exists public.products (
  id text primary key default ('p-' || substr(md5(random()::text), 1, 10)),
  store_id text not null check (store_id in ('fashion','electronics','home','books','sports','beauty','toys','grocery')),
  name text not null check (char_length(name) between 1 and 80),
  price integer not null check (price between 1 and 10000000),
  description text not null default '' check (char_length(description) <= 500),
  kind text not null,
  colours jsonb not null default '[]'::jsonb,
  sizes jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
drop policy if exists "Anyone can see active products" on public.products;
create policy "Anyone can see active products" on public.products for select using (active or public.is_admin());
drop policy if exists "Admins add products" on public.products;
create policy "Admins add products" on public.products for insert with check (public.is_admin());
drop policy if exists "Admins edit products" on public.products;
create policy "Admins edit products" on public.products for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products for delete using (public.is_admin());

-- ---------- Orders ----------
-- Written only by the server (secret key) after Stripe confirms payment.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  total integer not null,
  status text not null,
  items jsonb not null,
  shipping jsonb,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;
drop policy if exists "Shoppers see their orders" on public.orders;
create policy "Shoppers see their orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
-- No insert/update/delete policies: only the server can write orders.

-- ---------- Make yourself an admin ----------
-- After signing up on the site, run this with your email:
--   update public.profiles set is_admin = true where email = 'you@example.com';
