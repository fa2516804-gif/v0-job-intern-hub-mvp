import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ApplicationForm } from "@/components/application-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "job_seeker") {
    redirect("/")
  }

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies(*)
    `)
    .eq("id", id)
    .single()

  if (!job) {
    redirect("/dashboard")
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", id)
    .eq("job_seeker_id", user.id)
    .single()

  if (existingApplication) {
    redirect(`/jobs/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Apply for Position</CardTitle>
              <div className="mt-2">
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <p className="text-gray-600">{job.company?.name}</p>
              </div>
            </CardHeader>
            <CardContent>
              <ApplicationForm jobId={id} userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
