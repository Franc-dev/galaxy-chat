"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "./code-block"

interface PackageManagerTabsProps {
  npm?: string
  yarn?: string
  pnpm?: string
  bun?: string
}

export function PackageManagerTabs({ npm, yarn, pnpm, bun }: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<"npm" | "yarn" | "pnpm" | "bun">("npm")

  const commands = {
    npm: npm || "",
    yarn: yarn || "",
    pnpm: pnpm || "",
    bun: bun || "",
  }

  const availableTabs = Object.entries(commands).filter(([_, command]) => command)

  if (availableTabs.length === 0) return null

  return (
    <div className="my-4">
      <div className="flex border-b border-slate-600 mb-0">
        {availableTabs.map(([manager, _]) => (
          <Button
            key={manager}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(manager as any)}
            className={`rounded-none border-b-2 transition-colors ${
              activeTab === manager
                ? "border-blue-400 text-blue-400 bg-slate-800/50"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            {manager}
          </Button>
        ))}
      </div>

      <CodeBlock language="bash" showLineNumbers={false}>
        {commands[activeTab]}
      </CodeBlock>
    </div>
  )
}
