import { createClient } from "@/lib/supabase/server"
import { JobCard } from "@/components/job-card"

interface SavedJobsProps {
  userId: string
}

export async function SavedJobs({ userId }: SavedJobsProps) {
  const supabase = await createClient()

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select(`
      *,
      job:jobs(
        *,
        company:companies(*)
      )
    `)
    .eq("job_seeker_id", userId)
    .order("saved_at", { ascending: false })

  return (
    <div className="space-y-4">
      {savedJobs && savedJobs.length > 0 ? (
        savedJobs.map((savedJob) =>
          savedJob.job ? <JobCard key={savedJob.id} job={savedJob.job} userId={userId} isSaved={true} /> : null,
        )
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">You haven&apos;t saved any jobs yet</p>
        </div>
      )}
    </div>
  )
}
