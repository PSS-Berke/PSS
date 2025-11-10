// Twitter API Response Types
export interface TwitterPublicMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  bookmark_count?: number;
  impression_count?: number;
}

export interface TwitterNonPublicMetrics {
  impression_count: number;
  url_link_clicks: number;
  user_profile_clicks: number;
}

export interface TwitterOrganicMetrics {
  impression_count: number;
  like_count: number;
  reply_count: number;
  retweet_count: number;
  url_link_clicks: number;
  user_profile_clicks: number;
}

export interface TwitterPromotedMetrics {
  impression_count: number;
  like_count: number;
  reply_count: number;
  retweet_count: number;
  url_link_clicks: number;
  user_profile_clicks: number;
}

export interface TwitterVideoMetrics {
  view_count: number;
  playback_0_count: number;
  playback_25_count: number;
  playback_50_count: number;
  playback_75_count: number;
  playback_100_count: number;
}

export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  conversation_id: string;
  public_metrics: TwitterPublicMetrics;
  non_public_metrics?: TwitterNonPublicMetrics;
  organic_metrics?: TwitterOrganicMetrics;
  promoted_metrics?: TwitterPromotedMetrics;
  attachments?: {
    media_keys?: string[];
  };
}

export interface TwitterUserMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  public_metrics: TwitterUserMetrics;
}

// UI Component Types
export interface AccountSummaryCard {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface TweetPerformance {
  id: string;
  text: string;
  created_at: string;
  impressions: number;
  engagements: number;
  engagement_rate: number;
  likes: number;
  retweets: number;
  replies: number;
  clicks: number;
}

export interface EngagementChartData {
  date: string;
  impressions: number;
  engagements: number;
  tweets: number;
  engagement_rate: number;
}

export interface ContentTypeBreakdown {
  type: string;
  count: number;
  avg_engagement_rate: number;
  total_impressions: number;
}

export interface PostingTimeHeatmap {
  day: string;
  hour: number;
  engagement_rate: number;
  tweet_count: number;
}

export interface AudienceGrowthData {
  date: string;
  followers: number;
  followers_gained: number;
  followers_lost: number;
  net_growth: number;
}

export interface ConversationMetrics {
  conversation_id: string;
  root_tweet_id: string;
  root_tweet_text: string;
  total_replies: number;
  max_depth: number;
  total_engagements: number;
  engagement_rate: number;
}

export interface TopPerformingHashtag {
  hashtag: string;
  usage_count: number;
  avg_engagement_rate: number;
  total_impressions: number;
}

// Mock Data Types for Development
export interface MockTwitterAnalytics {
  account_summary: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    followers_change_30d: number;
    avg_engagement_rate: number;
    total_impressions_30d: number;
    total_engagements_30d: number;
  };
  top_tweets: TweetPerformance[];
  engagement_over_time: EngagementChartData[];
  content_breakdown: ContentTypeBreakdown[];
  posting_times: PostingTimeHeatmap[];
  audience_growth: AudienceGrowthData[];
  top_conversations: ConversationMetrics[];
  top_hashtags: TopPerformingHashtag[];
}
