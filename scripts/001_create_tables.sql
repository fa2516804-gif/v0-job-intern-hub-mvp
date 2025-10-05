-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('job_seeker', 'employer', 'admin');

-- Create enum for job types
create type job_type as enum ('full_time', 'part_time', 'internship', 'contract');

-- Create enum for application status
create type application_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'job_seeker',
  phone text,
  location text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create companies table (for employers)
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  website text,
  logo_url text,
  industry text,
  size text,
  location text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create jobs table
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  employer_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  job_type job_type not null,
  location text,
  salary_min integer,
  salary_max integer,
  requirements text[],
  responsibilities text[],
  benefits text[],
  skills_required text[],
  experience_level text,
  is_active boolean default true,
  views_count integer default 0,
  applications_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deadline timestamp with time zone
);

-- Create applications table
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  job_seeker_id uuid references public.profiles(id) on delete cascade,
  status application_status default 'pending',
  cover_letter text,
  resume_url text,
  applied_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  notes text
);

-- Create saved_jobs table (for job seekers to bookmark jobs)
create table if not exists public.saved_jobs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  job_seeker_id uuid references public.profiles(id) on delete cascade,
  saved_at timestamp with time zone default now(),
  unique(job_id, job_seeker_id)
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Companies policies
create policy "Anyone can view active companies"
  on public.companies for select
  using (true);

create policy "Employers can create companies"
  on public.companies for insert
  with check (
    auth.uid() = employer_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'employer')
  );

create policy "Employers can update own companies"
  on public.companies for update
  using (auth.uid() = employer_id);

create policy "Employers can delete own companies"
  on public.companies for delete
  using (auth.uid() = employer_id);

-- Jobs policies
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (is_active = true or auth.uid() = employer_id);

create policy "Employers can create jobs"
  on public.jobs for insert
  with check (
    auth.uid() = employer_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'employer')
  );

create policy "Employers can update own jobs"
  on public.jobs for update
  using (auth.uid() = employer_id);

create policy "Employers can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = employer_id);

-- Applications policies
create policy "Job seekers can view own applications"
  on public.applications for select
  using (auth.uid() = job_seeker_id);

create policy "Employers can view applications for their jobs"
  on public.applications for select
  using (
    exists (
      select 1 from jobs
      where jobs.id = applications.job_id
      and jobs.employer_id = auth.uid()
    )
  );

create policy "Job seekers can create applications"
  on public.applications for insert
  with check (
    auth.uid() = job_seeker_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'job_seeker')
  );

create policy "Job seekers can update own applications"
  on public.applications for update
  using (auth.uid() = job_seeker_id);

create policy "Employers can update applications for their jobs"
  on public.applications for update
  using (
    exists (
      select 1 from jobs
      where jobs.id = applications.job_id
      and jobs.employer_id = auth.uid()
    )
  );

-- Saved jobs policies
create policy "Job seekers can view own saved jobs"
  on public.saved_jobs for select
  using (auth.uid() = job_seeker_id);

create policy "Job seekers can save jobs"
  on public.saved_jobs for insert
  with check (auth.uid() = job_seeker_id);

create policy "Job seekers can unsave jobs"
  on public.saved_jobs for delete
  using (auth.uid() = job_seeker_id);

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Admin policies (admins can do everything)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all jobs"
  on public.jobs for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete any job"
  on public.jobs for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
