'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Twitter, Heart, Eye } from 'lucide-react';
import { XMetrics, XTweetsResponse } from '@/@types/analytics';

interface OverviewTabProps {
  xMetrics?: XMetrics;
  xTweetsMetrics?: XTweetsResponse;
}

export function OverviewTab({ xMetrics, xTweetsMetrics }: OverviewTabProps) {
  if (!xMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No X Metrics Available</CardTitle>
          <CardDescription>
            Connect your X account to view live analytics in the overview.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { public_metrics } = xMetrics;
  if (!xTweetsMetrics || xTweetsMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tweet Metrics Available</CardTitle>
          <CardDescription>
            We couldn&apos;t load tweet performance data. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tweets = xTweetsMetrics;
  const tweetAggregate = tweets.reduce(
    (acc, tweet) => {
      const metrics = tweet.public_metrics;
      if (!metrics) {
        return acc;
      }
      const impressions = metrics.impression_count ?? 0;
      const engagements =
        (metrics.like_count ?? 0) +
        (metrics.reply_count ?? 0) +
        (metrics.retweet_count ?? 0) +
        (metrics.quote_count ?? 0);
      acc.impressions += impressions;
      acc.engagements += engagements;
      return acc;
    },
    { impressions: 0, engagements: 0 },
  );
  const totalImpressionsFromTweets = tweetAggregate.impressions;
  const engagementRateFromTweets =
    tweetAggregate.impressions > 0
      ? (tweetAggregate.engagements / tweetAggregate.impressions) * 100
      : 0;
  const totalImpressions = totalImpressionsFromTweets;
  const totalEngagements = tweetAggregate.engagements;
  const engagementRate = engagementRateFromTweets;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const summaryCards = [
    {
      title: 'Total Followers',
      value: formatNumber(public_metrics.followers_count),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Tweets',
      value: formatNumber(tweets.length),
      subtitle: 'Recent tweets',
      icon: Twitter,
      color: 'text-sky-500',
    },
    {
      title: 'Total Impressions',
      value: formatNumber(totalImpressions),
      subtitle: totalImpressionsFromTweets ? 'Across recent tweets' : 'Last 30 days',
      icon: Eye,
      color: 'text-purple-500',
    },
    {
      title: 'Avg Engagement Rate',
      value: engagementRate.toFixed(1) + '%',
      subtitle: 'Across recent tweets',
      icon: Heart,
      color: 'text-pink-500',
    },
  ];

  const tweetsByDate = tweets.reduce<
    Record<string, { date: string; impressions: number; engagements: number; tweets: number }>
  >((acc, tweet) => {
    const metrics = tweet.public_metrics;
    if (!metrics) {
      return acc;
    }
    const date = new Date(tweet.created_at);
    if (Number.isNaN(date.getTime())) {
      return acc;
    }
    const dateKey = date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, impressions: 0, engagements: 0, tweets: 0 };
    }
    acc[dateKey].impressions += metrics.impression_count ?? 0;
    acc[dateKey].engagements +=
      (metrics.like_count ?? 0) +
      (metrics.reply_count ?? 0) +
      (metrics.retweet_count ?? 0) +
      (metrics.quote_count ?? 0);
    acc[dateKey].tweets += 1;
    return acc;
  }, {});

  const engagementOverTimeData = Object.values(tweetsByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Account Overview</h2>
        <p className="text-muted-foreground mt-1">
          @{xMetrics.username}&apos;s account performance at a glance
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
          <CardDescription>Daily impressions and engagement for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={engagementOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Impressions"
              />
              <Line
                type="monotone"
                dataKey="engagements"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Engagements"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tweet Activity</CardTitle>
          <CardDescription>Number of tweets posted per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="tweets" fill="hsl(var(--chart-3))" name="Tweets Posted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Following</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(public_metrics.following_count)}</p>
            <p className="text-xs text-muted-foreground mt-1">Accounts you follow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(public_metrics.listed_count)}</p>
            <p className="text-xs text-muted-foreground mt-1">Times added to lists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(totalEngagements)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across recent tweets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
