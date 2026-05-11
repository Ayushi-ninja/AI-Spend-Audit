type AuditEmailProps = {
  email: string
  totalMonthlySavings: number
  totalAnnualSavings: number
  toolCount: number
  highSavings: boolean
  alreadyOptimal: boolean
  shareUrl: string
}

export function buildAuditEmail(props: AuditEmailProps): string {
  const {
    totalMonthlySavings,
    totalAnnualSavings,
    toolCount,
    highSavings,
    alreadyOptimal,
    shareUrl,
  } = props

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your AI Spend Audit</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
             background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; 
              border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    
    <!-- Header -->
    <div style="background: #000; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
        AI Spend Audit
      </h1>
      <p style="color: #9ca3af; margin: 8px 0 0; font-size: 14px;">
        Your personalized results
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      ${alreadyOptimal ? `
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="font-size: 32px; margin: 0;">✓</p>
          <h2 style="font-size: 22px; color: #16a34a; margin: 8px 0;">
            You're spending well
          </h2>
          <p style="color: #6b7280; font-size: 15px; margin: 0;">
            Less than $100/mo in potential savings detected across 
            your ${toolCount} AI tools.
          </p>
        </div>
      ` : `
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">
            Potential savings found
          </p>
          <h2 style="font-size: 40px; font-weight: 800; color: #111827; margin: 0;">
            $${totalMonthlySavings.toLocaleString()}/mo
          </h2>
          <p style="font-size: 18px; color: #16a34a; font-weight: 600; margin: 8px 0 0;">
            $${totalAnnualSavings.toLocaleString()} saved annually
          </p>
        </div>
      `}

      <!-- Divider -->
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

      <!-- View full report -->
      <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">
        Your full audit report — including per-tool breakdown and 
        recommendations — is available at your unique link:
      </p>

      <a href="${shareUrl}" 
         style="display: block; background: #000; color: white; text-align: center;
                padding: 14px; border-radius: 8px; text-decoration: none;
                font-weight: 600; font-size: 15px; margin-bottom: 24px;">
        View My Full Report
      </a>

      ${highSavings ? `
        <!-- Credex CTA -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; 
                    border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 700; color: #166534; margin: 0 0 8px; font-size: 15px;">
            You qualify for a Credex consultation
          </p>
          <p style="color: #15803d; font-size: 14px; margin: 0 0 12px;">
            Your AI spend level qualifies for discounted credits through Credex — 
            typically saving an additional 20-35% on the same tools.
          </p>
          <a href="https://credex.rocks" 
             style="color: #166534; font-weight: 600; font-size: 14px;">
            Learn more at credex.rocks &rarr;
          </a>
        </div>
      ` : ''}

      <!-- Footer note -->
      <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
        This audit was generated based on your inputs. 
        Pricing data verified as of submission week.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 32px; 
                border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        AI Spend Audit &mdash; a free tool by Credex &middot; 
        <a href="https://credex.rocks" style="color: #9ca3af;">credex.rocks</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}