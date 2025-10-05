import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JobsList } from "@/components/jobs-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyApplications } from "@/components/my-applications"
import { SavedJobs } from "@/components/saved-jobs"

export default async function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name || "Job Seeker"}!</h1>
          <p className="mt-2 text-gray-600">Find your next opportunity or track your applications</p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <JobsList userId={user.id} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <MyApplications userId={user.id} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <SavedJobs userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
