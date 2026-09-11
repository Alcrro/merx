import { useQuery } from '@tanstack/react-query'
import { GITHUB_REPO, githubHeaders } from '../lib/github'

export interface GitHubLabel {
  name: string
  color: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  labels: GitHubLabel[]
  created_at: string
  closed_at: string | null
  pull_request?: unknown
}

async function fetchMvpIssues(): Promise<GitHubIssue[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues?labels=mvp&state=all&per_page=100`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...githubHeaders(),
      },
    }
  )

  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)

  const data: GitHubIssue[] = await res.json()
  return data.filter(i => !i.pull_request)
}

export function useMvpIssues() {
  return useQuery({
    queryKey: ['mvp-issues'],
    queryFn: fetchMvpIssues,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

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

export function getIssueTier(issue: GitHubIssue): Tier | null {
  const names = issue.labels.map(l => l.name)
  if (names.includes('tier:0')) return 0
  if (names.includes('tier:1')) return 1
  if (names.includes('tier:2')) return 2
  return null
}

export function getIssueApp(issue: GitHubIssue): App | null {
  const names = issue.labels.map(l => l.name)
  for (const app of APPS) {
    if (names.includes(`app:${app}`)) return app
  }
  return null
}
