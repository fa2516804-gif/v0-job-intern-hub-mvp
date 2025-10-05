import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Update application status
    const { data: application, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", params.id)
      .select(`
        *,
        job:jobs(title)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const statusMessages: Record<string, string> = {
      shortlisted: "Your application has been shortlisted!",
      reviewed: "Your application is being reviewed",
      accepted: "Congratulations! Your application has been accepted",
      rejected: "Your application status has been updated",
    }

    await supabase.from("notifications").insert({
      user_id: application.job_seeker_id,
      title: "Application Update",
      message: `${statusMessages[status]} for ${application.job.title}`,
      type: "application",
      link: `/dashboard/applications`,
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Update application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
