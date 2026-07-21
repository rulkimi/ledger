"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createSubscription, deleteSubscription } from "@/actions/subscription";

function EditableAddSubscriptionCard({ 
  toolCallId, toolName, initialInput, handleConfirm, handleCancel, isCompleted, resultText 
}: { 
  toolCallId: string, toolName: string, initialInput: any, handleConfirm: (id: string, name: string, input: any) => void, handleCancel: (id: string) => void, isCompleted: boolean, resultText?: string 
}) {
  const [formData, setFormData] = useState(initialInput || {});

  useEffect(() => {
    if (!isCompleted && initialInput && Object.keys(initialInput).length > 0) {
      setFormData(initialInput);
    }
  }, [initialInput, isCompleted]);

  if (isCompleted) {
    return (
      <div className="mt-2 p-4 rounded-xl border shadow-sm text-sm w-full max-w-sm bg-muted/50 border-border/30 opacity-75">
        <p className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          Added Subscription
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-3 bg-background/30 p-3 rounded-lg border border-border/30 text-xs">
          <div className="col-span-2">Name: <span className="text-foreground font-medium">{formData.name}</span></div>
          <div>Cost: <span className="text-foreground font-medium">{formData.cost}</span></div>
          <div>Freq: <span className="text-foreground font-medium">{formData.billingFrequency}</span></div>
          {formData.startDate && (
            <div className="col-span-2">Since: <span className="text-foreground font-medium">{formData.startDate.split('T')[0]}</span></div>
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
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Input 
              className="h-8 mt-1" 
              value={formData.billingFrequency || ""} 
              onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value.toUpperCase() })} 
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Input 
            type="date"
            className="h-8 mt-1" 
            value={formData.startDate ? formData.startDate.split('T')[0] : ""} 
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={() => handleCancel(toolCallId)}>Cancel</Button>
        <Button size="sm" onClick={() => handleConfirm(toolCallId, toolName, formData)}>Confirm & Add</Button>
      </div>
    </div>
  );
}


const SUGGESTIONS = [
  "Roast my financial choices 🌶️",
  "Where can I cut costs? ✂️",
  "Check all my subscriptions 📋",
];

export function ChatUI() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, setMessages } = useChat({
    // Optional config here
  });

  const injectToolResult = (toolCallId: string, output: any) => {
    const newMessages = [...messages];
    const lastMsg = newMessages[newMessages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.parts) {
      const part = lastMsg.parts.find((p: any) => p.toolCallId === toolCallId || p.toolInvocation?.toolCallId === toolCallId);
      if (part) {
        if ((part as any).toolInvocation) {
          (part as any).toolInvocation.state = 'result';
          (part as any).toolInvocation.result = output;
        } else {
          (part as any).state = 'output-available';
          (part as any).output = output;
        }
      }
    }
    setMessages(newMessages);
  };

  const handleConfirmAdd = async (toolCallId: string, toolName: string, input: any) => {
    try {
      await createSubscription({
        name: input.name,
        cost: Number(input.cost),
        billingFrequency: input.billingFrequency,
        startDate: new Date(input.startDate),
        category: input.category || 'Uncategorized',
      });
      injectToolResult(toolCallId, `Successfully added ${input.name} (RM${input.cost} ${input.billingFrequency})!`);
    } catch (e: any) {
      injectToolResult(toolCallId, `Error adding subscription: ${e.message}`);
    }
  };

  const handleConfirmDelete = async (toolCallId: string, toolName: string, input: any) => {
    try {
      await deleteSubscription(input.id);
      injectToolResult(toolCallId, `Successfully deleted ${input.name} (RM${input.cost} ${input.billingFrequency})!`);
    } catch (e: any) {
      injectToolResult(toolCallId, `Error deleting subscription: ${e.message}`);
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
    // @ts-expect-error - AI SDK v7 expects UIMessage without content, but streamText expects content
    sendMessage({ role: "user", content: input });
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
              <h2 className="text-xl font-bold mb-2">Ready to talk money?</h2>
              <p className="text-sm text-muted-foreground">
                I can analyze your spending, roast your subscriptions, or help you manage your bills directly.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="w-full justify-start text-left bg-muted/20 hover:bg-muted/50 border-border/50"
                  onClick={() => {
                    // @ts-expect-error - AI SDK v7 expects UIMessage without content, but streamText expects content
                    sendMessage({ role: "user", content: suggestion });
                  }}
                >
                  {suggestion}
                </Button>
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

                    // If it's a client-side tool
                    if (toolName === "addSubscription" || toolName === "deleteSubscription") {
                      if (toolName === "addSubscription") {
                        return (
                          <EditableAddSubscriptionCard
                            key={toolCallId}
                            toolCallId={toolCallId}
                            toolName={toolName}
                            initialInput={p.input}
                            handleConfirm={handleConfirmAdd}
                            handleCancel={(id) => injectToolResult(id, "User canceled the operation.")}
                            isCompleted={!isAwaitingExecution}
                            resultText={typeof p.output === 'string' ? p.output : undefined}
                          />
                        );
                      }
                      if (toolName === "deleteSubscription") {
                        if (!isAwaitingExecution) {
                          return (
                            <div key={toolCallId} className="mt-2 p-4 rounded-xl border shadow-sm text-sm w-full max-w-sm bg-muted/50 border-border/30 opacity-75">
                              <p className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                Deleted Subscription
                              </p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground mb-3 bg-background/30 p-3 rounded-lg border border-border/30 text-xs">
                                <div className="col-span-2">Name: <span className="text-foreground font-medium">{p.input?.name || 'Unknown'}</span></div>
                                <div>Cost: <span className="text-foreground font-medium">{p.input?.cost}</span></div>
                                <div>Freq: <span className="text-foreground font-medium">{p.input?.billingFrequency}</span></div>
                                {p.input?.startDate && (
                                  <div className="col-span-2">Since: <span className="text-foreground font-medium">{p.input.startDate.split('T')[0]}</span></div>
                                )}
                              </div>
                              <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground font-medium text-center">
                                {typeof p.output === 'string' ? p.output : 'Completed'}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={toolCallId} className="mt-2 p-5 bg-background rounded-xl border border-destructive/30 shadow-md text-sm w-full max-w-[425px]">
                            <p className="font-semibold mb-3 text-destructive flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" /> 
                              Confirm Deletion
                            </p>
                            <p className="text-muted-foreground mb-4">Are you sure you want to cancel your <span className="font-semibold text-foreground">{p.input?.name || "this subscription"}</span> subscription?</p>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground my-4 bg-background/50 p-3 rounded-lg border border-border/50">
                              <div>Cost: <span className="text-foreground font-medium">{p.input?.cost}</span></div>
                              <div>Freq: <span className="text-foreground font-medium">{p.input?.billingFrequency}</span></div>
                              {p.input?.startDate && (
                                <div className="col-span-2">Since: <span className="text-foreground font-medium">{p.input.startDate.split('T')[0]}</span></div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => injectToolResult(toolCallId, "User canceled the operation.")}>Cancel</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleConfirmDelete(toolCallId, toolName, p.input)}>Confirm Delete</Button>
                            </div>
                          </div>
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
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
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
    </div>
  );
}
