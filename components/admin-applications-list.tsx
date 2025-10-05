import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, Calendar, Building2 } from "lucide-react"
import Link from "next/link"

export async function AdminApplicationsList() {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(
        *,
        company:companies(*)
      ),
      job_seeker:profiles!applications_job_seeker_id_fkey(*)
    `)
    .order("applied_at", { ascending: false })
    .limit(50)

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
                  <div className="mb-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        Job Seeker
                      </div>
                      <p className="font-semibold text-gray-900">{application.job_seeker?.full_name || "Anonymous"}</p>
                      <p className="text-sm text-gray-600">{application.job_seeker?.email}</p>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        Job Position
                      </div>
                      <Link href={`/jobs/${application.job?.id}`}>
                        <p className="font-semibold text-blue-600 hover:underline">{application.job?.title}</p>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        {application.job?.company?.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Applied {new Date(application.applied_at).toLocaleDateString()}
                  </div>
                </div>

                <Badge className={getStatusColor(application.status)}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No applications found</p>
        </div>
      )}
    </div>
  )
}
