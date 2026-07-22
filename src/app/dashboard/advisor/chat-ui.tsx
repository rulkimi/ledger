"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Send, Loader2, Sparkles, AlertCircle, Plus, X, Trash2, Ban } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createSubscription, deleteSubscription } from "@/actions/subscription";
import { getLatestChatSession, saveChatSession, getAllChatSessions, createNewChatSession, getChatSessionById, deleteChatSession } from "@/actions/chat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  BI_ANNUALLY: "Bi-Annually",
  YEARLY: "Yearly",
  ONE_TIME: "One-Time",
};

function EditableAddSubscriptionCard({ 
  toolCallId, toolName, initialInput, handleConfirm, handleCancel, isCompleted, resultText 
}: { 
  toolCallId: string, toolName: string, initialInput: any, handleConfirm: (id: string, name: string, input: any) => void, handleCancel: (id: string) => void, isCompleted: boolean, resultText?: string 
}) {
  const [formData, setFormData] = useState(initialInput || {});
  const [processingState, setProcessingState] = useState<"idle" | "confirming" | "canceling">("idle");

  useEffect(() => {
    if (!isCompleted && initialInput && Object.keys(initialInput).length > 0) {
      setFormData(initialInput);
    }
  }, [initialInput, isCompleted]);

  const onConfirm = async () => {
    setProcessingState("confirming");
    try {
      await handleConfirm(toolCallId, toolName, formData);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingState("idle");
    }
  };

  const onCancel = async () => {
    setProcessingState("canceling");
    try {
      await handleCancel(toolCallId);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingState("idle");
    }
  };

  const isProcessing = processingState !== "idle";
  const isCanceled = resultText?.toLowerCase().includes("canceled");

  if (isCompleted) {
    return (
      <div className="mt-2 p-4 rounded-xl border shadow-sm text-sm w-full max-w-sm bg-muted/50 border-border/30 opacity-75 animate-in fade-in-50 duration-200">
        <p className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
          {isCanceled ? (
            <>
              <Ban className="w-4 h-4 text-muted-foreground/60" />
              Operation Canceled
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Added Subscription
            </>
          )}
        </p>
        <div className={`grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-3 bg-background/30 p-3 rounded-lg border border-border/30 text-xs ${isCanceled ? "line-through decoration-muted-foreground/30 opacity-60" : ""}`}>
          <div className="col-span-2">Name: <span className="text-foreground font-medium">{formData.name}</span></div>
          <div>Cost: <span className="text-foreground font-medium">{formData.cost}</span></div>
          <div>Freq: <span className="text-foreground font-medium">{(formData.billingFrequency && FREQUENCY_LABELS[formData.billingFrequency]) || formData.billingFrequency}</span></div>
          {formData.startDate && (
            <div className="col-span-1">
              {formData.billingFrequency === "ONE_TIME" ? "Paid On:" : "Since:"} <span className="text-foreground font-medium">{formData.startDate.split('T')[0]}</span>
            </div>
          )}
          {formData.endDate && (
            <div className="col-span-1">Until: <span className="text-foreground font-medium">{formData.endDate.split('T')[0]}</span></div>
          )}
        </div>
        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground font-medium text-center">
          {resultText || 'Completed'}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-5 bg-background rounded-xl border border-border shadow-md text-sm w-full max-w-[425px]">
      <p className="font-semibold mb-3 text-foreground flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Review Subscription
      </p>
      <p className="text-muted-foreground mb-4">Please review the details before adding it to your ledger.</p>
      <div className="flex flex-col gap-3 py-2 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground">Name</Label>
          <Input 
            className="h-8 mt-1" 
            value={formData.name || ""} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            disabled={isProcessing}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Cost</Label>
            <Input 
              type="number"
              className="h-8 mt-1" 
              value={formData.cost || ""} 
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })} 
              disabled={isProcessing}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Select 
              value={formData.billingFrequency || "MONTHLY"} 
              onValueChange={(val) => setFormData({ ...formData, billingFrequency: val })}
              disabled={isProcessing}
            >
              <SelectTrigger className="h-8 mt-1 bg-background border border-input w-full text-xs">
                <SelectValue>
                  {FREQUENCY_LABELS[formData.billingFrequency || "MONTHLY"]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="BI_ANNUALLY">Bi-Annually</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
                <SelectItem value="ONE_TIME">One-Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {formData.billingFrequency === "ONE_TIME" ? "Payment Date (Planned)" : "Start Date"}
            </Label>
            <Input 
              type="date"
              className="h-8 mt-1" 
              value={formData.startDate ? formData.startDate.split('T')[0] : ""} 
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
              disabled={isProcessing}
            />
          </div>
          {formData.billingFrequency !== "ONE_TIME" && (
            <div>
              <Label className="text-xs text-muted-foreground">End Date (Opt)</Label>
              <Input 
                type="date"
                className="h-8 mt-1" 
                value={formData.endDate ? formData.endDate.split('T')[0] : ""} 
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                disabled={isProcessing}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={isProcessing}>
          {processingState === "canceling" ? "Canceling..." : "Cancel"}
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={isProcessing} className="gap-1.5">
          {processingState === "confirming" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {processingState === "confirming" ? "Adding..." : "Confirm & Add"}
        </Button>
      </div>
    </div>
  );
}


const SUGGESTIONS = [
  {
    title: "Roast my spending",
    description: "Get a brutal reality check on your subscriptions.",
    icon: "🌶️",
    prompt: "Roast my financial choices and tell me if my subscriptions are reasonable.",
  },
  {
    title: "Find wasted money",
    description: "Identify unused or redundant subscriptions.",
    icon: "🔍",
    prompt: "Look through my subscriptions and suggest which ones I should probably cancel to save money.",
  },
  {
    title: "Add new expense",
    description: "Track a new recurring bill.",
    icon: "💸",
    prompt: "I want to add a new subscription.",
  },
  {
    title: "Cancel a sub",
    description: "Remove an expense from your ledger.",
    icon: "✂️",
    prompt: "I want to cancel one of my subscriptions.",
  }
];

export function ChatUI() {
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    // Optional config here
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [allSessions, setAllSessions] = useState<{id: string, title: string, createdAt: Date, updatedAt: Date}[]>([]);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [deletingToolCallId, setDeletingToolCallId] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const lastSavedMessagesRef = useRef<string>("[]");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const [latestSession, sessions] = await Promise.all([
          getLatestChatSession(),
          getAllChatSessions()
        ]);
        setSessionId(latestSession.id);
        setAllSessions(sessions);
        if (latestSession.messages && Array.isArray(latestSession.messages) && latestSession.messages.length > 0) {
          // Auto-cancel any stale, unresolved prompts on page reload
          const msgs = (latestSession.messages as any[]).map((msg: any) => {
            if (msg.role === 'assistant' && msg.parts) {
              const updatedParts = msg.parts.map((part: any) => {
                const toolInv = part.toolInvocation || part;
                if (
                  toolInv && 
                  toolInv.toolCallId && 
                  (!toolInv.result && toolInv.state !== 'result' && toolInv.state !== 'output-available')
                ) {
                  const newPart = { ...part };
                  if (newPart.toolInvocation) {
                    newPart.toolInvocation = {
                      ...newPart.toolInvocation,
                      state: 'result',
                      result: "Canceled (page reloaded)."
                    };
                  } else {
                    newPart.state = 'output-available';
                    newPart.output = "Canceled (page reloaded).";
                  }
                  return newPart;
                }
                return part;
              });
              return { ...msg, parts: updatedParts };
            }
            return msg;
          });
          lastSavedMessagesRef.current = JSON.stringify(msgs);
          setMessages(msgs as any);
        } else {
          lastSavedMessagesRef.current = "[]";
        }
      } catch (e) {
        console.error("Failed to load chat session:", e);
      } finally {
        initialLoadDone.current = true;
      }
    }
    loadChat();
  }, [setMessages]);

  const handleNewChat = async () => {
    setIsSaving(true);
    try {
      const newSession = await createNewChatSession();
      setSessionId(newSession.id);
      setAllSessions(prev => {
        // Enforce max 5 in the UI by slicing the oldest if needed
        const next = [...prev, newSession];
        if (next.length > 5) return next.slice(next.length - 5);
        return next;
      });
      lastSavedMessagesRef.current = "[]";
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchChat = async (id: string | null) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const chat = await getChatSessionById(id);
      setSessionId(chat.id);
      const msgs = ((chat.messages as any[]) || []).map((msg: any) => {
        if (msg.role === 'assistant' && msg.parts) {
          const updatedParts = msg.parts.map((part: any) => {
            const toolInv = part.toolInvocation || part;
            if (
              toolInv && 
              toolInv.toolCallId && 
              (!toolInv.result && toolInv.state !== 'result' && toolInv.state !== 'output-available')
            ) {
              const newPart = { ...part };
              if (newPart.toolInvocation) {
                newPart.toolInvocation = {
                  ...newPart.toolInvocation,
                  state: 'result',
                  result: "Canceled (switched chat tab)."
                };
              } else {
                newPart.state = 'output-available';
                newPart.output = "Canceled (switched chat tab).";
              }
              return newPart;
            }
            return part;
          });
          return { ...msg, parts: updatedParts };
        }
        return msg;
      });
      lastSavedMessagesRef.current = JSON.stringify(msgs);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChatConfirm = async () => {
    if (!chatToDelete) return;
    const id = chatToDelete;
    setChatToDelete(null);
    setIsSaving(true);
    try {
      await deleteChatSession(id);
      const remaining = allSessions.filter(s => s.id !== id);
      setAllSessions(remaining);
      if (sessionId === id) {
        if (remaining.length > 0) {
          await handleSwitchChat(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!initialLoadDone.current || !sessionId) return;
    
    const messagesStr = JSON.stringify(messages);
    if (messagesStr === lastSavedMessagesRef.current) return;
    
    setIsSaving(true);
    
    // Save chat session whenever messages change
    const timer = setTimeout(() => {
      saveChatSession(sessionId, messages)
        .then(() => {
          setIsSaving(false);
          lastSavedMessagesRef.current = JSON.stringify(messages);
          // if first message sets title, reload sessions to update tab
          if (messages.length > 0 && allSessions.find(s => s.id === sessionId)?.title === "New Chat") {
            getAllChatSessions().then(setAllSessions);
          }
        })
        .catch(e => {
          console.error(e);
          setIsSaving(false);
        });
    }, 1000); // debounce save
    
    return () => clearTimeout(timer);
  }, [messages, sessionId, allSessions]);

  const injectToolResult = (toolCallId: string, output: any) => {
    const newMessages = [...messages];
    let found = false;
    for (const msg of newMessages) {
      if (msg.role === 'assistant' && msg.parts) {
        const part = msg.parts.find((p: any) => p.toolCallId === toolCallId || p.toolInvocation?.toolCallId === toolCallId);
        if (part) {
          if ((part as any).toolInvocation) {
            (part as any).toolInvocation.state = 'result';
            (part as any).toolInvocation.result = output;
          } else {
            (part as any).state = 'output-available';
            (part as any).output = output;
          }
          found = true;
          break;
        }
      }
    }
    if (found) {
      setMessages(newMessages);
    }
  };

  const handleConfirmAdd = async (toolCallId: string, toolName: string, input: any) => {
    try {
      const isOneTime = input.billingFrequency === "ONE_TIME";
      await createSubscription({
        name: input.name,
        cost: Number(input.cost),
        billingFrequency: input.billingFrequency,
        startDate: new Date(input.startDate),
        endDate: isOneTime ? null : (input.endDate ? new Date(input.endDate) : null),
        category: input.category || 'Uncategorized',
      });
      injectToolResult(toolCallId, `Successfully added ${input.name} (RM${input.cost} ${FREQUENCY_LABELS[input.billingFrequency] || input.billingFrequency})!`);
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Something went wrong saving to the database.";
      if (e.message?.includes("Expected BillingFrequency")) {
        errorMsg = "Please restart your Next.js dev server to reload the updated database enums.";
      } else if (e.message) {
        errorMsg = e.message.split('\n')[0].replace(/__TURBOPACK__.*?["']/g, '').substring(0, 120);
      }
      injectToolResult(toolCallId, `Error: ${errorMsg}`);
    }
  };

  const handleConfirmDelete = async (toolCallId: string, toolName: string, input: any) => {
    setDeletingToolCallId(toolCallId);
    try {
      await deleteSubscription(input.id);
      injectToolResult(toolCallId, `Successfully deleted ${input.name} (RM${input.cost} ${FREQUENCY_LABELS[input.billingFrequency] || input.billingFrequency})!`);
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Something went wrong deleting the subscription.";
      if (e.message) {
        errorMsg = e.message.split('\n')[0].replace(/__TURBOPACK__.*?["']/g, '').substring(0, 120);
      }
      injectToolResult(toolCallId, `Error: ${errorMsg}`);
    } finally {
      setDeletingToolCallId(null);
    }
  };

  const isLoading = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Client-side debugging for user
  useEffect(() => {
    console.log("----- CHAT DEBUG -----");
    console.log("STATUS:", status);
    console.log("ERROR:", error);
    console.log("MESSAGES:", messages);
    console.log("----------------------");
  }, [messages, status, error]);

  // Automatic multi-step loop workaround
  useEffect(() => {
    if (status !== 'ready') return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.parts) {
      // Check if there is an unsubmitted tool result
      const hasToolResult = lastMessage.parts.some(p => p.type.startsWith('tool-') && (p as any).state === 'output-available');
      if (hasToolResult) {
        // Automatically trigger follow-up roundtrip so AI can see the tool output
        // @ts-expect-error - AI SDK v7 expects UIMessage without content, but streamText expects content
        sendMessage({ role: 'user', content: '___continue___' });
      }
    }
  }, [messages, status, sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedMessages = [...messages];
    let resolvedAny = false;

    // Find the last assistant message and resolve any pending tool calls as canceled/bypassed
    const lastMsg = updatedMessages[updatedMessages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.parts) {
      lastMsg.parts.forEach((part: any) => {
        const toolInv = part.toolInvocation || part;
        if (
          toolInv && 
          toolInv.toolCallId && 
          (!toolInv.result && toolInv.state !== 'result' && toolInv.state !== 'output-available')
        ) {
          if (part.toolInvocation) {
            part.toolInvocation.state = 'result';
            part.toolInvocation.result = "Canceled (user bypassed prompt by sending a new message).";
          } else {
            part.state = 'output-available';
            part.output = "Canceled (user bypassed prompt by sending a new message).";
          }
          resolvedAny = true;
        }
      });
    }

    if (resolvedAny) {
      setMessages(updatedMessages);
      // Wait for state to commit before triggering sendMessage
      setTimeout(() => {
        // @ts-expect-error error
        sendMessage({ role: "user", content: input });
      }, 0);
    } else {
      // @ts-expect-error error
      sendMessage({ role: "user", content: input });
    }

    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50">
      {/* Browser-like Tabs Header */}
      <div className="flex items-end gap-1 px-2 pt-2 border-b border-border/50 bg-muted/30 overflow-x-auto hide-scrollbar">
        {allSessions.map(session => (
          <div
            key={session.id}
            onClick={() => handleSwitchChat(session.id)}
            className={`
              group flex items-center justify-between gap-2 px-3 py-2 min-w-[120px] max-w-[200px] text-xs font-medium rounded-t-lg transition-colors border border-b-0 cursor-pointer
              ${sessionId === session.id 
                ? 'bg-background border-border/50 text-foreground z-10 -mb-[1px]' 
                : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            <span className="truncate">{session.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setChatToDelete(session.id); }}
              className={`p-[2px] rounded hover:bg-destructive/10 hover:text-destructive transition-opacity ${
                sessionId === session.id 
                  ? 'opacity-100' 
                  : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {allSessions.length < 5 && (
          <button 
            onClick={handleNewChat}
            className="flex items-center justify-center px-3 py-2 ml-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-t-lg transition-colors border border-transparent hover:border-border/50 border-b-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Toolbar / Autosave Status */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-border/50 bg-background">
        <div className="flex items-center gap-2 max-w-[70%]">
          <div className="text-sm font-semibold text-foreground truncate">
            {allSessions.find(s => s.id === sessionId)?.title || "Loading..."}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium whitespace-nowrap">
          <span className="hidden sm:inline-block px-1.5 py-0.5 bg-muted rounded-md text-[10px] uppercase tracking-wider font-semibold">
            {allSessions.length}/5 Chats
          </span>
          <div className="w-[1px] h-3 bg-border/50 mx-1 hidden sm:block" />
          {isSaving ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
          ) : (
            <><Sparkles className="h-3 w-3 text-emerald-500" /> Autosaved</>
          )}
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 text-xs font-mono whitespace-pre-wrap">
          Error: {error.message}
        </div>
      )}

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="h-16 w-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg rotate-12">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Hi, I&apos;m Cento.</h2>
              <p className="text-sm text-muted-foreground">
                Your personal AI financial advisor. I can analyze your spending, roast your subscriptions, or help you manage your bills directly.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  className="flex flex-col items-start p-4 bg-muted/20 hover:bg-muted/60 border border-border/50 rounded-2xl transition-all text-left hover:border-primary/30 group shadow-sm hover:shadow-md"
                  onClick={() => {
                    // @ts-expect-error - AI SDK v7 expects UIMessage without content, but streamText expects content
                    sendMessage({ role: "user", content: suggestion.prompt });
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform origin-bottom-left">{suggestion.icon}</span>
                    <span className="font-semibold text-sm text-foreground">{suggestion.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.filter(m => (m as any).content !== '___continue___').map((m: UIMessage) => {
            const msg = m as any;
            let text = '';
            if (typeof msg.content === 'string' && msg.content.trim() !== '') {
              text = msg.content;
            } else if (msg.parts && Array.isArray(msg.parts)) {
              text = msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text || '').join('');
            }
            const hasText = text.trim() !== '';
            const isUser = m.role === "user";
            const hasToolResult = m.parts?.some((p) => p.type.startsWith('tool-') && ((p as any).state === 'output-available' || (p as any).state === 'result'));

            return (
              <li key={m.id} className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl ${hasText ? "px-4 py-3 shadow-md" : "p-0"} ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : hasText
                        ? "bg-muted/40 text-foreground rounded-tl-sm border border-border/50"
                        : "bg-transparent text-transparent"
                    }`}
                  >
                    {/* Message Content */}
                    {hasText && (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  {/* Tool Invocations Display (Below Chat Bubble) */}
                  {m.parts?.map((part, index) => {
                    if (part.type !== 'tool-invocation' && !part.type.startsWith('tool-')) return null;
                    
                    type AnyToolPart = {
                      toolCallId?: string;
                      toolName?: string;
                      state?: string;
                      result?: unknown;
                      output?: unknown;
                      toolInvocation?: {
                        toolCallId: string;
                        toolName: string;
                        state: string;
                        result?: unknown;
                      };
                    };
                    
                    const p = part as unknown as AnyToolPart & { type: string, output?: unknown, input?: any };
                    const toolCallId = p.toolCallId || p.toolInvocation?.toolCallId;
                    const toolNameRaw = p.toolName || p.toolInvocation?.toolName;
                    const toolName = toolNameRaw || (p.type.startsWith('tool-') ? p.type.split('-')[1] : undefined);
                    const state = p.state || p.toolInvocation?.state || "call";
                    
                    if (!toolCallId || !toolName) return null;

                    const isAwaitingExecution = state === "call" || state === "input-available" || state === "requires-action";

                    const renderToolMessage = () => {
                      if (p.input?.messageToUser) {
                        return (
                          <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-md bg-muted/40 text-foreground rounded-tl-sm border border-border/50 self-start mb-2">
                            <div className="prose prose-sm dark:prose-invert max-w-none break-words font-sans">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {p.input.messageToUser}
                              </ReactMarkdown>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    };

                    // If it's a client-side tool
                    if (toolName === "addSubscription" || toolName === "deleteSubscription") {
                      if (toolName === "addSubscription") {
                        return (
                          <React.Fragment key={toolCallId}>
                            {renderToolMessage()}
                            <EditableAddSubscriptionCard
                              toolCallId={toolCallId}
                              toolName={toolName}
                              initialInput={p.input}
                              handleConfirm={handleConfirmAdd}
                              handleCancel={(id) => injectToolResult(id, "User canceled the operation.")}
                              isCompleted={!isAwaitingExecution}
                              resultText={typeof p.output === 'string' ? p.output : undefined}
                            />
                          </React.Fragment>
                        );
                      }
                      if (toolName === "deleteSubscription") {
                        if (!isAwaitingExecution) {
                          return (
                            <React.Fragment key={toolCallId}>
                              {renderToolMessage()}
                              <div className="mt-2 p-4 rounded-xl border shadow-sm text-sm w-full max-w-sm bg-muted/50 border-border/30 opacity-75">
                                <p className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                  Deleted Subscription
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-3 bg-background/30 p-3 rounded-lg border border-border/30 text-xs">
                                  <div className="col-span-2">Name: <span className="text-foreground font-medium">{p.input?.name || 'Unknown'}</span></div>
                                  <div>Cost: <span className="text-foreground font-medium">{p.input?.cost}</span></div>
                                  <div>Freq: <span className="text-foreground font-medium">{(p.input?.billingFrequency && FREQUENCY_LABELS[p.input.billingFrequency]) || p.input?.billingFrequency}</span></div>
                                  {p.input?.startDate && (
                                    <div className="col-span-2">Since: <span className="text-foreground font-medium">{p.input.startDate.split('T')[0]}</span></div>
                                  )}
                                </div>
                                <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground font-medium text-center">
                                  {typeof p.output === 'string' ? p.output : 'Completed'}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }

                        return (
                          <React.Fragment key={toolCallId}>
                            {renderToolMessage()}
                            <div className="mt-2 p-4 rounded-xl border shadow-md bg-card text-sm w-full max-w-sm">
                              <p className="font-semibold mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                Delete Subscription?
                              </p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg border border-border/50 text-xs">
                                <div className="col-span-2">Name: <span className="text-foreground font-medium">{p.input?.name || 'Unknown'}</span></div>
                                <div>Cost: <span className="text-foreground font-medium">{p.input?.cost}</span></div>
                                <div>Freq: <span className="text-foreground font-medium">{(p.input?.billingFrequency && FREQUENCY_LABELS[p.input.billingFrequency]) || p.input?.billingFrequency}</span></div>
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => injectToolResult(toolCallId, "User canceled the operation.")}
                                  disabled={deletingToolCallId === toolCallId}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleConfirmDelete(toolCallId, toolName, p.input)}
                                  disabled={deletingToolCallId === toolCallId}
                                  className="gap-1.5"
                                >
                                  {deletingToolCallId === toolCallId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  {deletingToolCallId === toolCallId ? "Deleting..." : "Confirm Delete"}
                                </Button>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      }
                    }

                    if (!isAwaitingExecution) return null;

                    // Randomized text based on tool and ID (so it's stable per render)
                    const hash = toolCallId.charCodeAt(0) + (toolCallId.charCodeAt(toolCallId.length - 1) || 0);
                    let loadingText = "Thinking...";
                    
                    if (toolName === 'getSubscriptions') {
                      const opts = ["Rummaging through your bills...", "Auditing your subscriptions...", "Pulling the receipts...", "Checking the damage..."];
                      loadingText = opts[hash % opts.length];
                    } else if (toolName === 'addSubscription') {
                      const opts = ["Logging that expense...", "Adding to the ledger...", "Penciling it in..."];
                      loadingText = opts[hash % opts.length];
                    } else if (toolName === 'deleteSubscription') {
                      const opts = ["Cutting the cord...", "Shredding that subscription...", "Canceling the expense..."];
                      loadingText = opts[hash % opts.length];
                    }

                    return (
                      <div key={toolCallId || index} className="mt-1 flex items-center gap-2 opacity-60 text-xs font-medium italic">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{loadingText}</span>
                      </div>
                    );
                  })}
                </li>
              );
          })
        )}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-muted/40 px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 flex items-center gap-2 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/50 backdrop-blur-xl border-t border-border/50">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-4xl mx-auto bg-muted/30 border border-border/50 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all"
        >
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none focus:outline-none text-sm h-9"
            value={input}
            placeholder="Ask about your subscriptions..."
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-9 w-9 rounded-full shrink-0 brand-gradient"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChatConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
