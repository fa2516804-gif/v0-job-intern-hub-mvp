import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { status } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the application with job and job seeker details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(
        `
        *,
        job:jobs(*, company:companies(*)),
        job_seeker:profiles!applications_job_seeker_id_fkey(*)
      `,
      )
      .eq("id", params.id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Verify the user is the employer who owns this job
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", application.job.company_id)
      .eq("employer_id", user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the application status
    const { error: updateError } = await supabase.from("applications").update({ status }).eq("id", params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create a notification for the job seeker
    const notificationMessages: Record<string, string> = {
      reviewed: `Your application for ${application.job.title} has been reviewed`,
      shortlisted: `Great news! You've been shortlisted for ${application.job.title}`,
      accepted: `Congratulations! Your application for ${application.job.title} has been accepted`,
      rejected: `Your application for ${application.job.title} has been reviewed`,
    }

    if (notificationMessages[status]) {
      await supabase.from("notifications").insert({
        user_id: application.job_seeker_id,
        title: "Application Status Update",
        message: notificationMessages[status],
        type: "application_update",
        link: `/dashboard?tab=applications`,
      })
    }

    // TODO: Send email notification
    // In production, you would integrate with an email service like Resend
    // For now, we're just creating in-app notifications

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
