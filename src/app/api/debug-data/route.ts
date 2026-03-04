import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Service Role Key um RLS zu umgehen
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any = {}

  // 1. Alle Tabellen prüfen
  try {
    const { data: analyses, error: aErr } = await supabase
      .from('analyses')
      .select('*')
      .limit(20)
    results.analyses = { count: analyses?.length || 0, error: aErr?.message, sample: analyses?.[0] ? Object.keys(analyses[0]) : [] }
  } catch (e: unknown) { results.analyses = { error: e instanceof Error ? e.message : String(e) } }

  try {
    const { data: portfolio, error: pErr } = await supabase
      .from('portfolio_properties')
      .select('*')
      .limit(20)
    results.portfolio = { count: portfolio?.length || 0, error: pErr?.message, sample: portfolio?.[0] ? Object.keys(portfolio[0]) : [] }
  } catch (e: unknown) { results.portfolio = { error: e instanceof Error ? e.message : String(e) } }

  try {
    const { data: strategies, error: sErr } = await supabase
      .from('strategies')
      .select('*')
      .limit(20)
    results.strategies = { count: strategies?.length || 0, error: sErr?.message }
  } catch (e: unknown) { results.strategies = { error: e instanceof Error ? e.message : String(e) } }

  try {
    const { data: leads, error: lErr } = await supabase
      .from('financing_leads')
      .select('*')
      .limit(20)
    results.leads = { count: leads?.length || 0, error: lErr?.message }
  } catch (e: unknown) { results.leads = { error: e instanceof Error ? e.message : String(e) } }

  try {
    const { data: profiles, error: prErr } = await supabase
      .from('profiles')
      .select('*')
      .limit(20)
    results.profiles = { count: profiles?.length || 0, error: prErr?.message }
  } catch (e: unknown) { results.profiles = { error: e instanceof Error ? e.message : String(e) } }

  // 2. Alle User-IDs in analyses
  try {
    const { data } = await supabase.from('analyses').select('user_id, save_type, created_at, address, city, total_score').order('created_at', { ascending: false }).limit(50)
    results.all_analyses_detail = data
  } catch (e: unknown) { results.all_analyses_detail = { error: e instanceof Error ? e.message : String(e) } }

  // 3. Auth Users prüfen
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    results.users = users?.map(u => ({ id: u.id, email: u.email, created: u.created_at })) || []
    results.users_error = error?.message
  } catch (e: unknown) { results.users_error = e instanceof Error ? e.message : String(e) }

  return NextResponse.json(results, { status: 200 })
}
