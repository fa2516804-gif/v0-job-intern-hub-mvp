"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import type { Job } from "@/lib/types"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface JobCardProps {
  job: Job
  userId: string
  isSaved: boolean
}

export function JobCard({ job, userId, isSaved: initialIsSaved }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSaveToggle = async () => {
    setIsLoading(true)
    try {
      if (isSaved) {
        await supabase.from("saved_jobs").delete().eq("job_id", job.id).eq("job_seeker_id", userId)
        setIsSaved(false)
      } else {
        await supabase.from("saved_jobs").insert({ job_id: job.id, job_seeker_id: userId })
        setIsSaved(true)
      }
      router.refresh()
    } catch (error) {
      console.error("Error toggling save:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
    }
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}k`
    return `Up to $${(job.salary_max! / 1000).toFixed(0)}k`
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-start gap-3">
              {job.company?.logo_url && (
                <img
                  src={job.company.logo_url || "/placeholder.svg"}
                  alt={job.company.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <Link href={`/jobs/${job.id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{job.title}</h3>
                </Link>
                <p className="text-gray-600">{job.company?.name}</p>
              </div>
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
              {formatSalary() && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>

            <p className="mb-4 line-clamp-2 text-gray-700">{job.description}</p>

            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.skills_required.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 5 && (
                  <Badge variant="secondary">+{job.skills_required.length - 5} more</Badge>
                )}
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={handleSaveToggle} disabled={isLoading}>
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-blue-600" /> : <Bookmark className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/jobs/${job.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            View Details
          </Button>
        </Link>
        <Link href={`/jobs/${job.id}/apply`} className="flex-1">
          <Button className="w-full">Apply Now</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
