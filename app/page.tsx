import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, Building2, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobInternHub</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">Find Your Dream Job or Internship</h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Connect with top employers and discover opportunities that match your skills and aspirations. Start your
          career journey today.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/signup?role=job_seeker">
            <Button size="lg">Find Jobs</Button>
          </Link>
          <Link href="/auth/signup?role=employer">
            <Button size="lg" variant="outline">
              Post a Job
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Why Choose JobInternHub?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">For Job Seekers</h3>
            <p className="text-gray-600">
              Browse thousands of opportunities, apply with ease, and track your applications all in one place.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">For Employers</h3>
            <p className="text-gray-600">
              Post jobs, manage applications, and find the perfect candidates for your team quickly and efficiently.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Smart Matching</h3>
            <p className="text-gray-600">
              Our platform helps connect the right talent with the right opportunities using advanced filtering.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-blue-600 px-8 py-16 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of job seekers and employers who trust JobInternHub for their career needs.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 JobInternHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
