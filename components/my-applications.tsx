import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase, MapPin } from "lucide-react"
import Link from "next/link"

interface MyApplicationsProps {
  userId: string
}

export async function MyApplications({ userId }: MyApplicationsProps) {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(
        *,
        company:companies(*)
      )
    `)
    .eq("job_seeker_id", userId)
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
                  <Link href={`/jobs/${application.job?.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                      {application.job?.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600">{application.job?.company?.name}</p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    {application.job?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {application.job?.job_type
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Applied {new Date(application.applied_at).toLocaleDateString()}
                    </div>
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
          <p className="text-gray-600">You haven&apos;t applied to any jobs yet</p>
        </div>
      )}
    </div>
  )
}
