import type { MockTwitterAnalytics } from './interfaces';
import { subDays, format } from 'date-fns';

// Generate mock data for Twitter analytics
export const MOCK_TWITTER_DATA: MockTwitterAnalytics = {
  account_summary: {
    followers_count: 15420,
    following_count: 823,
    tweet_count: 3847,
    listed_count: 142,
    followers_change_30d: 328,
    avg_engagement_rate: 3.8,
    total_impressions_30d: 284500,
    total_engagements_30d: 10811,
  },

  top_tweets: [
    {
      id: '1',
      text: 'Just launched our new product! 🚀 Check it out and let us know what you think. #ProductLaunch',
      created_at: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      impressions: 12450,
      engagements: 847,
      engagement_rate: 6.8,
      likes: 523,
      retweets: 187,
      replies: 94,
      clicks: 43,
    },
    {
      id: '2',
      text: 'Thread: 5 tips for improving your social media strategy 🧵👇',
      created_at: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      impressions: 9870,
      engagements: 612,
      engagement_rate: 6.2,
      likes: 421,
      retweets: 134,
      replies: 45,
      clicks: 12,
    },
    {
      id: '3',
      text: 'Behind the scenes of our team working on the next big update 💻',
      created_at: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      impressions: 8240,
      engagements: 456,
      engagement_rate: 5.5,
      likes: 312,
      retweets: 89,
      replies: 38,
      clicks: 17,
    },
    {
      id: '4',
      text: 'Quick poll: What feature would you like to see next? Drop your ideas below! 💡',
      created_at: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      impressions: 7650,
      engagements: 523,
      engagement_rate: 6.8,
      likes: 267,
      retweets: 54,
      replies: 178,
      clicks: 24,
    },
    {
      id: '5',
      text: 'Happy Monday! Here\'s your weekly motivation to crush your goals 💪',
      created_at: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
      impressions: 6890,
      engagements: 389,
      engagement_rate: 5.6,
      likes: 298,
      retweets: 67,
      replies: 18,
      clicks: 6,
    },
  ],

  engagement_over_time: Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const baseImpressions = 8000 + Math.random() * 4000;
    const baseEngagements = baseImpressions * (0.03 + Math.random() * 0.04);
    const tweets = Math.floor(Math.random() * 5) + 1;

    return {
      date: format(date, 'yyyy-MM-dd'),
      impressions: Math.floor(baseImpressions),
      engagements: Math.floor(baseEngagements),
      tweets,
      engagement_rate: parseFloat(((baseEngagements / baseImpressions) * 100).toFixed(2)),
    };
  }),

  content_breakdown: [
    {
      type: 'Original Tweets',
      count: 45,
      avg_engagement_rate: 4.2,
      total_impressions: 156000,
    },
    {
      type: 'Replies',
      count: 87,
      avg_engagement_rate: 2.8,
      total_impressions: 42000,
    },
    {
      type: 'Media Tweets',
      count: 23,
      avg_engagement_rate: 5.6,
      total_impressions: 78500,
    },
    {
      type: 'Threads',
      count: 12,
      avg_engagement_rate: 6.1,
      total_impressions: 8000,
    },
  ],

  posting_times: [
    // Generate heatmap data for each day of the week and hour
    ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].flatMap(
      (day) =>
        Array.from({ length: 24 }, (_, hour) => {
          // Simulate better engagement during business hours
          const isBusinessHour = hour >= 9 && hour <= 17;
          const isWeekend = day === 'Saturday' || day === 'Sunday';
          let baseRate = 2.5;

          if (isBusinessHour && !isWeekend) {
            baseRate = 4.5 + Math.random() * 2;
          } else if (isBusinessHour && isWeekend) {
            baseRate = 3.0 + Math.random() * 1.5;
          }

          return {
            day,
            hour,
            engagement_rate: parseFloat(baseRate.toFixed(1)),
            tweet_count: Math.floor(Math.random() * 5),
          };
        }),
    ),
  ],

  audience_growth: Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const gained = Math.floor(Math.random() * 25) + 5;
    const lost = Math.floor(Math.random() * 15);
    const currentFollowers = 15092 + i * 11;

    return {
      date: format(date, 'yyyy-MM-dd'),
      followers: currentFollowers,
      followers_gained: gained,
      followers_lost: lost,
      net_growth: gained - lost,
    };
  }),

  top_conversations: [
    {
      conversation_id: 'conv_1',
      root_tweet_id: '1',
      root_tweet_text: 'Just launched our new product! 🚀 Check it out...',
      total_replies: 94,
      max_depth: 4,
      total_engagements: 847,
      engagement_rate: 6.8,
    },
    {
      conversation_id: 'conv_2',
      root_tweet_id: '2',
      root_tweet_text: 'Thread: 5 tips for improving your social media strategy...',
      total_replies: 45,
      max_depth: 3,
      total_engagements: 612,
      engagement_rate: 6.2,
    },
    {
      conversation_id: 'conv_4',
      root_tweet_id: '4',
      root_tweet_text: 'Quick poll: What feature would you like to see next?...',
      total_replies: 178,
      max_depth: 5,
      total_engagements: 523,
      engagement_rate: 6.8,
    },
  ],

  top_hashtags: [
    {
      hashtag: '#ProductLaunch',
      usage_count: 8,
      avg_engagement_rate: 5.8,
      total_impressions: 45200,
    },
    {
      hashtag: '#SocialMedia',
      usage_count: 15,
      avg_engagement_rate: 4.2,
      total_impressions: 38900,
    },
    {
      hashtag: '#TechTips',
      usage_count: 12,
      avg_engagement_rate: 4.7,
      total_impressions: 34500,
    },
    {
      hashtag: '#MondayMotivation',
      usage_count: 4,
      avg_engagement_rate: 3.9,
      total_impressions: 27600,
    },
  ],
};
