'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, Eye, Heart, Repeat2, MessageCircle, MousePointer } from 'lucide-react';
import type { MockTwitterAnalytics } from '../interfaces';

interface TweetPerformanceTabProps {
  data: MockTwitterAnalytics;
}

export function TweetPerformanceTab({ data }: TweetPerformanceTabProps) {
  const { top_tweets } = data;
  const [sortBy, setSortBy] = useState<'impressions' | 'engagement_rate' | 'engagements'>(
    'impressions',
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const sortedTweets = [...top_tweets].sort((a, b) => {
    if (sortBy === 'impressions') return b.impressions - a.impressions;
    if (sortBy === 'engagement_rate') return b.engagement_rate - a.engagement_rate;
    return b.engagements - a.engagements;
  });

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getEngagementBadge = (rate: number) => {
    if (rate >= 6) return <Badge variant="default">Excellent</Badge>;
    if (rate >= 4) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="outline">Average</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Tweet Performance</h2>
        <p className="text-muted-foreground mt-1">
          Analyze your top performing tweets and their metrics
        </p>
      </div>

      {/* Top Tweets Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Top Performing Tweets</CardTitle>
              <CardDescription>Your best tweets based on engagement metrics</CardDescription>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <Badge
                variant={sortBy === 'impressions' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy('impressions')}
              >
                Impressions
              </Badge>
              <Badge
                variant={sortBy === 'engagement_rate' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy('engagement_rate')}
              >
                Eng. Rate
              </Badge>
              <Badge
                variant={sortBy === 'engagements' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy('engagements')}
              >
                Total Eng.
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Tweet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Engagements</TableHead>
                  <TableHead className="text-right">Eng. Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTweets.map((tweet) => (
                  <TableRow key={tweet.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{truncateText(tweet.text)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tweet.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(tweet.impressions)}</TableCell>
                    <TableCell className="text-right">{formatNumber(tweet.engagements)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {tweet.engagement_rate.toFixed(1)}%
                    </TableCell>
                    <TableCell>{getEngagementBadge(tweet.engagement_rate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedTweets.map((tweet) => (
              <Card key={tweet.id}>
                <CardContent className="pt-6">
                  <p className="font-medium mb-3">{tweet.text}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(tweet.created_at).toLocaleDateString()}
                    </span>
                    {getEngagementBadge(tweet.engagement_rate)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-semibold">{formatNumber(tweet.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagements</p>
                      <p className="font-semibold">{formatNumber(tweet.engagements)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Engagement Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedTweets.slice(0, 2).map((tweet, index) => (
          <Card key={tweet.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {index === 0 ? '🥇 Top Tweet' : '🥈 Second Best'}
              </CardTitle>
              <CardDescription className="line-clamp-2">{tweet.text}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Impressions</span>
                </div>
                <span className="font-semibold">{formatNumber(tweet.impressions)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm text-muted-foreground">Likes</span>
                </div>
                <span className="font-semibold">{formatNumber(tweet.likes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Retweets</span>
                </div>
                <span className="font-semibold">{formatNumber(tweet.retweets)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Replies</span>
                </div>
                <span className="font-semibold">{formatNumber(tweet.replies)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Clicks</span>
                </div>
                <span className="font-semibold">{formatNumber(tweet.clicks)}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Engagement Rate</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {tweet.engagement_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key takeaways from your tweet performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="font-medium">High Engagement Content</p>
                <p className="text-sm text-muted-foreground">
                  Tweets with questions or polls generate 40% more engagement on average
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <p className="font-medium">Product Announcements</p>
                <p className="text-sm text-muted-foreground">
                  Product-related tweets show the highest impression rates
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <p className="font-medium">Thread Performance</p>
                <p className="text-sm text-muted-foreground">
                  Long-form threads maintain engagement with 6.2% average rate
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
