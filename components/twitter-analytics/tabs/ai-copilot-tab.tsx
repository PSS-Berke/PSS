'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Sparkles, TrendingUp, Clock, Target, Zap, MessageSquare } from 'lucide-react';
import type { MockTwitterAnalytics } from '../interfaces';

interface AICopilotTabProps {
  data: MockTwitterAnalytics;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AICopilotTab({ data }: AICopilotTabProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm your Twitter Analytics AI Copilot. I can help you understand your performance, suggest content strategies, and answer questions about your account. Try asking me something!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    {
      icon: TrendingUp,
      question: "What's my best performing tweet this month?",
      category: 'Performance',
    },
    {
      icon: Clock,
      question: 'When should I post for maximum engagement?',
      category: 'Timing',
    },
    {
      icon: Target,
      question: 'How can I improve my engagement rate?',
      category: 'Strategy',
    },
    {
      icon: Zap,
      question: 'What content type performs best for me?',
      category: 'Content',
    },
  ];

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Simulate AI response based on query
    setTimeout(() => {
      const response = generateMockResponse(query, data);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          AI Analytics Copilot
        </h2>
        <p className="text-muted-foreground mt-1">
          Ask questions about your Twitter performance and get AI-powered insights
        </p>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Questions
          </CardTitle>
          <CardDescription>Click any question to get instant insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(item.question)}
                  className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm mb-1">{item.question}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex flex-col" style={{ height: '500px' }}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </CardTitle>
          <CardDescription>Ask me anything about your Twitter analytics</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs font-semibold">AI Copilot</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span className="text-xs font-semibold">AI Copilot</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about your Twitter analytics..."
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!query.trim() || isLoading}
              className="h-[80px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>What I Can Help With</CardTitle>
          <CardDescription>Here are some things you can ask me about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Performance Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Top performing tweets and why they worked</li>
                <li>Engagement rate trends and patterns</li>
                <li>Impression and reach analysis</li>
                <li>Comparison of different time periods</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Content Strategy</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Best times to post for your audience</li>
                <li>Content type recommendations</li>
                <li>Hashtag performance insights</li>
                <li>Thread vs single tweet analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Audience Growth</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Follower growth trends</li>
                <li>Retention rate analysis</li>
                <li>Growth projections</li>
                <li>Engagement quality metrics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Actionable Insights</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Personalized improvement suggestions</li>
                <li>Content calendar optimization</li>
                <li>Benchmark comparisons</li>
                <li>Goal setting and tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock response generator based on query content
function generateMockResponse(query: string, data: MockTwitterAnalytics): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('best') && lowerQuery.includes('tweet')) {
    const topTweet = data.top_tweets[0];
    return `Your best performing tweet this month is:\n\n"${topTweet.text}"\n\nPosted on ${new Date(topTweet.created_at).toLocaleDateString()}\n\n📊 Performance:\n• ${topTweet.impressions.toLocaleString()} impressions\n• ${topTweet.engagements.toLocaleString()} total engagements\n• ${topTweet.engagement_rate}% engagement rate\n• ${topTweet.likes} likes, ${topTweet.retweets} retweets, ${topTweet.replies} replies\n\n✨ Why it worked: This tweet likely resonated because it announced something new and exciting, creating urgency and curiosity among your followers.`;
  }

  if (lowerQuery.includes('when') && lowerQuery.includes('post')) {
    return `Based on your historical data, here are your best posting times:\n\n🎯 Top 3 Times for Maximum Engagement:\n1. Tuesdays at 2-3pm (6.4% avg engagement)\n2. Wednesdays at 11am-12pm (6.1% avg engagement)\n3. Thursdays at 3-4pm (5.9% avg engagement)\n\n📈 Pro tip: Your business hours (9am-5pm) on weekdays consistently outperform evenings and weekends. Schedule your most important content during these windows!`;
  }

  if (lowerQuery.includes('improve') && lowerQuery.includes('engagement')) {
    return `Here are 5 actionable ways to improve your ${data.account_summary.avg_engagement_rate}% engagement rate:\n\n1. 📷 Add More Media: Your media tweets (5.6% engagement) outperform text-only (4.2%). Include images or videos in every tweet.\n\n2. 💬 Ask Questions: Tweets with polls or questions drive 40% more replies and engagement.\n\n3. 🧵 Use Threads: Your threads average 6.1% engagement vs 4.2% for single tweets.\n\n4. #️⃣ Strategic Hashtags: Use your top performer #ProductLaunch which averages 5.8% engagement.\n\n5. ⏰ Post at Peak Times: Schedule content for Tuesday-Thursday afternoons when your audience is most active.`;
  }

  if (lowerQuery.includes('content type')) {
    return `Here's how your different content types perform:\n\n🥇 Best: Threads (6.1% engagement)\n• 12 threads posted\n• Great for educational content and storytelling\n\n🥈 Second: Media Tweets (5.6% engagement)\n• 23 tweets with images/videos\n• Visual content captures attention\n\n🥉 Third: Original Tweets (4.2% engagement)\n• 45 standalone tweets\n• Your bread and butter content\n\n📉 Lowest: Replies (2.8% engagement)\n• 87 replies to others\n• Less visibility but good for community building\n\n💡 Recommendation: Increase your thread and media tweet frequency by 30% to boost overall engagement.`;
  }

  if (lowerQuery.includes('follower') || lowerQuery.includes('growth')) {
    return `Your follower growth is trending positively! 📈\n\n📊 30-Day Summary:\n• Current followers: ${data.account_summary.followers_count.toLocaleString()}\n• New followers gained: ${data.audience_growth.reduce((sum, day) => sum + day.followers_gained, 0)}\n• Followers lost: ${data.audience_growth.reduce((sum, day) => sum + day.followers_lost, 0)}\n• Net growth: +${data.account_summary.followers_change_30d}\n• Growth rate: ${((data.account_summary.followers_change_30d / data.account_summary.followers_count) * 100).toFixed(2)}%\n\n🎯 Projection: At this pace, you'll reach ${(data.account_summary.followers_count + data.account_summary.followers_change_30d * 3).toLocaleString()} followers in 90 days!\n\n✨ Your retention rate is strong at ${(((data.audience_growth.reduce((sum, day) => sum + day.followers_gained, 0) - data.audience_growth.reduce((sum, day) => sum + day.followers_lost, 0)) / data.audience_growth.reduce((sum, day) => sum + day.followers_gained, 0)) * 100).toFixed(1)}%, meaning most new followers stick around.`;
  }

  // Default response
  return `I'd be happy to help you with that! I can provide insights on:\n\n• Tweet performance and engagement metrics\n• Best posting times for your audience\n• Content strategy recommendations\n• Follower growth analysis\n• Hashtag and conversation analytics\n\nCould you rephrase your question or try one of the quick questions above? I'm here to help you make data-driven decisions for your Twitter strategy! 🚀`;
}
