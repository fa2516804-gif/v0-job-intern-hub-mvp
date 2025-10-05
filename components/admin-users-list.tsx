"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, MapPin, Calendar, Search } from "lucide-react"
import { AdminUserActions } from "@/components/admin-user-actions"
import { useState, useEffect } from "react"

export function AdminUsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (data) {
      setUsers(data)
      setFilteredUsers(data)
    }
    setIsLoading(false)
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "employer":
        return "bg-blue-100 text-blue-800"
      case "job_seeker":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="job_seeker">Job Seekers</SelectItem>
                <SelectItem value="employer">Employers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name || "No name"}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {user.bio && <p className="mt-3 text-sm text-gray-700">{user.bio}</p>}
                </div>

                <AdminUserActions userId={user.id} currentRole={user.role} onUpdate={fetchUsers} />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-600">No users found matching your filters</p>
        </div>
      )}
    </div>
  )
}
