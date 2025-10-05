"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, X, Star, Eye, MoreVertical } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ApplicationActionsProps {
  applicationId: string
  currentStatus: string
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Status updated",
        description: "The applicant has been notified of the status change.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "reviewed" && (
          <DropdownMenuItem onClick={() => updateStatus("reviewed")}>
            <Eye className="mr-2 h-4 w-4" />
            Mark as Reviewed
          </DropdownMenuItem>
        )}
        {currentStatus !== "shortlisted" && (
          <DropdownMenuItem onClick={() => updateStatus("shortlisted")}>
            <Star className="mr-2 h-4 w-4" />
            Shortlist
          </DropdownMenuItem>
        )}
        {currentStatus !== "accepted" && (
          <DropdownMenuItem onClick={() => updateStatus("accepted")}>
            <Check className="mr-2 h-4 w-4" />
            Accept
          </DropdownMenuItem>
        )}
        {currentStatus !== "rejected" && (
          <DropdownMenuItem onClick={() => updateStatus("rejected")}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
