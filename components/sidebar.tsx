"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlassCard } from "@/components/glass-card"
import { Plus, MessageSquare, Brain, BookOpen, Trash2, Shield, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  systemPrompt: string
}

interface Conversation {
  id: string
  title: string
  agent: Agent
  updatedAt: string
}

interface SidebarProps {
  agents: Agent[]
  conversations: Conversation[]
  selectedAgent: Agent | null
  selectedConversation: Conversation | null
  onAgentSelect: (agent: Agent) => void
  onConversationSelect: (conversation: Conversation) => void
  onNewChat: () => void
  onDeleteConversation: (conversationId: string) => void
  onKnowledgeClick: () => void
  onAdminClick?: () => void
  userRole?: string
}

export function Sidebar({
  agents,
  conversations,
  selectedAgent,
  selectedConversation,
  onAgentSelect,
  onConversationSelect,
  onNewChat,
  onDeleteConversation,
  onKnowledgeClick,
  onAdminClick,
  userRole,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"agents" | "conversations">("agents")
  const [mobileOpen, setMobileOpen] = useState(false)

  // Filter conversations for the selected agent
  const filteredConversations = selectedAgent
    ? conversations.filter((c) => c.agent.id === selectedAgent.id)
    : conversations

  // Sidebar content as a component for reuse
  const sidebarContent = (
    <GlassCard className="w-80 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white mb-4">Galaxy Chat</h1>
        <button className="sm:hidden text-white" onClick={() => setMobileOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white mb-4">Galaxy Chat</h1>

        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("agents")}
            className={cn(
              "flex-1 text-xs",
              activeTab === "agents" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10",
            )}
          >
            <Brain className="w-3 h-3 mr-1" />
            Agents
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "flex-1 text-xs",
              activeTab === "conversations"
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10",
            )}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Chats
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {activeTab === "agents" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/80">AI Agents</h3>
              <Button
                size="sm"
                onClick={onNewChat}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>

            {agents.map((agent) => (
              <Button
                key={agent.id}
                variant="ghost"
                onClick={() => onAgentSelect(agent)}
                className={cn(
                  "w-full justify-start p-3 h-auto text-left",
                  selectedAgent?.id === agent.id
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                <div className="text-lg mr-3">{agent.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                  <div className="text-xs opacity-70 truncate">{agent.description}</div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/80">Recent Conversations</h3>
              <Button
                size="sm"
                onClick={onNewChat}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
            {filteredConversations.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative rounded-lg border transition-colors",
                    selectedConversation?.id === conversation.id
                      ? "bg-white/20 border-white/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10",
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => onConversationSelect(conversation)}
                    className="w-full justify-start p-3 h-auto text-left hover:bg-transparent"
                  >
                    <div className="text-sm mr-3">{conversation.agent.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate text-sm">{conversation.title}</div>
                      <div className="text-xs text-white/50">{conversation.agent.name}</div>
                    </div>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteConversation(conversation.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
          <Button
            variant="ghost"
            onClick={onAdminClick}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 mb-2"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onKnowledgeClick}
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Knowledge Base
        </Button>
      </div>
    </GlassCard>
  )

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="fixed top-4 left-4 z-30 sm:hidden bg-[#222] bg-opacity-70 rounded-full p-2 shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
      {/* Sidebar overlay on mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 flex">
          <div className="relative z-30">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
      {/* Sidebar always visible on desktop */}
      <div className="hidden sm:block h-full">
        {sidebarContent}
      </div>
    </>
  )
}

export function SidebarMobile(props: SidebarProps & { user: { name: string; email: string; role: string; messagesRemaining: number }; onLogout: () => void }) {
  return (
    <GlassCard className="w-80 max-w-full h-full flex flex-col">
      {/* Sidebar content */}
      <Sidebar {...props} />
      {/* User Info & Logout (mobile) */}
      <GlassCard className="w-full p-4 flex items-center justify-between mt-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{props.user.name}</p>
          <p className="text-xs text-white/50 truncate">{props.user.email}</p>
          <p className="text-xs text-white/70">
            {props.user.role === "USER" ? `${props.user.messagesRemaining} messages left` : "Unlimited messages"}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={props.onLogout}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </GlassCard>
    </GlassCard>
  );
}
