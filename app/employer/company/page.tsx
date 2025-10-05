import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { CompanyForm } from "@/components/company-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CompanyPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm employerId={user.id} company={company} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
