"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface JobFormProps {
  companyId: string
  employerId?: string
  job?: {
    id: string
    title: string
    description: string
    job_type: string
    location: string | null
    salary_min: number | null
    salary_max: number | null
    requirements: string[] | null
    responsibilities: string[] | null
    skills_required: string[] | null
    benefits: string[] | null
    is_active: boolean
  }
}

export function JobForm({ companyId, employerId, job }: JobFormProps) {
  const [title, setTitle] = useState(job?.title || "")
  const [description, setDescription] = useState(job?.description || "")
  const [jobType, setJobType] = useState(job?.job_type || "full_time")
  const [location, setLocation] = useState(job?.location || "")
  const [salaryMin, setSalaryMin] = useState(job?.salary_min?.toString() || "")
  const [salaryMax, setSalaryMax] = useState(job?.salary_max?.toString() || "")
  const [requirements, setRequirements] = useState<string[]>(job?.requirements || [])
  const [responsibilities, setResponsibilities] = useState<string[]>(job?.responsibilities || [])
  const [skills, setSkills] = useState<string[]>(job?.skills_required || [])
  const [benefits, setBenefits] = useState<string[]>(job?.benefits || [])
  const [isActive, setIsActive] = useState(job?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [newRequirement, setNewRequirement] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [newBenefit, setNewBenefit] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const jobData = {
        company_id: companyId,
        ...(employerId && { employer_id: employerId }),
        title,
        description,
        job_type: jobType,
        location: location || null,
        salary_min: salaryMin ? Number.parseInt(salaryMin) : null,
        salary_max: salaryMax ? Number.parseInt(salaryMax) : null,
        requirements: requirements.length > 0 ? requirements : null,
        responsibilities: responsibilities.length > 0 ? responsibilities : null,
        skills_required: skills.length > 0 ? skills : null,
        benefits: benefits.length > 0 ? benefits : null,
        is_active: isActive,
      }

      if (job) {
        const { error } = await supabase.from("jobs").update(jobData).eq("id", job.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("jobs").insert(jobData)
        if (error) throw error
      }

      router.push("/employer")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, clearInput: () => void) => {
    if (value.trim()) {
      setter((prev) => [...prev, value.trim()])
      clearInput()
    }
  }

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Job Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          required
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role, team, and what makes this opportunity unique..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jobType">
            Job Type <span className="text-red-500">*</span>
          </Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, New York, NY"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
          <Input
            id="salaryMin"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="50000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
          <Input
            id="salaryMax"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="100000"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label>Requirements</Label>
        <div className="flex gap-2">
          <Input
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="Add a requirement..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newRequirement, setRequirements, () => setNewRequirement(""))
              }
            }}
          />
          <Button type="button" onClick={() => addItem(newRequirement, setRequirements, () => setNewRequirement(""))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {requirements.map((req, index) => (
            <Badge key={index} variant="secondary">
              {req}
              <button type="button" onClick={() => removeItem(index, setRequirements)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div className="space-y-2">
        <Label>Responsibilities</Label>
        <div className="flex gap-2">
          <Input
            value={newResponsibility}
            onChange={(e) => setNewResponsibility(e.target.value)}
            placeholder="Add a responsibility..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newResponsibility, setResponsibilities, () => setNewResponsibility(""))
              }
            }}
          />
          <Button
            type="button"
            onClick={() => addItem(newResponsibility, setResponsibilities, () => setNewResponsibility(""))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {responsibilities.map((resp, index) => (
            <Badge key={index} variant="secondary">
              {resp}
              <button type="button" onClick={() => removeItem(index, setResponsibilities)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills Required</Label>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newSkill, setSkills, () => setNewSkill(""))
              }
            }}
          />
          <Button type="button" onClick={() => addItem(newSkill, setSkills, () => setNewSkill(""))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
              <button type="button" onClick={() => removeItem(index, setSkills)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <Label>Benefits</Label>
        <div className="flex gap-2">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            placeholder="Add a benefit..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem(newBenefit, setBenefits, () => setNewBenefit(""))
              }
            }}
          />
          <Button type="button" onClick={() => addItem(newBenefit, setBenefits, () => setNewBenefit(""))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary">
              {benefit}
              <button type="button" onClick={() => removeItem(index, setBenefits)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Active (visible to job seekers)
        </Label>
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
          {isLoading ? "Saving..." : job ? "Update Job" : "Post Job"}
        </Button>
      </div>
    </form>
  )
}
