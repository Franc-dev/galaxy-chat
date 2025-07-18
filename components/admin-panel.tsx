"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlassCard } from "@/components/glass-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, BookOpen, TrendingUp, Shield, Edit, Save, X } from "lucide-react"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalConversations: number
  totalMessages: number
  knowledgeItems: number
  todayMessages: number
  modelUsage: Array<{ model: string; count: number }>
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  messagesUsed: number
  messageLimit: number
  isActive: boolean
  createdAt: string
  _count: {
    conversations: number
    knowledgeBase: number
  }
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  token: string
}

// Add Agent type
interface Agent {
  id: string;
  name: string;
  model?: string;
}

export function AdminPanel({ isOpen, onClose, token }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ messageLimit: 0, role: "", isActive: true })
  const [agents, setAgents] = useState<Agent[]>([])
  const [editingAgent, setEditingAgent] = useState<string | null>(null)
  const [editAgentModel, setEditAgentModel] = useState<string>("")
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      fetchUsers()
      fetchAgents()
      fetchAvailableModels()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents")
      const data = await response.json()
      if (response.ok) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    }
  }

  const fetchAvailableModels = async () => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models")
      if (res.ok) {
        const data = await res.json()
        setAvailableModels((data.data || []).map((m: { id: string }) => m.id))
      }
    } catch (error) {
      setAvailableModels([])
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user.id)
    setEditForm({
      messageLimit: user.messageLimit,
      role: user.role,
      isActive: user.isActive,
    })
  }

  const handleSaveUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          ...editForm,
        }),
      })

      if (response.ok) {
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent.id)
    setEditAgentModel(agent.model || "")
  }

  const handleSaveAgent = async (agentId: string) => {
    try {
      const response = await fetch("/api/agents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId, model: editAgentModel }),
      })
      if (response.ok) {
        setEditingAgent(null)
        fetchAgents()
      }
    } catch (error) {
      console.error("Failed to update agent model:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-500/20 text-red-300"
      case "ADMIN":
        return "bg-orange-500/20 text-orange-300"
      default:
        return "bg-blue-500/20 text-blue-300"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-transparent border-0">
        <GlassCard className="h-full flex flex-col bg-[#23272f]/95">
          <DialogHeader className="p-4 md:p-6 border-b border-white/10">
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Panel
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-2 md:p-6 overflow-y-auto max-h-[75vh] w-full">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <GlassCard className="p-4 bg-[#23272f]/90">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                      <p className="text-sm text-white/70">Total Users</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 bg-[#23272f]/90">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                      <p className="text-sm text-white/70">Total Messages</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 bg-[#23272f]/90">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.todayMessages}</p>
                      <p className="text-sm text-white/70">Today's Messages</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 bg-[#23272f]/90">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.knowledgeItems}</p>
                      <p className="text-sm text-white/70">Knowledge Items</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
            {/* Users Management */}
            <GlassCard className="flex-1 flex flex-col mb-6 bg-[#23272f]/90">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="text-center text-white/50 py-8">Loading users...</div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <GlassCard key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-white">{user.name || user.email}</h4>
                              <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                              {!user.isActive && <Badge className="bg-red-500/20 text-red-300">Inactive</Badge>}
                            </div>
                            <p className="text-sm text-white/70">{user.email}</p>
                            <div className="flex gap-4 mt-2 text-xs text-white/50">
                              <span>
                                Messages: {user.messagesUsed}/{user.messageLimit}
                              </span>
                              <span>Conversations: {user._count.conversations}</span>
                              <span>Knowledge: {user._count.knowledgeBase}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {editingUser === user.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={editForm.messageLimit}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      messageLimit: Number.parseInt(e.target.value),
                                    })
                                  }
                                  className="w-20 h-8 bg-white/10 border-white/20 text-white text-xs"
                                  placeholder="Limit"
                                />
                                <select
                                  value={editForm.role}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      role: e.target.value,
                                    })
                                  }
                                  className="h-8 px-2 bg-white/10 border border-white/20 rounded text-white text-xs"
                                >
                                  <option value="USER" className="bg-slate-800">
                                    User
                                  </option>
                                  <option value="ADMIN" className="bg-slate-800">
                                    Admin
                                  </option>
                                </select>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveUser(user.id)}
                                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUser(null)}
                                  className="h-8 w-8 p-0 text-white/50 hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditUser(user)}
                                className="h-8 w-8 p-0 text-white/50 hover:text-white"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </GlassCard>

            {/* Agent Management */}
            <GlassCard className="flex-1 flex flex-col mb-6 bg-[#23272f]/90">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Agent Management</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <GlassCard key={agent.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-white">{agent.name}</h4>
                            <span className="text-xs text-white/50">ID: {agent.id}</span>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-white/50">
                            <span>Model: {agent.model || "(default)"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingAgent === agent.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editAgentModel}
                                onChange={e => setEditAgentModel(e.target.value)}
                                className="h-8 px-2 bg-white/10 border border-white/20 rounded text-white text-xs"
                              >
                                <option value="">(Default)</option>
                                {availableModels.map((model) => (
                                  <option key={model} value={model} className="bg-slate-800">{model}</option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                onClick={() => handleSaveAgent(agent.id)}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingAgent(null)}
                                className="h-8 w-8 p-0 text-white/50 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAgent(agent)}
                              className="h-8 w-8 p-0 text-white/50 hover:text-white"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </ScrollArea>
            </GlassCard>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  )
}
