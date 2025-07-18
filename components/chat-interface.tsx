/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlassCard } from "@/components/glass-card"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Send, Bot, User, Sparkles, Edit, Trash2, RefreshCw, Info, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Copy as CopyIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  systemPrompt: string // Added for chain-of-thought prompt
}

interface ChatInterfaceProps {
  agent: Agent
  userId: string
  conversationId?: string
  messagesRemaining: number
  onMessagesRemainingChange: (count: number) => void
  token: string
}

interface Message {
  id: string;
  role: string;
  content: string | string[];
  // add other fields as needed
  model?: string;
  status?: string;
  createdAt?: string;
}

export function ChatInterface({
  agent,
  userId,
  conversationId,
  messagesRemaining,
  onMessagesRemainingChange,
  token,
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [currentConversationId, setCurrentConversationId] = useState(conversationId)
  const [agentAvailable, setAgentAvailable] = useState(true)
  const { toast } = useToast()
  const [preloadedMessages, setPreloadedMessages] = useState<any[]>([])
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  // Add model switcher state
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [modelOptions, setModelOptions] = useState<string[]>([])
  // Remove showModelDropdown state

  // Add this effect to reset state when agent or conversationId changes
  useEffect(() => {
    setCurrentConversationId(conversationId);
    setPreloadedMessages([]); // Clear old messages when switching
  }, [conversationId, agent.id]);

  // Update the fetch messages effect to use the correct backend route and response structure
  useEffect(() => {
    if (conversationId && userId) {
      fetch(`/api/conversations?userId=${userId}&conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.conversation && Array.isArray(data.conversation.messages)) {
            setPreloadedMessages(data.conversation.messages)
          }
        })
        .catch(() => {
          toast({ title: "Failed to load conversation messages", variant: "destructive" })
        })
    } else {
      setPreloadedMessages([]);
    }
  }, [conversationId, agent.id, userId, token, toast]);

  // Real-time agent availability check
  useEffect(() => {
    let cancelled = false
    async function checkAgent() {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models", { method: "GET" })
        if (!res.ok) throw new Error()
        if (!cancelled) setAgentAvailable(true)
      } catch {
        if (!cancelled) setAgentAvailable(false)
      }
    }
    checkAgent()
    return () => { cancelled = true }
  }, [agent.id])

  // Fetch available models for switcher
  useEffect(() => {
    fetch("https://openrouter.ai/api/v1/models")
      .then(res => res.ok ? res.json() : { data: [] })
      .then(data => setModelOptions((data.data || []).map((m: { id: string }) => m.id)))
  }, [])

  // --- Chain-of-thought prompt engineering ---
  function getEnhancedAgentPrompt(agentPrompt: string) {
    const cotInstruction = '\nWhen answering, think step by step and show your reasoning before the final answer.';
    if (agentPrompt.includes('step by step')) return agentPrompt;
    return agentPrompt + cotInstruction;
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      agentId: agent.id,
      conversationId: currentConversationId,
      // Add enhanced system prompt for chain-of-thought
      systemPrompt: getEnhancedAgentPrompt(agent.systemPrompt || ""),
    },
    onResponse: (response) => {
      const newConversationId = response.headers.get("X-Conversation-Id")
      const remaining = response.headers.get("X-Messages-Remaining")
      if (newConversationId && !currentConversationId) {
        setCurrentConversationId(newConversationId)
      }
      if (remaining) {
        onMessagesRemainingChange(Number.parseInt(remaining))
      }
    },
    onError: (error) => {
      toast({ title: "Chat error", description: error.message || "An error occurred.", variant: "destructive" })
    },
    // Optionally: onFinish, onStream, etc.
  })

  // Combine preloaded and live messages, deduplicating by id
  const allMessages = [...(preloadedMessages || []), ...(messages || [])].reduce((acc, msg) => {
    if (!acc.find((m: any) => m.id === msg.id)) acc.push(msg)
    return acc
  }, [])

  // --- AUTOSCROLL ---
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, preloadedMessages, isLoading]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (messagesRemaining <= 0) {
      toast({ title: "You have reached your daily message limit. Please try again tomorrow.", variant: "destructive" })
      return
    }
    if (!agentAvailable) {
      toast({ title: "Agent unavailable", description: "This agent is currently not available. Please try again later.", variant: "destructive" })
      return
    }
    handleSubmit(e)
  }

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);

  // Add edit/delete/retry handlers
  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(Array.isArray(message.content) ? message.content.join("") : message.content);
  };

  const handleEditSave = async (message: Message) => {
    try {
      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: message.id, content: editingContent }),
      });
      if (response.ok) {
        toast({ title: "Message updated" });
        setEditingMessageId(null);
        setEditingContent("");
        // Refresh messages
        if (conversationId && userId) {
          fetch(`/api/conversations?userId=${userId}&conversationId=${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(data => {
              if (data.conversation && Array.isArray(data.conversation.messages)) {
                setPreloadedMessages(data.conversation.messages);
              }
            });
        }
        // Update messagesRemaining from backend
        await updateMessagesRemaining(userId, token);
      } else {
        toast({ title: "Failed to update message", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error updating message", variant: "destructive" });
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleDelete = async (message: Message) => {
    try {
      const response = await fetch(`/api/chat?messageId=${message.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast({ title: "Message deleted" });
        setPreloadedMessages((prev: any[]) => prev.filter((m) => m.id !== message.id));
        // Update messagesRemaining from backend
        await updateMessagesRemaining(userId, token);
      } else {
        toast({ title: "Failed to delete message", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error deleting message", variant: "destructive" });
    }
  };

  const handleRetry = async (message: Message) => {
    setRetryingMessageId(message.id);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: agent.id,
          conversationId: currentConversationId,
          userId,
          content: Array.isArray(message.content) ? message.content.join("") : message.content,
        }),
      });
      if (response.ok) {
        toast({ title: "Message resent" });
        // Refresh messages
        if (conversationId && userId) {
          fetch(`/api/conversations?userId=${userId}&conversationId=${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(data => {
              if (data.conversation && Array.isArray(data.conversation.messages)) {
                setPreloadedMessages(data.conversation.messages);
              }
            });
        }
        // Update messagesRemaining from backend
        await updateMessagesRemaining(userId, token);
      } else {
        toast({ title: "Failed to resend message", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error retrying message", variant: "destructive" });
    } finally {
      setRetryingMessageId(null);
    }
  };

  const [alert, setAlert] = useState<string | null>(null)

  // Centralize error handling for backend errors (e.g., daily limit)
  useEffect(() => {
    if (error) {
      let msg = typeof error === 'string' ? error : error.message || 'An error occurred.';
      // Try to parse JSON error
      try {
        const parsed = JSON.parse(msg);
        if (parsed && parsed.error) msg = parsed.error;
      } catch {}
      setAlert(msg);

      // Autofix: If daily limit exceeded, set messagesRemaining to 0
      if (
        msg.toLowerCase().includes("daily message limit exceeded") ||
        msg.toLowerCase().includes("daily limit")
      ) {
        onMessagesRemainingChange(0);
      }
    } else {
      setAlert(null);
    }
  }, [error, onMessagesRemainingChange]);

  // Helper to fetch and update messagesRemaining from backend (now inside component)
  async function updateMessagesRemaining(userId: string, token: string) {
    try {
      const response = await fetch(`/api/auth/user?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (typeof data.user?.messagesUsed === 'number' && typeof data.user?.messageLimit === 'number') {
          onMessagesRemainingChange(data.user.messageLimit - data.user.messagesUsed);
        }
      }
    } catch {}
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto flex-1 bg-transparent px-0 sm:px-2 md:px-4 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white text-base sm:text-lg truncate">{agent.name}</h2>
          <p className="text-xs sm:text-sm text-white/70 truncate">{agent.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 flex-shrink-0">
          <Sparkles className="w-4 h-4" />
          <span>{messagesRemaining} left today</span>
          {!agentAvailable && <span className="ml-2 text-xs text-red-400">(Unavailable)</span>}
        </div>
      </div>
      {/* Error message */}
      {error && (
        <div className="w-full max-w-2xl mx-auto mt-2 mb-2 px-2 sm:px-0">
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-xs sm:text-sm text-center">
            {typeof error === 'string' ? error : error.message || 'An error occurred.'}
          </div>
        </div>
      )}

      {/* Chat area: messages (scrollable) + input (sticky) */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Messages (scrollable) */}
        <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-3 sm:py-6 bg-transparent" ref={scrollAreaRef}>
        <TooltipProvider>
          <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
              {allMessages.length === 0 && (
                <div className="text-center text-white/50 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with {agent.name}</p>
                  <p className="text-xs sm:text-sm mt-2">I can format code beautifully with syntax highlighting!</p>
                </div>
              )}

              {allMessages.map((message: Message) => {
                const content = Array.isArray(message.content) ? message.content.join("") : message.content;
                const isUser = message.role === "user";
                const isBot = message.role === "ASSISTANT";
                const isFailed = message.status === "FAILED";
                const canEdit = isUser;
                const canDelete = isUser;
                const canRetry = isBot && isFailed;
                const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full group",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "relative flex flex-col items-end max-w-[80%] sm:max-w-[60%]",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      {editingMessageId === message.id ? (
                        <div className="flex flex-col gap-2 w-full">
                          <textarea
                            className="w-full rounded-md border border-gray-300 p-2 text-black"
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditSave(message)} disabled={!editingContent.trim()}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                      <div
                        className={cn(
                          "rounded-full px-4 py-2 text-base transition-all duration-200 whitespace-pre-wrap break-words",
                          isUser
                            ? "bg-[#23272f] text-white self-end"
                            : "bg-transparent text-gray-100 self-start" // removed white overlay for bot
                        )}
                        style={{ minWidth: '40px', color: isUser ? '#fff' : '#18181b', background: isUser ? '#23272f' : 'transparent' }}
                      >
                        {isUser ? (
                          <span>{content}</span>
                        ) : (
                            (() => {
                              // Split content into lines
                              const lines = String(content).split(/\n|<br\s*\/>/);
                              // Reasoning steps: lines starting with 'Step', 'Reasoning', or numbered list
                              const reasoningLines = lines.filter(line => /^\s*(step|reasoning|\d+\.|-)/i.test(line.trim()));
                              // Implementation: lines that are not reasoning steps
                              const implementationLines = lines.filter(line => !/^\s*(step|reasoning|\d+\.|-)/i.test(line.trim()));
                              return (
                                <div>
                                  {reasoningLines.length > 0 && (
                                    <Accordion type="single" collapsible defaultValue="reasoning">
                                      <AccordionItem value="reasoning">
                                        <AccordionTrigger className="text-purple-400 font-semibold italic">Reasoning Steps</AccordionTrigger>
                                        <AccordionContent>
                                          <div className="space-y-1">
                                            {reasoningLines.map((line, idx) => (
                                              <div key={idx} className="text-purple-300 italic text-sm pl-3 border-l-4 border-purple-400 bg-purple-950/10">
                                                <MarkdownRenderer content={line} />
                                              </div>
                                            ))}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  )}
                                  {implementationLines.length > 0 && (
                                    <div className="mt-2">
                                      <MarkdownRenderer content={implementationLines.join("\n")} />
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                        )}
                      </div>
                      )}
                      {/* Meta and actions row */}
                      <div className="flex items-center justify-between mt-2 w-full">
                        <div className="flex items-center gap-2">
                        {time && (
                            <span className="text-[11px] text-gray-400">{time}</span>
                        )}
                        {isBot && message.model && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-medium">
                            <Info className="w-3 h-3" />
                            {message.model}
                          </span>
                        )}
                        {message.status && message.status !== "SENT" && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px]">{message.status}</span>
                        )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(content);
                                    setCopiedMessageId(message.id);
                                    setTimeout(() => setCopiedMessageId(null), 2000);
                                    toast({ title: "Copied to clipboard", description: "Message content copied successfully" });
                                  } catch (error) {
                                    toast({ title: "Failed to copy", description: "Could not copy to clipboard", variant: "destructive" });
                                  }
                                }}
                              >
                                <CopyIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg shadow-lg bg-gray-900 text-white px-3 py-2 text-xs font-medium border border-gray-800">
                              {copiedMessageId === message.id ? "Copied!" : "Copy"}
                            </TooltipContent>
                          </Tooltip>
                          {canEdit && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors" onClick={() => handleEdit(message)}>
                                  <Edit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg shadow-lg bg-gray-900 text-white px-3 py-2 text-xs font-medium border border-gray-800">
                                Edit
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors" onClick={() => handleDelete(message)}>
                                  <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg shadow-lg bg-gray-900 text-white px-3 py-2 text-xs font-medium border border-gray-800">
                                Delete
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {canRetry && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1.5 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors" onClick={() => handleRetry(message)} disabled={retryingMessageId === message.id}>
                                  {retryingMessageId === message.id ? (
                                    <span className="w-4 h-4 animate-spin border-2 border-yellow-500 border-t-transparent rounded-full inline-block"></span>
                                  ) : (
                                    <RefreshCw className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-lg shadow-lg bg-gray-900 text-white px-3 py-2 text-xs font-medium border border-gray-800">
                                Retry
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Bot is thinking indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-white/70 text-sm mt-2 animate-pulse">
                  <Bot className="w-5 h-5 opacity-60" />
                  <span>Bot is thinking</span>
                  <span className="inline-block w-4 text-lg animate-bounce">...</span>
                </div>
              )}
          </div>
        </TooltipProvider>
      </div>
        {/* Input (ChatGPT-style, responsive, tools inside input) */}
        <div className="w-full flex justify-center items-end py-4 sm:py-8 bg-transparent px-2 sm:px-0">
        <form
          onSubmit={onSubmit}
            className="w-full max-w-2xl flex items-end justify-center p-4 sm:p-6"
        >
            <div className="flex flex-1 items-center rounded-2xl bg-[#23272f] border border-[#353945] shadow-lg px-4 py-3 gap-3">
              {/* Model switcher button (tools) inside input */}
            {userId && modelOptions.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                      className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#23272f] text-white text-xs font-semibold border border-[#353945] hover:bg-[#23272f]/90 focus:outline-none transition-all disabled:opacity-50 min-w-[90px] pr-4"
                    disabled={messagesRemaining <= 0}
                  >
                      <span className="truncate max-w-[60px]">
                    {selectedModel ? selectedModel : "Default Model"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 ml-1 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60 max-h-72 overflow-y-auto p-1 bg-[#18181b] dark:bg-[#23272f] rounded-2xl shadow-2xl border-0 animate-fadeIn" sideOffset={8}>
                  {[
                    { label: "Default Model", value: "" },
                    ...modelOptions.map(m => ({ label: m, value: m }))
                  ].map(option => (
                    <DropdownMenuItem
                      key={option.value || "default"}
                      onSelect={() => setSelectedModel(option.value)}
                      className={cn(
                        "flex items-center gap-2 text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium",
                        selectedModel === option.value || (!selectedModel && !option.value)
                          ? "bg-blue-600/10 text-blue-400 dark:text-blue-300"
                          : "text-white/90 hover:bg-white/10 hover:text-blue-300",
                        "focus:bg-blue-600/20 focus:text-blue-200 outline-none"
                      )}
                      style={{ minHeight: 40 }}
                    >
                      {(selectedModel === option.value || (!selectedModel && !option.value)) && (
                        <Check className="w-4 h-4 text-blue-400 dark:text-blue-300" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && input.trim() && messagesRemaining > 0) {
                    onSubmit(e as any);
                  }
                }
              }}
              placeholder={messagesRemaining > 0 ? "Message..." : "Daily limit reached"}
              disabled={isLoading || messagesRemaining <= 0}
              rows={1}
                className="block w-full resize-none bg-transparent px-0 py-2 text-white placeholder:text-[#b4bcd0] focus:outline-none focus:ring-0 transition-all duration-200 min-h-[44px] sm:min-h-[44px] max-h-40 overflow-auto border-none text-[1rem] sm:text-[1.08rem] font-normal disabled:opacity-60"
              style={{
                fontSize: "1rem",
                lineHeight: "1.7",
                  background: 'transparent',
              }}
              ref={el => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }
              }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || messagesRemaining <= 0}
                className="flex items-center justify-center rounded-full bg-[#353945] hover:bg-[#444654] text-white p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{height: '40px', width: '40px'}}
              tabIndex={-1}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        </div>
      </div>
      {/* Professional alert/banner for errors and limits */}
      {alert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto">
          <div className="bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm text-center font-medium shadow-lg border border-red-200 dark:border-red-800 flex items-center justify-center gap-2">
            <Info className="w-5 h-5 mr-1" />
            {alert}
          </div>
        </div>
      )}
    </div>
  )
}
