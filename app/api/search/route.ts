import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Search jobs based on query
    let jobsQuery = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(*)
      `)
      .eq("is_active", true)

    // Apply text search
    if (query) {
      jobsQuery = jobsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    }

    // Apply filters
    if (type !== "all") {
      jobsQuery = jobsQuery.eq("job_type", type)
    }

    const { data: jobs, error } = await jobsQuery.order("created_at", { ascending: false }).limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
