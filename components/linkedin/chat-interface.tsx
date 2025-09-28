'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { Send, Loader2, Bot, User, Copy, Check } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, sendMessage } = useLinkedIn();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const copyResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debug logging
  console.log('ChatInterface: Current state:', {
    currentSession: state.currentSession,
    messagesCount: state.messages.length,
    isLoading: state.isLoading,
    error: state.error
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    return () => {
      if (copyResetTimeout.current) {
        clearTimeout(copyResetTimeout.current);
      }
    };
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isSendingMessage) return;

    const messageToSend = message.trim();
    setMessage('');
    await sendMessage(messageToSend);
  };

  const formatTimestamp = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async (content: string, messageId: string) => {
    if (!content) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedMessageId(messageId);
      if (copyResetTimeout.current) {
        clearTimeout(copyResetTimeout.current);
      }
      copyResetTimeout.current = setTimeout(() => {
        setCopiedMessageId(null);
        copyResetTimeout.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy message', error);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">LinkedIn Copilot</h2>
          <p className="text-sm text-muted-foreground">
            {state.currentSession ? state.currentSession.session_name : 'Starting new session...'}
          </p>
        </div>
        {state.isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Welcome to LinkedIn Copilot</h3>
            <p className="text-muted-foreground mb-4">
              {"I'm here to help you create engaging LinkedIn content. What would you like to work on today?"}
            </p>
            <div className="text-sm text-muted-foreground">
              Try asking me to:
              <ul className="mt-2 space-y-1">
                <li>• Create a post about your latest product launch</li>
                <li>• Write a thought leadership piece</li>
                <li>• Help with LinkedIn marketing strategy</li>
              </ul>
            </div>
          </div>
        ) : (
          state.messages.map((msg) => {
            const messageId = String(msg.id);
            const isUserMessage = msg.role === 'user';
            const isAiMessage = msg.role === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  isUserMessage ? 'justify-end' : 'justify-start'
                }`}
              >
              {msg.role === 'ai' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}

              <Card className={`max-w-[80%] p-3 ${
                isUserMessage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <div className="flex items-start gap-2">
                  <div className="whitespace-pre-wrap text-sm flex-1">
                    {msg.content}
                  </div>
                  {isAiMessage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(msg.content ?? '', messageId)}
                      aria-label={copiedMessageId === messageId ? 'Copied' : 'Copy message'}
                    >
                      {copiedMessageId === messageId ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className={`text-xs mt-2 ${
                  isUserMessage
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}>
                  {formatTimestamp(msg.created_at)}
                </div>
              </Card>

              {msg.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
            );
          })
        )}
        
        {state.isSendingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Card className="bg-muted p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {state.error && (
        <div className="px-4 py-2">
          <Card className="bg-destructive/10 border-destructive/20 p-3">
            <p className="text-sm text-destructive">{state.error}</p>
          </Card>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={state.isSendingMessage || state.isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || state.isSendingMessage || state.isLoading}
            size="icon"
          >
            {state.isSendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
