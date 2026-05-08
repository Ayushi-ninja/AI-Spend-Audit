import { AuditInput, AuditResult, ToolAuditResult, RecommendationType } from '@/types/audit'
import { PRICING } from '@/lib/pricing'
import { v4 as uuidv4 } from 'uuid'

// ─── Individual tool rules ──────────────────────────────────────────

function auditCursor(tool: AuditInput['tools'][0], teamSize: number, useCase: string): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'cursor',
    toolName: 'Cursor',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  // Business for solo or 2-person team is overkill
  if (tool.plan === 'Business' && tool.seats <= 2) {
    const projected = PRICING.cursor.Pro * tool.seats
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: tool.monthlySpend - projected,
      reason: `Cursor Business ($40/seat) includes admin controls and SSO, unnecessary for ${tool.seats} users. Pro ($20/seat) covers the same coding features.`,
    } as ToolAuditResult
  }

  // Non-coding teams paying for Cursor
  if (useCase === 'writing' || useCase === 'data' || useCase === 'research') {
    return {
      ...base,
      recommendation: 'switch',
      recommendedTool: 'Claude Pro',
      projectedSpend: PRICING.claude.Pro * tool.seats,
      monthlySavings: tool.monthlySpend - (PRICING.claude.Pro * tool.seats),
      reason: `Cursor is an AI code editor — for ${useCase} workflows, Claude Pro ($20/seat) provides better value with superior long-context reasoning.`,
    } as ToolAuditResult
  }

  // High spend → credits eligible
  if (tool.monthlySpend >= 200) {
    return {
      ...base,
      recommendation: 'credits',
      projectedSpend: tool.monthlySpend * 0.7,
      monthlySavings: tool.monthlySpend * 0.3,
      reason: `At $${tool.monthlySpend}/mo, Cursor spend qualifies for discounted credits through Credex, typically saving 20–35% on the same plan.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `Cursor Pro at $${tool.monthlySpend}/mo is well-priced for a ${tool.seats}-person coding team. No better alternative at this spend level.`,
  } as ToolAuditResult
}

function auditGithubCopilot(tool: AuditInput['tools'][0], teamSize: number, useCase: string): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  // Enterprise for small team
  if (tool.plan === 'Enterprise' && tool.seats < 10) {
    const projected = PRICING.github_copilot.Business * tool.seats
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Business',
      projectedSpend: projected,
      monthlySavings: tool.monthlySpend - projected,
      reason: `Copilot Enterprise ($39/seat) adds fine-tuned models and enterprise security — not justified for teams under 10. Business ($19/seat) covers the same day-to-day coding assistance.`,
    } as ToolAuditResult
  }

  // Copilot Individual vs Cursor Pro — Cursor is better for heavy coders
  if (tool.plan === 'Individual' && useCase === 'coding') {
    return {
      ...base,
      recommendation: 'switch',
      recommendedTool: 'Cursor Pro',
      projectedSpend: PRICING.cursor.Pro * tool.seats,
      monthlySavings: tool.monthlySpend - (PRICING.cursor.Pro * tool.seats),
      reason: `Cursor Pro ($20/seat) includes a full AI-native IDE with multi-file edits and codebase context. Copilot Individual ($10/seat) only provides inline suggestions — Cursor delivers more capability per dollar for coding-first teams.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `GitHub Copilot ${tool.plan} is appropriately priced for your team size and use case.`,
  } as ToolAuditResult
}

function auditClaude(tool: AuditInput['tools'][0], teamSize: number): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'claude',
    toolName: 'Claude',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  // Team plan for 1-2 users
  if (tool.plan === 'Team' && tool.seats <= 2) {
    const projected = PRICING.claude.Pro * tool.seats
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: tool.monthlySpend - projected,
      reason: `Claude Team ($30/seat, min 5 seats) is designed for collaboration features like shared projects. For ${tool.seats} users, Pro ($20/seat) provides identical model access at lower cost.`,
    } as ToolAuditResult
  }

  // Max plan — check if usage justifies it
  if (tool.plan === 'Max' && tool.seats === 1) {
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: PRICING.claude.Pro,
      monthlySavings: tool.monthlySpend - PRICING.claude.Pro,
      reason: `Claude Max ($100/mo) is for power users hitting Pro's usage limits daily. Unless you're running extended research sessions continuously, Pro ($20/mo) covers typical professional usage.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `Claude ${tool.plan} is appropriate for your team size and usage pattern.`,
  } as ToolAuditResult
}

function auditChatGPT(tool: AuditInput['tools'][0], teamSize: number): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'chatgpt',
    toolName: 'ChatGPT',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  // Team for solo user
  if (tool.plan === 'Team' && tool.seats === 1) {
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Plus',
      projectedSpend: PRICING.chatgpt.Plus,
      monthlySavings: tool.monthlySpend - PRICING.chatgpt.Plus,
      reason: `ChatGPT Team ($30/seat) adds shared workspaces and admin controls — unnecessary for a solo user. Plus ($20/mo) provides identical model access.`,
    } as ToolAuditResult
  }

  // High spend → credits
  if (tool.monthlySpend >= 300) {
    return {
      ...base,
      recommendation: 'credits',
      projectedSpend: tool.monthlySpend * 0.75,
      monthlySavings: tool.monthlySpend * 0.25,
      reason: `At $${tool.monthlySpend}/mo, ChatGPT Enterprise spend qualifies for Credex credits, typically saving 20–30%.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `ChatGPT ${tool.plan} is reasonably priced for your current team configuration.`,
  } as ToolAuditResult
}

