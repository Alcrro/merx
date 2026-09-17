import { COOKIES_TABLE, TYPE_BADGE } from '@/features/cookies/config'

const TABLE_HEADERS = ['Nume', 'Provider', 'Scop', 'Tip', 'Durată'] as const

export function CookiesTable() {
  return (
    <div id="tabel" className="scroll-mt-8">
      <h2 className="text-lg font-bold text-fg mb-4">3. Lista completă a cookie-urilor</h2>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-line">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-3 font-semibold text-fg-subtle uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {COOKIES_TABLE.map((row) => (
              <tr key={row.name} className="align-top">
                <td className="py-3 px-3 font-mono text-fg font-medium">{row.name}</td>
                <td className="py-3 px-3 text-fg-muted">{row.provider}</td>
                <td className="py-3 px-3 text-fg-muted">{row.purpose}</td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${TYPE_BADGE[row.type]}`}>
                    {row.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-fg-muted whitespace-nowrap">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
