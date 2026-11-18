-- One profile per auth user; owner-only access via RLS.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  primary key (id)
);

alter table public.profiles enable row level security;

-- Signed-in users may read and edit only their own row. anon gets nothing.
-- Rows are created by the trigger below, and removed by the cascade above.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Create a profile whenever a user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

-- Only the trigger should run this; keep it off the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
