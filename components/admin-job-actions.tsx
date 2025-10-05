"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, EyeOff, Trash2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminJobActionsProps {
  jobId: string
  isActive: boolean
}

export function AdminJobActions({ jobId, isActive }: AdminJobActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggleActive = async () => {
    setIsLoading(true)
    try {
      await supabase.from("jobs").update({ is_active: !isActive }).eq("id", jobId)
      router.refresh()
    } catch (error) {
      console.error("Error toggling job status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteJob = async () => {
    setIsLoading(true)
    try {
      await supabase.from("jobs").delete().eq("id", jobId)
      router.refresh()
    } catch (error) {
      console.error("Error deleting job:", error)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggleActive}>
            {isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Deactivate Job
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Activate Job
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting and all associated
              applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteJob} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
