import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Clock, Building2, Globe, Users } from "lucide-react"
import Link from "next/link"

export default async function JobDetailPage({
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

  // Increment view count
  await supabase.rpc("increment_job_views", { job_id: id })

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", id)
    .eq("job_seeker_id", user.id)
    .single()

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return "Competitive"
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
    }
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}k`
    return `Up to $${(job.salary_max! / 1000).toFixed(0)}k`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile!} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Job Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex items-start gap-4">
                {job.company?.logo_url && (
                  <img
                    src={job.company.logo_url || "/placeholder.svg"}
                    alt={job.company.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-xl text-gray-600">{job.company?.name}</p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <span>{formatJobType(job.job_type)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span>{formatSalary()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {existingApplication ? (
                <Button disabled className="w-full">
                  Already Applied
                </Button>
              ) : (
                <Link href={`/jobs/${job.id}/apply`}>
                  <Button className="w-full" size="lg">
                    Apply for this Position
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700">{job.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills Required */}
          {job.skills_required && job.skills_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {job.company && (
            <Card>
              <CardHeader>
                <CardTitle>About {job.company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.company.description && <p className="text-gray-700">{job.company.description}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  {job.company.industry && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <span>{job.company.industry}</span>
                    </div>
                  )}
                  {job.company.size && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span>{job.company.size} employees</span>
                    </div>
                  )}
                  {job.company.website && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
