export const GITHUB_REPO: string =
  (import.meta.env.VITE_GITHUB_REPO as string | undefined) ?? 'alcrro/merx'

export function getGithubToken(): string {
  return (
    (import.meta.env.VITE_GITHUB_TOKEN as string | undefined) ??
    localStorage.getItem('github_token') ??
    ''
  )
}

export function githubHeaders(): Record<string, string> {
  const token = getGithubToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
