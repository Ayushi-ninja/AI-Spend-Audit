import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { buildAuditEmail } from '@/lib/emailTemplate'
import { checkRateLimit } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? 
                req.headers.get('x-real-ip') ?? 
                '127.0.0.1'
    
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) }
        }
      )
    }

    const body = await req.json()
    const { email, company, role, publicUrlId } = body

    // Honeypot check
    if (body.website) {
      // Silently accept but don't process — bot detected
      return NextResponse.json({ success: true })
    }

    // Validate email
    if (!email || !email.includes('@') || email.length < 5) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Get audit data from Supabase
    const { data: auditData, error: fetchError } = await supabase
      .from('audits')
      .select('audit_result')
      .eq('public_url_id', publicUrlId)
      .single()

    if (fetchError || !auditData) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    const auditResult = auditData.audit_result

    // Update audit row with lead info
    const { error: updateError } = await supabase
      .from('audits')
      .update({ email, company_name: company, role })
      .eq('public_url_id', publicUrlId)

    if (updateError) throw updateError

    // Send confirmation email
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/audit/${publicUrlId}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: email,
      subject: `Your AI Spend Audit — Save $${auditResult.totalMonthlySavings}/mo`,
      html: buildAuditEmail({
        email,
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        toolCount: auditResult.tools?.length ?? 0,
        highSavings: auditResult.highSavings,
        alreadyOptimal: auditResult.alreadyOptimal,
        shareUrl,
      }),
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Lead capture error:', err)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}