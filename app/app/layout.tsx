import type React from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single()

  const isPro = profile?.plan === "pro"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isPro={isPro} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={{ email: user.email, name: user.user_metadata?.name }} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  )
}
