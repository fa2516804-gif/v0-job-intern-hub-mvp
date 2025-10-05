"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ApplicationFormProps {
  jobId: string
  userId: string
}

export function ApplicationForm({ jobId, userId }: ApplicationFormProps) {
  const [coverLetter, setCoverLetter] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        job_seeker_id: userId,
        cover_letter: coverLetter,
        resume_url: resumeUrl || null,
        status: "pending",
      })

      if (error) throw error

      router.push("/dashboard?tab=applications")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="coverLetter">
          Cover Letter <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="coverLetter"
          placeholder="Tell us why you're a great fit for this position..."
          rows={8}
          required
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
        <p className="text-sm text-gray-500">Explain your interest in the position and highlight relevant experience</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
        <Input
          id="resumeUrl"
          type="url"
          placeholder="https://example.com/your-resume.pdf"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
        />
        <p className="text-sm text-gray-500">Link to your resume (Google Drive, Dropbox, personal website, etc.)</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}
