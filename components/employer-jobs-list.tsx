import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Eye, Users, Edit } from "lucide-react"
import Link from "next/link"
import { DeleteJobButton } from "@/components/delete-job-button"

interface EmployerJobsListProps {
  companyId?: string
}

export async function EmployerJobsList({ companyId }: EmployerJobsListProps) {
  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-gray-600">Please set up your company profile first</p>
        <Link href="/employer/company">
          <Button className="mt-4">Setup Company</Button>
        </Link>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  // Get application counts for each job
  const jobsWithCounts = await Promise.all(
    (jobs || []).map(async (job) => {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("job_id", job.id)

      return { ...job, applicationCount: count || 0 }
    }),
  )

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-4">
      {jobsWithCounts && jobsWithCounts.length > 0 ? (
        jobsWithCounts.map((job) => (
          <Card key={job.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <Link href={`/jobs/${job.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{job.title}</h3>
                    </Link>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {formatJobType(job.job_type)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {job.views_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applicationCount} applications
                    </div>
                  </div>

                  <p className="line-clamp-2 text-gray-700">{job.description}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/employer/jobs/${job.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Link href={`/employer/jobs/${job.id}/applications`} className="flex-1">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  View Applications ({job.applicationCount})
                </Button>
              </Link>
              <DeleteJobButton jobId={job.id} />
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No jobs posted yet</p>
          <Link href="/employer/jobs/new">
            <Button className="mt-4">Post Your First Job</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
