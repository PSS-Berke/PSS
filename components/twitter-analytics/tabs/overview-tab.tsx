'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type { MockTwitterAnalytics } from '../interfaces';

interface OverviewTabProps {
  data: MockTwitterAnalytics;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { account_summary, engagement_over_time } = data;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const summaryCards = [
    {
      title: 'Total Followers',
      value: formatNumber(account_summary.followers_count),
      change: account_summary.followers_change_30d,
      changeLabel: '30 days',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Tweets',
      value: formatNumber(account_summary.tweet_count),
      icon: Twitter,
      color: 'text-sky-500',
    },
    {
      title: 'Total Impressions',
      value: formatNumber(account_summary.total_impressions_30d),
      subtitle: 'Last 30 days',
      icon: Eye,
      color: 'text-purple-500',
    },
    {
      title: 'Avg Engagement Rate',
      value: account_summary.avg_engagement_rate.toFixed(1) + '%',
      subtitle: 'Last 30 days',
      icon: Heart,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Account Overview</h2>
        <p className="text-muted-foreground mt-1">Your Twitter/X account performance at a glance</p>
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
                {card.change !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {card.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500">
                          +{formatNumber(card.change)} {card.changeLabel}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">
                          {formatNumber(card.change)} {card.changeLabel}
                        </span>
                      </>
                    )}
                  </div>
                )}
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
            <LineChart data={engagement_over_time}>
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
            <BarChart data={engagement_over_time}>
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
            <p className="text-2xl font-bold">{formatNumber(account_summary.following_count)}</p>
            <p className="text-xs text-muted-foreground mt-1">Accounts you follow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(account_summary.listed_count)}</p>
            <p className="text-xs text-muted-foreground mt-1">Times added to lists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(account_summary.total_engagements_30d)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
