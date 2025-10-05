"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, UserCog, Trash2, Shield } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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

interface AdminUserActionsProps {
  userId: string
  currentRole: string
  onUpdate?: () => void
}

export function AdminUserActions({ userId, currentRole, onUpdate }: AdminUserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const changeRole = async (newRole: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Role updated",
        description: `User role changed to ${newRole.replace("_", " ")}`,
      })

      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error changing role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async () => {
    setIsLoading(true)
    try {
      // Delete user profile (cascading deletes will handle related data)
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      toast({
        title: "User deleted",
        description: "User account has been permanently deleted",
      })

      if (onUpdate) {
        onUpdate()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>User Management</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-normal text-gray-500">Change Role</DropdownMenuLabel>
          {currentRole !== "job_seeker" && (
            <DropdownMenuItem onClick={() => changeRole("job_seeker")}>
              <UserCog className="mr-2 h-4 w-4" />
              Make Job Seeker
            </DropdownMenuItem>
          )}
          {currentRole !== "employer" && (
            <DropdownMenuItem onClick={() => changeRole("employer")}>
              <UserCog className="mr-2 h-4 w-4" />
              Make Employer
            </DropdownMenuItem>
          )}
          {currentRole !== "admin" && (
            <DropdownMenuItem onClick={() => changeRole("admin")}>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data
              including applications, jobs, and company information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
