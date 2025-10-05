import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, Building2, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { AdminJobActions } from "@/components/admin-job-actions"

export async function AdminJobsList() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies(*)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-4">
      {jobs && jobs.length > 0 ? (
        jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <Link href={`/jobs/${job.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{job.title}</h3>
                    </Link>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    {job.company && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company.name}
                      </div>
                    )}
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
                      <Calendar className="h-4 w-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-700">{job.description}</p>
                </div>

                <AdminJobActions jobId={job.id} isActive={job.is_active} />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No jobs found</p>
        </div>
      )}
    </div>
  )
}
