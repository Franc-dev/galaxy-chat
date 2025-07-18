"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlassCard } from "@/components/glass-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Trash2, Tag } from "lucide-react"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
}

interface Agent {
  id: string
  name: string
  avatar: string
}

interface KnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  agents: Agent[]
}

export function KnowledgeModal({ isOpen, onClose, userId, agents }: KnowledgeModalProps) {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    agentId: "",
  })

  useEffect(() => {
    if (isOpen) {
      fetchKnowledge()
    }
  }, [isOpen, userId])

  const fetchKnowledge = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/knowledge?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setKnowledge(data.knowledge)
      }
    } catch (error) {
      console.error("Failed to fetch knowledge:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          userId,
          agentId: formData.agentId || null,
        }),
      })

      if (response.ok) {
        setFormData({ title: "", content: "", tags: "", agentId: "" })
        setShowAddForm(false)
        fetchKnowledge()
      }
    } catch (error) {
      console.error("Failed to add knowledge:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchKnowledge()
      }
    } catch (error) {
      console.error("Failed to delete knowledge:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-transparent border-0">
        <GlassCard className="h-full flex flex-col">
          <DialogHeader className="p-6 border-b border-white/10">
            <DialogTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Knowledge Base
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Your Knowledge ({knowledge.length})</h3>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge
              </Button>
            </div>

            {showAddForm && (
              <GlassCard className="p-4 mb-6 bg-[#23272f]/90">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Knowledge title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <select
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
                    >
                      <option value="">All Agents</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id} className="bg-slate-800">
                          {agent.avatar} {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Textarea
                    placeholder="Knowledge content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                  />

                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      Add Knowledge
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="text-white/70 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </GlassCard>
            )}

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="text-center text-white/50 py-8">Loading...</div>
              ) : knowledge.length === 0 ? (
                <div className="text-center text-white/50 py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No knowledge items yet. Add some to help your agents learn!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledge.map((item) => (
                    <GlassCard key={item.id} className="p-4 bg-[#23272f]/90">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <p className="text-white/80 text-sm mb-3 line-clamp-3">{item.content}</p>

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-white/10 text-white/70 text-xs">
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  )
}
