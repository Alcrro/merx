import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
  input({ type, checked }) {
    if (type !== 'checkbox') return null
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded border mr-2 shrink-0 align-middle ${
          checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-400 dark:border-gray-500'
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    )
  },
  h2({ children }) {
    return <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-2">{children}</h3>
  },
  p({ children }) {
    return <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-3">{children}</p>
  },
  li({ children }) {
    return <li className="text-gray-700 dark:text-gray-300 my-1">{children}</li>
  },
  strong({ children }) {
    return <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
  },
  a({ href, children }) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{children}</a>
  },
  code({ children, className }) {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return <code className={`${className ?? ''} text-sm`}>{children}</code>
    }
    return <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">{children}</code>
  },
  blockquote({ children }) {
    return <blockquote className="border-l-4 border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1 my-4 text-gray-600 dark:text-gray-400 rounded-r-lg">{children}</blockquote>
  },
  table({ children }) {
    return <div className="overflow-x-auto my-4"><table className="text-sm w-full border-collapse">{children}</table></div>
  },
  th({ children }) {
    return <th className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-700">{children}</th>
  },
  td({ children }) {
    return <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">{children}</td>
  },
  pre({ children }) {
    return <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-4 overflow-x-auto my-4 text-sm">{children}</pre>
  },
  hr() {
    return <hr className="border-gray-200 dark:border-gray-700 my-8" />
  },
}

export function DocViewer({ content }: { content: string }) {
  return (
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
