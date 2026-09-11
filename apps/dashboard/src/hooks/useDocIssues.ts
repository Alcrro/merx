import { useQuery } from '@tanstack/react-query'
import { GITHUB_REPO, githubHeaders } from '../lib/github'

export interface GitHubDocIssue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  body: string | null
  labels: { name: string; color: string }[]
  updated_at: string
  pull_request?: unknown
}

const PRIORITY_RE = /^P[1-4]$/i
const EXCLUDED_LABELS = new Set([
  'api', 'dashboard', 'storefront', 'www', 'database', 'email', 'queue', 'webhook', 'ui-component',
  'gap', 'epic', 'decision', 'brainstorming', 'mvp', 'docs',
  'tier:0', 'tier:1', 'tier:2',
  'app:api', 'app:dashboard', 'app:storefront', 'app:www',
])

export function getFeatureGroup(issue: GitHubDocIssue, section: string): string {
  const feature = issue.labels.find(
    l => l.name !== section && !PRIORITY_RE.test(l.name) && !EXCLUDED_LABELS.has(l.name)
  )
  return feature?.name ?? 'general'
}

export function stripPrefix(title: string): string {
  return title.replace(/^\[[^\]]+\]\s*/, '')
}

async function fetchAll(): Promise<GitHubDocIssue[]> {
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
  const data = (await res.json()) as GitHubDocIssue[]
  return data.filter(i => !i.pull_request)
}

export function useAllIssues() {
  return useQuery({
    queryKey: ['all-issues'],
    queryFn: fetchAll,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
