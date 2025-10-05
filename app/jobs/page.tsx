import { createClient } from "@/lib/supabase/server"
import { JobSearch } from "@/components/job-search"
import { JobCard } from "@/components/job-card"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; type?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  let jobsQuery = supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies(*),
      saved:saved_jobs(id)
    `,
    )
    .eq("is_active", true)

  // Apply search filters
  if (searchParams.q && searchParams.q.trim()) {
    const searchTerm = searchParams.q.trim()
    jobsQuery = jobsQuery.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,required_skills.ilike.%${searchTerm}%`,
    )
  }

  if (searchParams.location && searchParams.location.trim()) {
    jobsQuery = jobsQuery.ilike("location", `%${searchParams.location.trim()}%`)
  }

  if (searchParams.type && searchParams.type !== "all") {
    jobsQuery = jobsQuery.eq("job_type", searchParams.type)
  }

  const { data: jobs, error } = await jobsQuery.order("created_at", { ascending: false })

  console.log("[v0] Jobs query result:", { count: jobs?.length, error, searchParams })

  return (
    <div className="min-h-screen bg-gray-50">
      {profile && <DashboardHeader profile={profile} />}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
          <p className="text-gray-600">
            {jobs?.length || 0} {searchParams.q ? `results for "${searchParams.q}"` : "jobs available"}
          </p>
        </div>

        <div className="mb-8">
          <JobSearch />
        </div>

        <div className="grid gap-4">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} isSaved={job.saved && job.saved.length > 0} />)
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="mb-2 text-lg font-medium text-gray-900">No jobs found</p>
              <p className="text-gray-600">
                {searchParams.q || searchParams.location || searchParams.type
                  ? "Try adjusting your search criteria or filters."
                  : "Check back later for new opportunities."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
