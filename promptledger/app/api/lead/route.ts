import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, company, role, publicUrlId } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Update the existing audit row with email
    const { error } = await supabase
      .from('audits')
      .update({ email, company_name: company, role })
      .eq('public_url_id', publicUrlId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead capture error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}