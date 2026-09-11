import { useQuery } from '@tanstack/react-query'
import { GITHUB_REPO, githubHeaders } from '../lib/github'

export const APPS = ['api', 'dashboard', 'storefront', 'www'] as const
export type App = (typeof APPS)[number]

export const APP_LABEL: Record<App, string> = {
  api: 'API',
  dashboard: 'Dashboard',
  storefront: 'Storefront',
  www: 'WWW',
}

export const TIERS = [0, 1, 2] as const
export type Tier = (typeof TIERS)[number]

export const TIER_LABEL: Record<Tier, string> = {
  0: 'Tier 0 — Blocante',
  1: 'Tier 1 — Important',
  2: 'Tier 2 — Diferențiator',
}

export interface TaskNode {
  key: string
  number: number | null
  title: string
  state: 'open' | 'closed'
  html_url: string | null
  checked: boolean
  children: TaskNode[]
}

export interface Epic {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  body: string | null
  labels: { name: string; color: string }[]
  children: TaskNode[]
  done: number
  total: number
  pull_request?: unknown
}

interface RawIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  body: string | null
  labels: { name: string; color: string }[]
  pull_request?: unknown
}

interface ParsedItem {
  checked: boolean
  text: string
  issueNumber: number | null
}

function parseTaskList(body: string | null): ParsedItem[] {
  if (!body) return []
  return body
    .split('\n')
    .filter(l => /^\s*- \[[ xX]\]/.test(l))
    .map(l => {
      const checked = /^\s*- \[[xX]\]/.test(l)
      const text = l.replace(/^\s*- \[[ xX]\]\s*/i, '').trim()
      const match = text.match(/^#(\d+)/)
      return { checked, text, issueNumber: match ? parseInt(match[1], 10) : null }
    })
}

async function fetchEpics(): Promise<Epic[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...githubHeaders(),
      },
    }
  )

  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)

  const all = (await res.json()) as RawIssue[]
  const byNumber = new Map(all.filter(i => !i.pull_request).map(i => [i.number, i]))

  return all
    .filter(i => !i.pull_request && i.title.startsWith('[EPIC]'))
    .map(epic => {
      const taskItems = parseTaskList(epic.body)

      const children: TaskNode[] = taskItems.map((item, idx) => {
        const linked = item.issueNumber ? byNumber.get(item.issueNumber) : undefined
        const subItems = linked ? parseTaskList(linked.body) : []

        const subChildren: TaskNode[] = subItems.map((sub, sidx) => {
          const subLinked = sub.issueNumber ? byNumber.get(sub.issueNumber) : undefined
          return {
            key: `${epic.number}-${idx}-${sidx}`,
            number: subLinked?.number ?? sub.issueNumber,
            title: subLinked?.title ?? sub.text,
            state: subLinked?.state ?? (sub.checked ? 'closed' : 'open'),
            html_url: subLinked?.html_url ?? null,
            checked: sub.checked || subLinked?.state === 'closed',
            children: [],
          }
        })

        const isChecked = item.checked || linked?.state === 'closed'
        return {
          key: `${epic.number}-${idx}`,
          number: linked?.number ?? item.issueNumber,
          title: linked?.title ?? item.text,
          state: linked?.state ?? (isChecked ? 'closed' : 'open'),
          html_url: linked?.html_url ?? null,
          checked: isChecked,
          children: subChildren,
        }
      })

      const done = children.filter(c => c.checked).length
      return { ...epic, children, done, total: children.length }
    })
}

export function useEpics() {
  return useQuery({
    queryKey: ['epics'],
    queryFn: fetchEpics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function getEpicTier(epic: Epic): Tier | null {
  const names = epic.labels.map(l => l.name)
  if (names.includes('tier:0') || names.includes('P1')) return 0
  if (names.includes('tier:1') || names.includes('P2')) return 1
  if (names.includes('tier:2') || names.includes('P3') || names.includes('P4')) return 2
  return null
}

export function getEpicApp(epic: Epic): App | null {
  const names = epic.labels.map(l => l.name)
  for (const app of APPS) {
    if (names.includes(`app:${app}`) || names.includes(app)) return app
  }
  return null
}
