"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getProfile() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

export async function updateReferredBy(referralCode: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user already has a referrer
  const { data: profile } = await supabase.from("profiles").select("referred_by").eq("id", user.id).single()

  if (profile?.referred_by) {
    return { success: false, message: "Already has a referrer" }
  }

  // Find the referrer by code
  const { data: referrer } = await supabase.from("profiles").select("id").eq("referral_code", referralCode).single()

  if (!referrer) {
    return { success: false, message: "Invalid referral code" }
  }

  // Update the profile
  const { error: updateError } = await supabase.from("profiles").update({ referred_by: referralCode }).eq("id", user.id)

  if (updateError) {
    throw updateError
  }

  // Create referral record
  await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: user.id,
  })

  revalidatePath("/app")
  return { success: true }
}

export async function getReferralStats() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single()

  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id)

  return {
    referralCode: profile?.referral_code,
    totalReferrals: count || 0,
  }
}
