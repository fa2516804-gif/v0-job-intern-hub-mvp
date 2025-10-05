-- Fix infinite recursion in RLS policies
-- This script removes policies that query the same table they protect

-- Drop existing policies that cause infinite recursion
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all jobs" on public.jobs;
drop policy if exists "Admins can delete any job" on public.jobs;

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

-- Add policy for system to insert notifications
drop policy if exists "System can insert notifications" on public.notifications;

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- Note: Admin functionality will be handled at the application layer
-- rather than through RLS policies to avoid infinite recursion
