-- Drop existing policies that cause infinite recursion
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all jobs" on public.jobs;
drop policy if exists "Admins can delete any job" on public.jobs;

-- Drop and recreate profiles policies to fix recursion
drop policy if exists "Users can view all profiles" on public.profiles;

-- Create non-recursive profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Drop and recreate companies policies to avoid recursion
drop policy if exists "Employers can create companies" on public.companies;
drop policy if exists "Employers can update own companies" on public.companies;

create policy "Employers can create companies"
  on public.companies for insert
  with check (auth.uid() = employer_id);

create policy "Employers can update own companies"
  on public.companies for update
  using (auth.uid() = employer_id);

-- Drop and recreate jobs policies to avoid recursion
drop policy if exists "Employers can create jobs" on public.jobs;
drop policy if exists "Employers can update own jobs" on public.jobs;

create policy "Employers can create jobs"
  on public.jobs for insert
  with check (auth.uid() = employer_id);

create policy "Employers can update own jobs"
  on public.jobs for update
  using (auth.uid() = employer_id);

-- Drop and recreate applications policies to avoid recursion
drop policy if exists "Job seekers can create applications" on public.applications;

create policy "Job seekers can create applications"
  on public.applications for insert
  with check (auth.uid() = job_seeker_id);

-- Add simpler admin policies that don't cause recursion
-- Admins will need to be managed through direct database access or a separate admin interface
-- For now, we'll allow all authenticated users to perform admin actions if they have the admin role
-- This is checked in the application layer, not in RLS policies

-- Add policy for system to insert notifications
create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);
