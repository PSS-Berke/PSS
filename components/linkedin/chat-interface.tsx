'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { Send, Loader2, Bot, User } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, sendMessage } = useLinkedIn();

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
              I&apos;m here to help you create engaging LinkedIn content. What would you like to work on today?
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
          state.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
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
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <div className="whitespace-pre-wrap text-sm">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' 
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
          ))
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
