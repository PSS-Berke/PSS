import type { AnalyticsCategoryData } from '@/lib/xano/types';

// Mock data structure based on the reference app
export const MOCK_ANALYTICS_DATA: Record<string, AnalyticsCategoryData> = {
  // GOOGLE SEARCH CONSOLE
  'google-search-console-overview': {
    name: 'Google Search Console Hub',
    category: 'Google',
    description: "Monitor your site's presence in Google Search results.",
    cards: [
      {
        id: 'gsc-performance',
        title: 'Search Performance',
        icon: 'Search',
        summary: 'Clicks, impressions, rankings',
        content: {
          type: 'text',
          data: "<h3>Search Performance</h3><p>Track your site's performance in Google Search.</p><h4>Metrics:</h4><ul><li>Total Clicks</li><li>Impressions</li><li>Average Position</li><li>CTR</li></ul>",
        },
      },
    ],
  },
};

// Platform configuration
export const PLATFORMS = [
  {
    id: 'google-analytics',
    label: 'Google Analytics',
    categories: [
      { id: 'analytics-tracking', label: 'Analytics & Tracking', key: 'google-analytics-tracking' },
    ],
  },
];
