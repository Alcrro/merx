import { z } from 'zod'
import { OpenAIProvider } from '@merx/llm-provider'

const llm = new OpenAIProvider()

export interface DuplicateCluster {
  canonical: { id: string; title: string }
  duplicates: { id: string; title: string }[]
}

const clusterSchema = z.object({
  clusters: z.array(z.object({
    canonical_id: z.string(),
    duplicate_ids: z.array(z.string()),
  })),
})

export async function analyzeRequestDuplicates(
  requests: { id: string; requestedTitle: string; category: string | null }[]
): Promise<DuplicateCluster[]> {
  if (requests.length < 2) return []

  const list = requests.map((r, i) => `${i + 1}. [${r.id}] "${r.requestedTitle}"${r.category ? ` (${r.category})` : ''}`).join('\n')

  const response = await llm.chat([
    {
      role: 'system',
      content: `Ești un sistem de deduplicare a cererilor de produse. Primești o listă de cereri și trebuie să identifici grupuri de cereri care se referă la același produs (chiar dacă titlurile diferă ușor — typo-uri, ordine cuvinte, variații minore).

Răspunde EXCLUSIV cu JSON valid, fără markdown:
{
  "clusters": [
    { "canonical_id": "id-ul cel mai bun/complet", "duplicate_ids": ["id1", "id2"] }
  ]
}

Reguli:
- Include în "clusters" DOAR grupurile cu cel puțin 2 cereri similare
- "canonical_id" = cererea cu titlul cel mai complet/corect
- "duplicate_ids" = restul cererilor din grup (fără canonical)
- Dacă o cerere nu are similare, nu o include
- "galaxy s20 ultra 5g" și "samsung galaxy s20 ultra 5g" sunt duplicate
- Produse diferite (ex: telefon vs ceas) NU sunt duplicate`,
    },
    {
      role: 'user',
      content: `Analizează aceste cereri de produse și grupează duplicatele:\n\n${list}`,
    },
  ])

  const content = response.content?.trim() ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []

  let parsed
  try {
    parsed = clusterSchema.parse(JSON.parse(jsonMatch[0]))
  } catch {
    return []
  }

  const idToRequest = new Map(requests.map((r) => [r.id, r]))

  return parsed.clusters
    .map((c) => {
      const canonical = idToRequest.get(c.canonical_id)
      if (!canonical) return null
      const duplicates = c.duplicate_ids
        .map((id) => idToRequest.get(id))
        .filter((r): r is NonNullable<typeof r> => !!r && r.id !== c.canonical_id)
        .map((r) => ({ id: r.id, title: r.requestedTitle }))
      if (!duplicates.length) return null
      return {
        canonical: { id: canonical.id, title: canonical.requestedTitle },
        duplicates,
      }
    })
    .filter((c): c is DuplicateCluster => c !== null)
}
