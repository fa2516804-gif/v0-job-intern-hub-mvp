"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function JobSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [jobType, setJobType] = useState(searchParams.get("type") || "all")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (location) params.set("location", location)
    if (jobType !== "all") params.set("type", jobType)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-md border px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Job title, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 p-0 focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-1 items-center gap-2 rounded-md border px-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 p-0 focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-400 md:hidden" />
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full md:w-auto">
          Search Jobs
        </Button>
      </div>
    </form>
  )
}
