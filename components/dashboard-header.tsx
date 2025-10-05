import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, LogOut } from "lucide-react"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  profile: {
    id: string
    full_name: string | null
    email: string
    role: string
  }
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const getDashboardLink = () => {
    switch (profile.role) {
      case "employer":
        return "/employer"
      case "admin":
        return "/admin"
      default:
        return "/dashboard"
    }
  }

  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || profile.email[0].toUpperCase()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={getDashboardLink()} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobInternHub</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost">Browse Jobs</Button>
          </Link>

          <NotificationsDropdown userId={profile.id} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.full_name || "User"}</p>
                  <p className="text-xs text-gray-600">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getDashboardLink()}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
