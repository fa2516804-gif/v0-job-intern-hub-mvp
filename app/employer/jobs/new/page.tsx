import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { JobForm } from "@/components/job-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewJobPage() {
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

  const { data: company } = await supabase.from("companies").select("*").eq("employer_id", user.id).maybeSingle()

  if (!company) {
    redirect("/employer/company")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
            </CardHeader>
            <CardContent>
              <JobForm companyId={company.id} employerId={user.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
