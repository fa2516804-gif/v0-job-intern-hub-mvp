import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let userRole = null
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    userRole = profile?.role
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user || userRole !== "job_seeker") {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // Protect employer routes
  if (request.nextUrl.pathname.startsWith("/employer")) {
    if (!user || userRole !== "employer") {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || userRole !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/admin/:path*", "/jobs/:path*/apply"],
}
