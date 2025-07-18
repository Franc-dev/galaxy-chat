/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GalaxyBackground } from "@/components/galaxy-background"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { KnowledgeModal } from "@/components/knowledge-modal"
import { GlassCard } from "@/components/glass-card"
import { Sparkles, LogOut } from "lucide-react"
import { AdminPanel } from "@/components/admin-panel"
import { Button } from "@/components/ui/button"

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

interface ChatUser {
  id: string
  email: string
  name: string
  messagesUsed: number
  messageLimit: number
  role: string
}

export default function ChatPage() {
  const [user, setUser] = useState<ChatUser | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  // messagesRemaining is always set from backend/user object, never hardcoded
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null)
  const [token, setToken] = useState<string>("")
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    if (user && token) {
      fetchConversations()
      setMessagesRemaining(user.messageLimit - user.messagesUsed)
    }
  }, [user, token])

  const initializeChat = async () => {
    try {
      // Check authentication
      const savedToken = localStorage.getItem("auth_token")
      const savedUser = localStorage.getItem("user_data")

      if (!savedToken || !savedUser) {
        router.push("/signin")
        return
      }

      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        router.push("/signin")
        return
      }

      // Fetch agents
      await fetchAgents()
    } catch (error) {
      console.error("Chat initialization error:", error)
      router.push("/signin")
    } finally {
      setIsLoading(false)
    }
  }

  // Ensure all agents and conversations have systemPrompt
  function ensureAgentPrompt(agent: any): Agent {
    return {
      ...agent,
      systemPrompt: agent.systemPrompt || ""
    };
  }
  function ensureConversationPrompt(convo: any): Conversation {
    return {
      ...convo,
      agent: ensureAgentPrompt(convo.agent)
    };
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      const data = await response.json()
      if (response.ok) {
        const agentsWithPrompt: Agent[] = data.agents.map(ensureAgentPrompt);
        setAgents(agentsWithPrompt)
        if (agentsWithPrompt.length > 0 && !selectedAgent) {
          setSelectedAgent(agentsWithPrompt[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    }
  }

  const fetchConversations = async () => {
    if (!user || !token) return
    try {
      const response = await fetch(`/api/conversations?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        const conversationsWithPrompt = data.conversations.map(ensureConversationPrompt);
        setConversations(conversationsWithPrompt)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  // Fix: make handleAgentSelect synchronous and ensure systemPrompt is always present
  const handleAgentSelect = (agent: Agent) => {
    const agentWithPrompt = ensureAgentPrompt(agent);
    setSelectedAgent(agentWithPrompt);
    // Find the most recent conversation for this agent and user
    const agentConvos = conversations
      .filter((c) => c.agent.id === agent.id)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (agentConvos.length > 0) {
      setSelectedConversation(ensureConversationPrompt(agentConvos[0]));
    } else {
      // No conversation exists for this agent+user, create one
      if (user && token) {
        fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user.id, agentId: agent.id }),
        })
          .then((response) => response.ok ? response.json() : null)
          .then((data) => {
            if (data && data.conversation) {
              const newConv = ensureConversationPrompt(data.conversation);
              setConversations((prev) => [newConv, ...prev]);
              setSelectedConversation(newConv);
            }
          });
      }
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setSelectedAgent(conversation.agent)
  }

  const handleNewChat = () => {
    setSelectedConversation(null)
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0])
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!user || !token) return

    try {
      const response = await fetch(`/api/conversations?conversationId=${conversationId}&userId=${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== conversationId))
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  if (isLoading) {
    return (
      <>
        <GalaxyBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">🌌</div>
            <p>Loading Galaxy Chat...</p>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <>
      <GalaxyBackground />
      <div className="flex min-h-screen">
        {/* Sidebar (fixed) */}
        <aside className="fixed left-0 top-0 h-screen w-80 z-20 bg-[#23272f] flex flex-col gap-4 p-4">
          <Sidebar
            agents={agents.map(ensureAgentPrompt)}
            conversations={conversations.map(ensureConversationPrompt)}
            selectedAgent={selectedAgent ? ensureAgentPrompt(selectedAgent) : null}
            selectedConversation={selectedConversation ? ensureConversationPrompt(selectedConversation) : null}
            onAgentSelect={handleAgentSelect}
            onConversationSelect={handleConversationSelect}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            onKnowledgeClick={() => setShowKnowledgeModal(true)}
            onAdminClick={() => setShowAdminPanel(true)}
            userRole={user?.role}
          />
        </aside>
        {/* User Info & Logout (fixed at bottom of sidebar) */}
        <div className="fixed left-0 bottom-0 w-80 z-30 p-4 pb-6">
          <GlassCard className="w-full p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
              <p className="text-xs text-white/70">
                {user?.role === "USER" ? `${messagesRemaining} messages left` : "Unlimited messages"}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </GlassCard>
        </div>

        {/* Main Content (scrollable) */}
        <main className="ml-80 flex-1 h-screen flex flex-col min-h-0">
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
            {selectedAgent ? (
              <ChatInterface
                agent={selectedAgent ? ensureAgentPrompt(selectedAgent) : agents[0]}
                userId={user.id}
                conversationId={selectedConversation?.id}
                messagesRemaining={messagesRemaining ?? 0}
                onMessagesRemainingChange={setMessagesRemaining}
                token={token}
              />
            ) : (
              <GlassCard className="flex-1 flex items-center justify-center max-w-5xl mx-auto">
                <div className="text-center text-white/50">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h2 className="text-xl font-semibold mb-2">Welcome to Galaxy Chat</h2>
                  <p>Select an AI agent to start your cosmic conversation</p>
                </div>
              </GlassCard>
            )}
          </div>
        </main>
        {/* Modals (not fixed, so they overlay correctly) */}
        <KnowledgeModal
          isOpen={showKnowledgeModal}
          onClose={() => setShowKnowledgeModal(false)}
          userId={user?.id || ""}
          agents={agents}
        />

        <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} token={token} />
      </div>
    </>
  )
}
