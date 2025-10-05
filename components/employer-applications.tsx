import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase, User, FileText } from "lucide-react"
import Link from "next/link"
import { ApplicationActions } from "@/components/application-actions"

interface EmployerApplicationsProps {
  companyId?: string
}

export async function EmployerApplications({ companyId }: EmployerApplicationsProps) {
  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-gray-600">Please set up your company profile first</p>
      </div>
    )
  }

  const supabase = await createClient()

  // Get all jobs for this company
  const { data: jobs } = await supabase.from("jobs").select("id").eq("company_id", companyId)

  const jobIds = jobs?.map((j) => j.id) || []

  if (jobIds.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-gray-600">No applications yet</p>
      </div>
    )
  }

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(*),
      job_seeker:profiles!applications_job_seeker_id_fkey(*)
    `)
    .in("job_id", jobIds)
    .order("applied_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {applications && applications.length > 0 ? (
        applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.job_seeker?.full_name || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-600">{application.job_seeker?.email}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Link href={`/jobs/${application.job?.id}`}>
                      <p className="font-medium text-blue-600 hover:underline">{application.job?.title}</p>
                    </Link>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Applied {new Date(application.applied_at).toLocaleDateString()}
                    </div>
                    {application.job_seeker?.location && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {application.job_seeker.location}
                      </div>
                    )}
                  </div>

                  {application.cover_letter && (
                    <div className="mb-4 rounded-lg bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4" />
                        Cover Letter
                      </div>
                      <p className="text-sm text-gray-700">{application.cover_letter}</p>
                    </div>
                  )}

                  {application.resume_url && (
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Resume →
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  <ApplicationActions applicationId={application.id} currentStatus={application.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No applications received yet</p>
        </div>
      )}
    </div>
  )
}
