"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function JobFilters() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search jobs..." className="pl-10" />
      </div>

      <Select defaultValue="all">
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

      <Select defaultValue="all">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="onsite">On-site</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
