import { createClient } from "@/lib/supabase/server"
import { JobCard } from "@/components/job-card"
import { JobFilters } from "@/components/job-filters"

interface JobsListProps {
  userId: string
}

export async function JobsList({ userId }: JobsListProps) {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get saved job IDs for this user
  const { data: savedJobs } = await supabase.from("saved_jobs").select("job_id").eq("job_seeker_id", userId)

  const savedJobIds = new Set(savedJobs?.map((sj) => sj.job_id) || [])

  return (
    <div className="space-y-6">
      <JobFilters />

      {jobs && jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} userId={userId} isSaved={savedJobIds.has(job.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No jobs available at the moment</p>
        </div>
      )}
    </div>
  )
}
