import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployerJobsList } from "@/components/employer-jobs-list"
import { EmployerApplications } from "@/components/employer-applications"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function EmployerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "employer") {
    redirect("/")
  }

  // Get employer's company
  const { data: company } = await supabase.from("companies").select("*").eq("employer_id", user.id).maybeSingle()

  let jobsCount = 0
  let applicationsCount = 0

  if (company?.id) {
    // Get jobs count
    const { count: jCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company.id)
    jobsCount = jCount || 0

    // Get all job IDs for this company
    const { data: companyJobs } = await supabase.from("jobs").select("id").eq("company_id", company.id)

    const jobIds = companyJobs?.map((j) => j.id) || []

    // Count applications for these jobs
    if (jobIds.length > 0) {
      const { count: aCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds)
      applicationsCount = aCount || 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your job postings and applications</p>
          </div>
          {company ? (
            <Link href="/employer/jobs/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </Link>
          ) : (
            <Link href="/employer/company">
              <Button>Setup Company Profile</Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <p className="text-sm font-medium text-gray-600">Active Jobs</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{jobsCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <p className="text-sm font-medium text-gray-600">Total Applications</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{applicationsCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <p className="text-sm font-medium text-gray-600">Company</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{company?.name || "Not Set"}</p>
            {!company && (
              <Link href="/employer/company" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                Setup now →
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <EmployerJobsList companyId={company?.id} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <EmployerApplications companyId={company?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
