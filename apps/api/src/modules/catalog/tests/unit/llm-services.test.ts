import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContentModerationService } from '../../application/services/content-moderation.service'
import { GenerateVariantsService } from '../../application/services/generate-variants.service'
import { VariantClassifierService } from '../../application/services/variant-classifier.service'
import type { LLMProvider, LLMResponse } from '@merx/llm-provider'
import type { IAIToolCriteriaRepository, IModerationRepository } from '../../domain/ports'

function makeLlmResponse(content: string): LLMResponse {
  return { content }
}

// ─── ContentModerationService ─────────────────────────────────────────────────

describe('ContentModerationService', () => {
  let llm: LLMProvider
  let criteriaRepo: IAIToolCriteriaRepository
  let moderationRepo: IModerationRepository
  let service: ContentModerationService

  beforeEach(() => {
    llm = { chat: vi.fn().mockResolvedValue(makeLlmResponse('{"approved": true}')), stream: vi.fn() }
    criteriaRepo = { findTextByTool: vi.fn().mockResolvedValue([]) }
    moderationRepo = {
      findProduct: vi.fn().mockResolvedValue({ title: 'T-Shirt', description: null }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    }
    service = new ContentModerationService(llm, criteriaRepo, moderationRepo)
  })

  it('sets status to active when AI approves', async () => {
    await service.moderateProduct('p1')
    expect(moderationRepo.updateStatus).toHaveBeenCalledWith('p1', 'active')
  })

  it('sets status to pending when AI rejects', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('{"approved": false, "reason": "Inappropriate"}'))
    await service.moderateProduct('p1')
    expect(moderationRepo.updateStatus).toHaveBeenCalledWith('p1', 'pending')
  })

  it('returns early without updating when product not found', async () => {
    vi.mocked(moderationRepo.findProduct).mockResolvedValue(null)
    await service.moderateProduct('x')
    expect(llm.chat).not.toHaveBeenCalled()
    expect(moderationRepo.updateStatus).not.toHaveBeenCalled()
  })

  it('returns early without updating when AI throws', async () => {
    vi.mocked(llm.chat).mockRejectedValue(new Error('LLM unavailable'))
    await service.moderateProduct('p1')
    expect(moderationRepo.updateStatus).not.toHaveBeenCalled()
  })

  it('defaults to approved when AI returns unparseable response', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('not json at all'))
    await service.moderateProduct('p1')
    expect(moderationRepo.updateStatus).toHaveBeenCalledWith('p1', 'active')
  })

  it('defaults to approved when AI returns invalid JSON structure', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('{invalid json}'))
    await service.moderateProduct('p1')
    expect(moderationRepo.updateStatus).toHaveBeenCalledWith('p1', 'active')
  })

  it('includes criteria block in prompt when criteria exist', async () => {
    vi.mocked(criteriaRepo.findTextByTool).mockResolvedValue(['No violence', 'No adult content'])
    await service.moderateProduct('p1')
    const call = vi.mocked(llm.chat).mock.calls[0][0]
    const systemMsg = call.find((m) => m.role === 'system')
    expect(systemMsg?.content).toContain('No violence')
  })
})

// ─── GenerateVariantsService ──────────────────────────────────────────────────

describe('GenerateVariantsService', () => {
  let llm: LLMProvider
  let service: GenerateVariantsService

  const validResponse = JSON.stringify({
    variants: [
      { title: 'T-Shirt Bronze/128GB', sku: 'TS-BRONZE-128', suggestedPrice: 99.99 },
    ],
  })

  beforeEach(() => {
    llm = { chat: vi.fn().mockResolvedValue(makeLlmResponse(validResponse)), stream: vi.fn() }
    service = new GenerateVariantsService(llm)
  })

  it('returns parsed variants on valid response', async () => {
    const result = await service.generate('T-Shirt', [], 'Bronze')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('T-Shirt Bronze/128GB')
    expect(result[0].suggestedPrice).toBe(99.99)
  })

  it('throws when AI returns no JSON', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('no json here'))
    await expect(service.generate('T-Shirt', [], 'Bronze')).rejects.toThrow('AI returned no valid JSON')
  })

  it('throws when AI returns invalid schema (missing sku)', async () => {
    vi.mocked(llm.chat).mockResolvedValue(
      makeLlmResponse(JSON.stringify({ variants: [{ title: 'X', suggestedPrice: 10 }] }))
    )
    await expect(service.generate('T-Shirt', [], 'Bronze')).rejects.toThrow()
  })

  it('throws when variants array is empty', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse(JSON.stringify({ variants: [] })))
    await expect(service.generate('T-Shirt', [], 'Bronze')).rejects.toThrow()
  })

  it('includes existing variants in prompt', async () => {
    const existing = [{ title: 'Black/128GB', sku: 'TS-BLK-128', suggestedPrice: 99 }]
    await service.generate('T-Shirt', existing, 'Bronze')
    const call = vi.mocked(llm.chat).mock.calls[0][0]
    const userMsg = call.find((m) => m.role === 'user')
    expect(userMsg?.content).toContain('Black/128GB')
  })

  it('handles JSON embedded in surrounding text', async () => {
    const wrapped = `Sure! Here you go:\n${validResponse}\nHope that helps!`
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse(wrapped))
    const result = await service.generate('T-Shirt', [], 'Bronze')
    expect(result).toHaveLength(1)
  })
})

// ─── VariantClassifierService ─────────────────────────────────────────────────

describe('VariantClassifierService', () => {
  let llm: LLMProvider
  let criteriaRepo: IAIToolCriteriaRepository
  let service: VariantClassifierService

  beforeEach(() => {
    llm = { chat: vi.fn().mockResolvedValue(makeLlmResponse('{"type":"variant","confidence":"high","reason":"Same product"}')), stream: vi.fn() }
    criteriaRepo = { findTextByTool: vi.fn().mockResolvedValue([]) }
    service = new VariantClassifierService(llm, criteriaRepo)
  })

  it('returns parsed classification on valid response', async () => {
    const result = await service.classify('T-Shirt Red L', 'T-Shirt')
    expect(result.type).toBe('variant')
    expect(result.confidence).toBe('high')
    expect(result.reason).toBe('Same product')
  })

  it('returns variant/low fallback when response is unparseable', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('not json'))
    const result = await service.classify('X', 'Y')
    expect(result.type).toBe('variant')
    expect(result.confidence).toBe('low')
  })

  it('returns variant/low fallback when JSON has invalid schema', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('{"type":"unknown","confidence":"high"}'))
    const result = await service.classify('X', 'Y')
    expect(result.type).toBe('variant')
    expect(result.confidence).toBe('low')
  })

  it('can return new_product classification', async () => {
    vi.mocked(llm.chat).mockResolvedValue(makeLlmResponse('{"type":"new_product","confidence":"high","reason":"Different category"}'))
    const result = await service.classify('Laptop Stand', 'T-Shirt')
    expect(result.type).toBe('new_product')
    expect(result.confidence).toBe('high')
  })

  it('includes admin criteria in system prompt when present', async () => {
    vi.mocked(criteriaRepo.findTextByTool).mockResolvedValue(['Treat accessories as variants'])
    await service.classify('Phone Case', 'Phone')
    const call = vi.mocked(llm.chat).mock.calls[0][0]
    const systemMsg = call.find((m) => m.role === 'system')
    expect(systemMsg?.content).toContain('Treat accessories as variants')
  })
})
