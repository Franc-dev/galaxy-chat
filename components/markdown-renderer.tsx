"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "./code-block"
import { PackageManagerTabs } from "./package-manager-tabs"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const language = match ? match[1] : ""
          const code = String(children).replace(/\n$/, "")

          // Check if it's a package manager command block
          if (language === "install" || code.includes("npm install") || code.includes("yarn add")) {
            const lines = code.split("\n")
            const commands: any = {}

            lines.forEach((line) => {
              if (line.startsWith("npm ")) commands.npm = line
              if (line.startsWith("yarn ")) commands.yarn = line
              if (line.startsWith("pnpm ")) commands.pnpm = line
              if (line.startsWith("bun ")) commands.bun = line
            })

            if (Object.keys(commands).length > 0) {
              return <PackageManagerTabs {...commands} />
            }
          }

          if (!inline && match) {
            return <CodeBlock language={language}>{code}</CodeBlock>
          }

          return (
            <code className="bg-slate-700/50 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        pre({ children }) {
          return <>{children}</>
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-semibold text-white mb-3 mt-5">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-medium text-white mb-2 mt-4">{children}</h3>
        },
        p({ children }) {
          return <p className="text-white/90 mb-3 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside text-white/90 mb-3 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside text-white/90 mb-3 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li className="text-white/90">{children}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-500/10 rounded-r text-white/90 mb-3">
              {children}
            </blockquote>
          )
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-slate-600 rounded-lg overflow-hidden">{children}</table>
            </div>
          )
        },
        thead({ children }) {
          return <thead className="bg-slate-700">{children}</thead>
        },
        tbody({ children }) {
          return <tbody className="bg-slate-800/50">{children}</tbody>
        },
        tr({ children }) {
          return <tr className="border-b border-slate-600">{children}</tr>
        },
        th({ children }) {
          return <th className="px-4 py-2 text-left text-white font-medium">{children}</th>
        },
        td({ children }) {
          return <td className="px-4 py-2 text-white/90">{children}</td>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold text-white">{children}</strong>
        },
        em({ children }) {
          return <em className="italic text-white/90">{children}</em>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
