'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, TrendingDown, UserPlus, UserMinus } from 'lucide-react';
import type { MockTwitterAnalytics } from '../interfaces';

interface AudienceInsightsTabProps {
  data: MockTwitterAnalytics;
}

export function AudienceInsightsTab({ data }: AudienceInsightsTabProps) {
  const { audience_growth, account_summary } = data;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate totals
  const totalGained = audience_growth.reduce((sum, day) => sum + day.followers_gained, 0);
  const totalLost = audience_growth.reduce((sum, day) => sum + day.followers_lost, 0);
  const netGrowth = totalGained - totalLost;
  const avgDailyGrowth = (netGrowth / audience_growth.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Audience Insights</h2>
        <p className="text-muted-foreground mt-1">
          Track your follower growth and audience metrics
        </p>
      </div>

      {/* Growth Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(account_summary.followers_count)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current follower count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers Gained</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(totalGained)}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers Lost</CardTitle>
            <UserMinus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(totalLost)}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            {netGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {netGrowth >= 0 ? '+' : ''}
              {formatNumber(netGrowth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Avg {avgDailyGrowth}/day</p>
          </CardContent>
        </Card>
      </div>

      {/* Follower Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Follower Growth Trend</CardTitle>
          <CardDescription>Total followers over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={audience_growth}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="followers"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#colorFollowers)"
                name="Total Followers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Growth/Loss Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Follower Activity</CardTitle>
          <CardDescription>Daily breakdown of followers gained and lost</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={audience_growth}>
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
                dataKey="followers_gained"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Gained"
              />
              <Line
                type="monotone"
                dataKey="followers_lost"
                stroke="hsl(var(--chart-5))"
                strokeWidth={2}
                name="Lost"
              />
              <Line
                type="monotone"
                dataKey="net_growth"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Net Growth"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Growth Rate Analysis</CardTitle>
            <CardDescription>Your follower growth momentum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {((netGrowth / audience_growth[0].followers) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((netGrowth / audience_growth[0].followers) * 100 * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Retention Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {(((totalGained - totalLost) / totalGained) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${((totalGained - totalLost) / totalGained) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                At your current growth rate, you&apos;ll reach{' '}
                <span className="font-semibold text-foreground">
                  {formatNumber(Math.floor(account_summary.followers_count + netGrowth * 3))}
                </span>{' '}
                followers in 90 days.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Insights</CardTitle>
            <CardDescription>Key observations about your audience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Positive Growth Trend</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You&apos;re gaining more followers than losing over the past 30 days
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">High Retention</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(((totalGained - totalLost) / totalGained) * 100).toFixed(0)}% of new followers
                    stay engaged with your content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Consistent Activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average of {avgDailyGrowth} new followers per day maintains steady growth
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
