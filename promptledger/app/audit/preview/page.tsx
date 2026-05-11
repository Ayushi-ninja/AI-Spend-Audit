'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runAudit } from '@/lib/auditEngine'
import { AuditInput, AuditResult } from '@/types/audit'

type FullResult = AuditResult & { summary?: string; publicUrlId?: string }

const RECOMMENDATION_LABELS = {
  downgrade: { label: 'Downgrade Plan', color: 'bg-yellow-100 text-yellow-800' },
  switch: { label: 'Switch Tool', color: 'bg-blue-100 text-blue-800' },
  keep: { label: 'Already Optimal', color: 'bg-green-100 text-green-800' },
  credits: { label: 'Buy via Credits', color: 'bg-purple-100 text-purple-800' },
}

export default function PreviewPage() {
  const [result, setResult] = useState<FullResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('audit-input')
    if (!saved) {
      router.push('/')
      return
    }

    const input: AuditInput = JSON.parse(saved)

    // Run audit locally immediately for instant display
    const localResult = runAudit(input)
    setResult(localResult)
    setLoading(false)

    // Then call API for summary + save to Supabase
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.auditResult) {
          setResult({
            ...data.auditResult,
            publicUrlId: data.publicUrlId,
          })
        }
      })
      .catch(console.error)
  }, [])

  const shareUrl = result?.publicUrlId
    ? `${process.env.NEXT_PUBLIC_APP_URL}/audit/${result.publicUrlId}`
    : null

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !result) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
        </div>
        <p className="text-gray-500 mt-8">Running your audit...</p>
      </main>
    )
  }

  const totalCurrentSpend = result.tools.reduce((s, t) => s + t.currentSpend, 0)

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          AI Spend Audit Complete
        </p>
        {result.alreadyOptimal ? (
          <>
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              You're spending well ✓
            </h1>
            <p className="text-gray-500">
              Less than $100/mo in potential savings detected. Your stack is well-optimized.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-gray-900 mb-1">
              Save ${result.totalMonthlySavings.toLocaleString()}
              <span className="text-gray-400 text-3xl">/mo</span>
            </h1>
            <p className="text-2xl text-green-600 font-semibold mb-2">
              ${result.totalAnnualSavings.toLocaleString()} saved annually
            </p>
            <p className="text-gray-500 text-sm">
              Currently spending ${totalCurrentSpend}/mo across {result.tools.length} tools
            </p>
          </>
        )}
      </div>

      {/* AI Summary */}
      {result.summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            AI Analysis
          </p>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>
      )}

      {/* Credex CTA — only for high savings */}
      {result.highSavings && (
        <div className="bg-black text-white rounded-xl p-6 mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Capture more savings
          </p>
          <h2 className="text-xl font-bold mb-2">
            You could save an additional 20–35% through Credex
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Credex sells discounted AI credits — Cursor, Claude, ChatGPT Enterprise — 
            from companies that overforecast. Your spend qualifies for a consultation.
          </p>
          
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-black px-5 py-2.5 rounded-lg 
                       font-medium text-sm hover:bg-gray-100 transition"
          >
            Book a Credex Consultation →
          </a>
        </div>
      )}

      {/* Per-tool breakdown */}
      <h2 className="text-lg font-semibold mb-4">Tool-by-tool breakdown</h2>
      <div className="space-y-3 mb-10">
        {result.tools.map(tool => {
          const badge = RECOMMENDATION_LABELS[tool.recommendation]
          return (
            <div
              key={tool.toolId}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900">{tool.toolName}</span>
                  <span className="text-sm text-gray-400 ml-2">{tool.currentPlan}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex gap-6 text-sm mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Current</p>
                  <p className="font-medium">${tool.currentSpend}/mo</p>
                </div>
                {tool.recommendation !== 'keep' && (
                  <>
                    <div className="text-gray-300">→</div>
                    <div>
                      <p className="text-gray-400 text-xs">Recommended</p>
                      <p className="font-medium">
                        ${tool.projectedSpend}/mo
                        {tool.recommendedPlan && ` · ${tool.recommendedPlan}`}
                        {tool.recommendedTool && ` · ${tool.recommendedTool}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Saves</p>
                      <p className="font-semibold text-green-600">
                        ${tool.monthlySavings}/mo
                      </p>
                    </div>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">{tool.reason}</p>
            </div>
          )
        })}
      </div>

      {/* Share URL */}
      {shareUrl && (
        <div className="border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Share your audit
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 
                         text-sm text-gray-500 bg-gray-50"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg 
                         hover:bg-gray-800 transition"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Email capture — shown after value */}
      <EmailCapture
        publicUrlId={result.publicUrlId}
        alreadyOptimal={result.alreadyOptimal}
      />

      {/* Start over */}
      <div className="text-center mt-8">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          ← Run another audit
        </button>
      </div>

    </main>
  )
}

// ─── Email Capture Component ─────────────────────────────────────

function EmailCapture({
  publicUrlId,
  alreadyOptimal,
}: {
  publicUrlId?: string
  alreadyOptimal: boolean
}) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  // Honeypot field — hidden from real users
  const [honeypot, setHoneypot] = useState('')

  const handleSubmit = async () => {
    // Honeypot check — bots fill hidden fields
    if (honeypot) return

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role, publicUrlId }),
      })
      setSubmitted(true)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-5 text-center">
        <p className="text-green-700 font-medium">✓ Report sent to {email}</p>
        <p className="text-green-600 text-sm mt-1">
          {alreadyOptimal
            ? "We'll notify you when new optimizations apply to your stack."
            : "We'll be in touch about your savings opportunities."}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-1">
        {alreadyOptimal
          ? 'Get notified when optimizations apply to your stack'
          : 'Get your full report by email'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        No spam. One email with your audit summary.
      </p>

      {/* Honeypot — hidden from real users, bots fill this */}
      <input
        type="text"
        value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="space-y-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-2.5 rounded-lg text-sm 
                     font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? 'Sending...' : 'Send my report →'}
        </button>
      </div>
    </div>
  )
}