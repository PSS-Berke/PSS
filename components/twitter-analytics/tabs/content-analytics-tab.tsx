'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Image as ImageIcon, Repeat2, Hash, Clock, TrendingUp } from 'lucide-react';
import type { MockTwitterAnalytics } from '../interfaces';

interface ContentAnalyticsTabProps {
  data: MockTwitterAnalytics;
}

export function ContentAnalyticsTab({ data }: ContentAnalyticsTabProps) {
  const { content_breakdown, posting_times, top_hashtags, top_conversations } = data;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Colors for charts
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ];

  // Get best posting times (top 5 by engagement rate)
  const bestPostingTimes = [...posting_times]
    .filter((time) => time.tweet_count > 0)
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 5);

  // Aggregate posting times by hour for heatmap
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = posting_times.filter((time) => time.hour === hour);
    const avgEngagement =
      hourData.reduce((sum, time) => sum + time.engagement_rate, 0) / hourData.length;
    const totalTweets = hourData.reduce((sum, time) => sum + time.tweet_count, 0);

    return {
      hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
      engagement_rate: parseFloat(avgEngagement.toFixed(1)),
      tweet_count: totalTweets,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Content Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Understand what content resonates with your audience
        </p>
      </div>

      {/* Content Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Type Distribution</CardTitle>
            <CardDescription>Your tweet composition by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={content_breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {content_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement by Content Type</CardTitle>
            <CardDescription>Average engagement rate per type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={content_breakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="type" type="category" width={120} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="avg_engagement_rate" fill="hsl(var(--chart-2))" name="Eng. Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {content_breakdown.map((item, index) => {
          const icons = [MessageSquare, Repeat2, ImageIcon, Hash];
          const Icon = icons[index % icons.length];
          return (
            <Card key={item.type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.type}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.avg_engagement_rate.toFixed(1)}% avg engagement
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(item.total_impressions)} impressions
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Best Posting Times */}
      <Card>
        <CardHeader>
          <CardTitle>Optimal Posting Times</CardTitle>
          <CardDescription>When your tweets get the most engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {bestPostingTimes.map((time, index) => (
              <div key={`${time.day}-${time.hour}`} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {time.day} at{' '}
                      {time.hour === 0
                        ? '12am'
                        : time.hour < 12
                          ? `${time.hour}am`
                          : time.hour === 12
                            ? '12pm'
                            : `${time.hour - 12}pm`}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {time.engagement_rate}% engagement
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(time.engagement_rate / 7) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="engagement_rate" fill="hsl(var(--chart-3))" name="Avg Engagement %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Hashtags and Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Hashtags</CardTitle>
            <CardDescription>Hashtags driving the most engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_hashtags.map((hashtag, index) => (
                <div key={hashtag.hashtag}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{hashtag.hashtag}</span>
                      <span className="text-xs text-muted-foreground">
                        ({hashtag.usage_count}x)
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {hashtag.avg_engagement_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatNumber(hashtag.total_impressions)} impressions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Conversations</CardTitle>
            <CardDescription>Tweets that sparked the most discussion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_conversations.map((conv, index) => (
                <div key={conv.conversation_id} className="p-3 rounded-lg border">
                  <p className="text-sm font-medium mb-2 line-clamp-2">{conv.root_tweet_text}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Replies</p>
                      <p className="font-semibold">{conv.total_replies}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Depth</p>
                      <p className="font-semibold">{conv.max_depth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Eng. Rate</p>
                      <p className="font-semibold text-green-600">{conv.engagement_rate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Content Recommendations</CardTitle>
          <CardDescription>AI-powered insights to improve your content strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Use More Media</p>
                <p className="text-sm text-muted-foreground">
                  Media tweets have 5.6% engagement vs 4.2% for text-only. Add images or videos to
                  boost performance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Post During Peak Hours</p>
                <p className="text-sm text-muted-foreground">
                  Your best engagement is on {bestPostingTimes[0].day}s at{' '}
                  {bestPostingTimes[0].hour > 12
                    ? `${bestPostingTimes[0].hour - 12}pm`
                    : `${bestPostingTimes[0].hour}am`}
                  . Schedule important tweets for this time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Hash className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Leverage Top Hashtags</p>
                <p className="text-sm text-muted-foreground">
                  {top_hashtags[0].hashtag} performs best with{' '}
                  {top_hashtags[0].avg_engagement_rate.toFixed(1)}% engagement. Use it strategically
                  in relevant tweets.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
