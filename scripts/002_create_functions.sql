-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'job_seeker')
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger companies_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();

create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.handle_updated_at();

-- Function to increment job views
create or replace function public.increment_job_views(job_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.jobs
  set views_count = views_count + 1
  where id = job_id;
end;
$$;

-- Function to update applications count
create or replace function public.update_applications_count()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.jobs
    set applications_count = applications_count + 1
    where id = new.job_id;
  elsif (TG_OP = 'DELETE') then
    update public.jobs
    set applications_count = applications_count - 1
    where id = old.job_id;
  end if;
  return null;
end;
$$;

-- Trigger to update applications count
create trigger applications_count_trigger
  after insert or delete on public.applications
  for each row
  execute function public.update_applications_count();
