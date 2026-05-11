import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { AuditResult, ToolAuditResult } from '@/types/audit'

type FullResult = AuditResult & { summary?: string }

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('audits')
    .select('audit_result')
    .eq('public_url_id', params.id)
    .single()

  if (!data) return { title: 'AI Spend Audit' }

  const result = data.audit_result as FullResult

  return {
    title: `AI Spend Audit — Save $${result.totalMonthlySavings}/mo`,
    openGraph: {
      title: `I found $${result.totalMonthlySavings}/mo in AI tool savings`,
      description: `Free AI spend audit. Find out if your team is overpaying for Cursor, Claude, ChatGPT and more.`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `I found $${result.totalMonthlySavings}/mo in AI tool savings`,
      description: `Free AI spend audit — takes 2 minutes.`,
    },
  }
}

export default async function PublicAuditPage({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('audits')
    .select('audit_result, created_at')
    .eq('public_url_id', params.id)
    .single()

  if (!data) notFound()

  const result = data.audit_result as FullResult

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-sm text-gray-400 mb-8 text-center">
        Shared audit · {new Date(data.created_at).toLocaleDateString()}
      </p>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-1">
          ${result.totalMonthlySavings.toLocaleString()}
          <span className="text-gray-400 text-2xl">/mo</span>
        </h1>
        <p className="text-green-600 font-medium">
          ${result.totalAnnualSavings.toLocaleString()} in annual savings found
        </p>
      </div>

      {result.summary && (
        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>
      )}

      <div className="space-y-3 mb-10">
        {result.tools.map((tool: ToolAuditResult) => (
          <div key={tool.toolId} className="border rounded-xl p-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{tool.toolName}</span>
              {tool.monthlySavings > 0 && (
                <span className="text-green-600 font-semibold text-sm">
                  Save ${tool.monthlySavings}/mo
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{tool.reason}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        
          <a href={process.env.NEXT_PUBLIC_APP_URL}
          className="inline-block bg-black text-white px-6 py-3 rounded-lg 
                     font-medium hover:bg-gray-800 transition"
        >
          Audit your own AI spend &rarr;
        </a>
      </div>
    </main>
  )
}