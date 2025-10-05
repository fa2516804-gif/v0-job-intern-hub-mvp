"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Company } from "@/lib/types"

interface CompanyFormProps {
  employerId: string
  company?: Company
}

export function CompanyForm({ employerId, company }: CompanyFormProps) {
  const [name, setName] = useState(company?.name || "")
  const [description, setDescription] = useState(company?.description || "")
  const [website, setWebsite] = useState(company?.website || "")
  const [industry, setIndustry] = useState(company?.industry || "")
  const [size, setSize] = useState(company?.size || "")
  const [location, setLocation] = useState(company?.location || "")
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const companyData = {
        employer_id: employerId,
        name,
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
        location: location || null,
        logo_url: logoUrl || null,
      }

      if (company) {
        const { error } = await supabase.from("companies").update(companyData).eq("id", company.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("companies").insert(companyData)
        if (error) throw error
      }

      setSuccess(true)
      router.push("/employer")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your company..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Technology"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Company Size</Label>
          <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="1-50" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="San Francisco, CA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-600">Company profile saved successfully!</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : company ? "Update Company" : "Create Company"}
      </Button>
    </form>
  )
}
