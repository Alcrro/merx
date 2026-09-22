import Link from 'next/link'
import type { DropdownItem } from './NavDropdown'

interface NavDropdownPanelProps {
  id: string
  items: DropdownItem[]
  onClose: () => void
  visible: boolean
}

export function NavDropdownPanel({ id, items, onClose, visible }: NavDropdownPanelProps) {
  return (
    <ul
      id={id}
      className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-2xl border border-line bg-surface-elevated shadow-xl shadow-gray-200/60 dark:shadow-none ring-1 ring-black/5 z-50 overflow-hidden p-2 list-none ${
        visible
          ? 'animate-in fade-in slide-in-from-top-1 duration-150'
          : 'animate-out fade-out slide-out-to-top-1 duration-150'
      }`}
    >
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onClose}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            {item.icon && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                {item.icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-fg">{item.label}</p>
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
