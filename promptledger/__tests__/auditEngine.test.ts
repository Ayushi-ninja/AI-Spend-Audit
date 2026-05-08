import { runAudit } from '@/lib/auditEngine'
import { AuditInput } from '@/types/audit'

test('recommends downgrade from Cursor Business to Pro for 2 users', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'cursor', plan: 'Business', monthlySpend: 80, seats: 2 }],
    teamSize: 2,
    useCase: 'coding',
  }
  const result = runAudit(input)
  expect(result.tools[0].recommendation).toBe('downgrade')
  expect(result.tools[0].recommendedPlan).toBe('Pro')
  expect(result.tools[0].monthlySavings).toBe(40)
})

test('recommends keep for well-configured Cursor Pro', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 60, seats: 3 }],
    teamSize: 3,
    useCase: 'coding',
  }
  const result = runAudit(input)
  expect(result.tools[0].recommendation).toBe('keep')
  expect(result.tools[0].monthlySavings).toBe(0)
})

test('recommends downgrade from Claude Team to Pro for solo user', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'claude', plan: 'Team', monthlySpend: 30, seats: 1 }],
    teamSize: 1,
    useCase: 'writing',
  }
  const result = runAudit(input)
  expect(result.tools[0].recommendation).toBe('downgrade')
  expect(result.tools[0].monthlySavings).toBeGreaterThan(0)
})

test('flags high API spend as credits-eligible', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'anthropic_api', plan: 'Pay-as-you-go', monthlySpend: 600, seats: 1 }],
    teamSize: 5,
    useCase: 'mixed',
  }
  const result = runAudit(input)
  expect(result.tools[0].recommendation).toBe('credits')
  expect(result.totalMonthlySavings).toBeGreaterThan(100)
})

test('marks audit as alreadyOptimal when total savings under $100', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'cursor', plan: 'Pro', monthlySpend: 40, seats: 2 }],
    teamSize: 2,
    useCase: 'coding',
  }
  const result = runAudit(input)
  expect(result.alreadyOptimal).toBe(true)
})

test('calculates correct annual savings', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'cursor', plan: 'Business', monthlySpend: 160, seats: 4 }],
    teamSize: 4,
    useCase: 'coding',
  }
  const result = runAudit(input)
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
})