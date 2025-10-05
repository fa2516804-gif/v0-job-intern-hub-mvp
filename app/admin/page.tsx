import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersList } from "@/components/admin-users-list"
import { AdminJobsList } from "@/components/admin-jobs-list"
import { AdminApplicationsList } from "@/components/admin-applications-list"
import { Users, Briefcase, FileText, Building2 } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Get platform statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true })

  const { count: totalApplications } = await supabase.from("applications").select("*", { count: "exact", head: true })

  const { count: totalCompanies } = await supabase.from("companies").select("*", { count: "exact", head: true })

  const { count: jobSeekers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "job_seeker")

  const { count: employers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "employer")

  const { count: activeJobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: admins } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, jobs, and platform activity</p>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-gray-600">
                {jobSeekers || 0} seekers, {employers || 0} employers, {admins || 0} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs || 0}</div>
              <p className="text-xs text-gray-600">{activeJobs || 0} active postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications || 0}</div>
              <p className="text-xs text-gray-600">Total submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies || 0}</div>
              <p className="text-xs text-gray-600">Registered companies</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUsersList />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <AdminJobsList />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <AdminApplicationsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