function auditAPITool(tool: AuditInput['tools'][0], toolName: string): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: tool.toolId,
    toolName,
    currentPlan: 'Pay-as-you-go',
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  if (tool.monthlySpend >= 500) {
    return {
      ...base,
      recommendation: 'credits',
      projectedSpend: tool.monthlySpend * 0.7,
      monthlySavings: tool.monthlySpend * 0.3,
      reason: `At $${tool.monthlySpend}/mo in API spend, you qualify for volume discounts through Credex credits — typically 25–35% savings on the same token budget.`,
    } as ToolAuditResult
  }

  if (tool.monthlySpend >= 200) {
    return {
      ...base,
      recommendation: 'credits',
      projectedSpend: tool.monthlySpend * 0.8,
      monthlySavings: tool.monthlySpend * 0.2,
      reason: `$${tool.monthlySpend}/mo in API spend is eligible for Credex credit discounts. Most teams at this level save 15–25%.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `API spend of $${tool.monthlySpend}/mo is below the threshold where credit discounts make a material difference.`,
  } as ToolAuditResult
}

function auditGemini(tool: AuditInput['tools'][0], useCase: string): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'gemini',
    toolName: 'Gemini',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  if (tool.plan === 'AI Premium' && useCase === 'coding') {
    return {
      ...base,
      recommendation: 'switch',
      recommendedTool: 'Cursor Pro',
      projectedSpend: PRICING.cursor.Pro * tool.seats,
      monthlySavings: tool.monthlySpend - (PRICING.cursor.Pro * tool.seats),
      reason: `Gemini Advanced ($19.99/seat) is a general assistant. For coding workflows, Cursor Pro ($20/seat) provides an AI-native IDE with codebase awareness — better ROI for engineering teams.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `Gemini ${tool.plan} is cost-effective for your use case.`,
  } as ToolAuditResult
}

function auditWindsurf(tool: AuditInput['tools'][0], teamSize: number): ToolAuditResult {
  const base: Partial<ToolAuditResult> = {
    toolId: 'windsurf',
    toolName: 'Windsurf',
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    seats: tool.seats,
  }

  if (tool.plan === 'Teams' && tool.seats <= 2) {
    const projected = PRICING.windsurf.Pro * tool.seats
    return {
      ...base,
      recommendation: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: projected,
      monthlySavings: tool.monthlySpend - projected,
      reason: `Windsurf Teams ($35/seat) adds admin controls suited for larger groups. For ${tool.seats} users, Pro ($15/seat) provides the same AI coding features at less than half the cost.`,
    } as ToolAuditResult
  }

  return {
    ...base,
    recommendation: 'keep',
    projectedSpend: tool.monthlySpend,
    monthlySavings: 0,
    reason: `Windsurf ${tool.plan} is well-matched to your team size.`,
  } as ToolAuditResult
}

// ─── Main engine ───────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const results: ToolAuditResult[] = input.tools.map(tool => {
    switch (tool.toolId) {
      case 'cursor':
        return auditCursor(tool, input.teamSize, input.useCase)
      case 'github_copilot':
        return auditGithubCopilot(tool, input.teamSize, input.useCase)
      case 'claude':
        return auditClaude(tool, input.teamSize)
      case 'chatgpt':
        return auditChatGPT(tool, input.teamSize)
      case 'anthropic_api':
        return auditAPITool(tool, 'Anthropic API')
      case 'openai_api':
        return auditAPITool(tool, 'OpenAI API')
      case 'gemini':
        return auditGemini(tool, input.useCase)
      case 'windsurf':
        return auditWindsurf(tool, input.teamSize)
      default:
        return {
          toolId: tool.toolId,
          toolName: tool.toolId,
          currentPlan: tool.plan,
          currentSpend: tool.monthlySpend,
          seats: tool.seats,
          recommendation: 'keep',
          projectedSpend: tool.monthlySpend,
          monthlySavings: 0,
          reason: 'No optimization found for this tool.',
        } as ToolAuditResult
    }
  })

  const totalMonthlySavings = results.reduce((sum, r) => sum + r.monthlySavings, 0)

  return {
    auditId: uuidv4(),
    createdAt: new Date().toISOString(),
    input,
    tools: results,
    totalMonthlySavings: Math.round(totalMonthlySavings),
    totalAnnualSavings: Math.round(totalMonthlySavings * 12),
    highSavings: totalMonthlySavings > 500,
    alreadyOptimal: totalMonthlySavings < 100,
  }
}