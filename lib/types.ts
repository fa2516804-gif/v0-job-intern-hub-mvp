export type UserRole = "job_seeker" | "employer" | "admin"
export type JobType = "full_time" | "part_time" | "internship" | "contract"
export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  employer_id: string
  name: string
  description: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  logo_url: string | null
  created_at: string
}

export interface Job {
  id: string
  company_id: string
  employer_id: string
  title: string
  description: string
  job_type: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  requirements: string[] | null
  responsibilities: string[] | null
  skills_required: string[] | null
  benefits: string[] | null
  is_active: boolean
  views_count: number
  created_at: string
  company?: Company
}

export interface Application {
  id: string
  job_id: string
  job_seeker_id: string
  status: ApplicationStatus
  cover_letter: string | null
  resume_url: string | null
  applied_at: string
  reviewed_at: string | null
  notes: string | null
  job?: Job
}

export interface SavedJob {
  id: string
  job_id: string
  job_seeker_id: string
  saved_at: string
  job?: Job
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string | null
  is_read: boolean
  link: string | null
  created_at: string
}
