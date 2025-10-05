import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, cover_letter } = body

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("job_seeker_id", user.id)
      .eq("job_id", job_id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from("applications")
      .insert({
        job_seeker_id: user.id,
        job_id,
        cover_letter,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: job } = await supabase
      .from("jobs")
      .select(`
        *,
        company:companies(
          employer_id
        )
      `)
      .eq("id", job_id)
      .single()

    if (job?.company?.employer_id) {
      await supabase.from("notifications").insert({
        user_id: job.company.employer_id,
        title: "New Application Received",
        message: `Someone applied for ${job.title}`,
        type: "application",
        link: `/employer/applications`,
      })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
