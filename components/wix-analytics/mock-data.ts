import type { AnalyticsCategoryData } from '@/lib/xano/types';

// Mock data structure based on the reference app
export const MOCK_ANALYTICS_DATA: Record<string, AnalyticsCategoryData> = {
  // WIX PLATFORM
  'wix-overview': {
    name: 'Wix Marketing Hub',
    category: 'Wix',
    description: 'Welcome to your comprehensive Wix marketing analytics platform. Navigate through the menu to explore analytics, SEO, e-commerce, customer insights, and automation tools.',
    cards: [
      {
        id: 'analytics-tracking-overview',
        title: 'Analytics & Tracking',
        icon: 'TrendingUp',
        summary: 'GA4, Facebook Pixel, GTM',
        content: {
          type: 'text',
          data: '<h3>Analytics & Tracking Overview</h3><p>Access comprehensive tracking and analytics integration for your Wix site.</p><h4>Available Tools:</h4><ul><li>Google Analytics 4 Integration</li><li>Facebook Pixel Management</li><li>Google Tag Manager</li><li>Conversion Tracking Setup</li><li>UTM Campaign Builder</li></ul><p>Navigate to <strong>Analytics & Tracking</strong> in the Wix menu to explore detailed metrics and setup guides.</p>',
        },
      },
      {
        id: 'seo-content-overview',
        title: 'SEO & Content',
        icon: 'FileText',
        summary: 'Rankings, backlinks, content',
        content: {
          type: 'text',
          data: '<h3>SEO & Content Overview</h3><p>Monitor and optimize your search engine performance and content strategy.</p><h4>Available Tools:</h4><ul><li>SEO Performance Dashboard</li><li>Keyword Rankings Tracker</li><li>Backlink Monitor</li><li>Content Performance Analytics</li><li>Site Health & Technical SEO</li></ul>',
        },
      },
      {
        id: 'ecommerce-overview',
        title: 'E-commerce',
        icon: 'ShoppingCart',
        summary: 'Sales, revenue, cart tracking',
        content: {
          type: 'text',
          data: '<h3>E-commerce Overview</h3><p>Track product performance, revenue, and customer purchasing behavior.</p><h4>Available Tools:</h4><ul><li>Product Performance Analytics</li><li>Shopping Cart Analytics</li><li>Customer Lifetime Value</li><li>Revenue Reports</li><li>Abandoned Cart Tracking</li></ul>',
        },
      },
      {
        id: 'customer-insights-overview',
        title: 'Customer Insights',
        icon: 'Users',
        summary: 'Segmentation, demographics',
        content: {
          type: 'text',
          data: '<h3>Customer Insights Overview</h3><p>Deep dive into customer behavior, demographics, and user journey analysis.</p><h4>Available Tools:</h4><ul><li>Customer Segmentation</li><li>Audience Demographics</li><li>User Journey Mapping</li><li>Heatmaps & Session Recordings</li></ul>',
        },
      },
      {
        id: 'automation-tools-overview',
        title: 'Automation & Tools',
        icon: 'Settings',
        summary: 'Workflows, testing, CRM',
        content: {
          type: 'text',
          data: '<h3>Automation & Tools Overview</h3><p>Access marketing automation, testing tools, and integration management.</p><h4>Available Tools:</h4><ul><li>Marketing Automation Setup</li><li>A/B Testing Manager</li><li>Lead Capture Forms</li><li>CRM Integration</li></ul>',
        },
      },
      {
        id: 'quick-stats',
        title: 'Quick Stats',
        icon: 'Activity',
        summary: 'Performance at a glance',
        content: {
          type: 'text',
          data: '<h3>Quick Performance Stats</h3><p><strong>This Month Performance:</strong></p><h4>Traffic & Engagement:</h4><ul><li>Sessions: 12,847 (+25.5%)</li><li>Unique Visitors: 8,432</li><li>Page Views: 34,892 (+18.3%)</li><li>Avg. Time on Site: 3m 42s</li></ul><h4>E-commerce:</h4><ul><li>Revenue: $42,350 (+18.5%)</li><li>Orders: 456</li><li>Conversion Rate: 4.2%</li><li>Avg. Order Value: $135.42</li></ul>',
        },
      },
    ],
  },

  'wix-analytics-tracking': {
    name: 'Analytics & Tracking',
    category: 'Wix',
    description: 'Comprehensive tracking setup and analytics integration for your Wix site.',
    cards: [
      {
        id: 'google-analytics',
        title: 'Google Analytics Integration',
        icon: 'TrendingUp',
        summary: 'GA4 tracking active',
        content: {
          type: 'text',
          data: '<h3>Google Analytics Integration</h3><p><strong>Status:</strong> Connected to GA4</p><p><strong>Property ID:</strong> G-XXXXXXXXXX</p><p><strong>Data Collection:</strong> Active</p><h4>Current Metrics (Last 30 Days):</h4><ul><li>Total Users: 8,432</li><li>Sessions: 12,847</li><li>Average Engagement Time: 3m 42s</li><li>Events Tracked: 45,892</li></ul><h4>Enhanced Tracking Features:</h4><ul><li>E-commerce tracking enabled</li><li>Custom event tracking configured</li><li>Conversion goals: 8 active</li><li>Cross-domain tracking setup</li></ul>',
        },
      },
      {
        id: 'facebook-pixel',
        title: 'Facebook Pixel Management',
        icon: 'Radio',
        summary: 'Pixel ID: 123456789',
        content: {
          type: 'text',
          data: '<h3>Facebook Pixel Management</h3><p><strong>Pixel Status:</strong> Active</p><p><strong>Pixel ID:</strong> 123456789012345</p><p><strong>Events Tracked:</strong> 12,456 this month</p><h4>Standard Events Tracked:</h4><ul><li>PageView: 12,847 events</li><li>ViewContent: 8,234 events</li><li>AddToCart: 1,456 events</li><li>Purchase: 312 events</li><li>Lead: 145 events</li></ul>',
        },
      },
    ],
  },

  // WORDPRESS PLATFORM
  'wordpress-overview': {
    name: 'WordPress Marketing Hub',
    category: 'WordPress',
    description: 'Welcome to your comprehensive WordPress marketing analytics platform.',
    cards: [
      {
        id: 'wp-analytics-tracking-overview',
        title: 'Analytics & Tracking',
        icon: 'TrendingUp',
        summary: 'MonsterInsights, Jetpack Stats',
        content: {
          type: 'text',
          data: '<h3>Analytics & Tracking Overview</h3><p>Access comprehensive tracking and analytics integration for your WordPress site.</p><h4>Available Tools:</h4><ul><li>MonsterInsights Integration</li><li>Jetpack Stats & Analytics</li><li>Google Analytics Dashboard</li><li>WooCommerce Analytics</li><li>Custom Event Tracking</li></ul>',
        },
      },
    ],
  },

  // SHOPIFY PLATFORM
  'shopify-overview': {
    name: 'Shopify Commerce Hub',
    category: 'Shopify',
    description: 'Complete e-commerce analytics and management for your Shopify store.',
    cards: [
      {
        id: 'shopify-analytics-overview',
        title: 'Store Analytics',
        icon: 'ShoppingBag',
        summary: 'Sales, orders, customers',
        content: {
          type: 'text',
          data: '<h3>Shopify Analytics Overview</h3><p>Track store performance, sales analytics, and customer behavior.</p><h4>Key Metrics:</h4><ul><li>Total Sales</li><li>Order Volume</li><li>Customer Analytics</li><li>Product Performance</li></ul>',
        },
      },
    ],
  },

  // GOOGLE SEARCH CONSOLE
  'google-search-console-overview': {
    name: 'Google Search Console Hub',
    category: 'Google',
    description: 'Monitor your site\'s presence in Google Search results.',
    cards: [
      {
        id: 'gsc-performance',
        title: 'Search Performance',
        icon: 'Search',
        summary: 'Clicks, impressions, rankings',
        content: {
          type: 'text',
          data: '<h3>Search Performance</h3><p>Track your site\'s performance in Google Search.</p><h4>Metrics:</h4><ul><li>Total Clicks</li><li>Impressions</li><li>Average Position</li><li>CTR</li></ul>',
        },
      },
    ],
  },
};

// Platform configuration
export const PLATFORMS = [
  {
    id: 'wix',
    label: 'Wix',
    categories: [
      { id: 'overview', label: 'Overview', key: 'wix-overview' },
      { id: 'analytics-tracking', label: 'Analytics & Tracking', key: 'wix-analytics-tracking' },
      { id: 'seo-content', label: 'SEO & Content', key: 'wix-seo-content' },
      { id: 'ecommerce', label: 'E-commerce', key: 'wix-ecommerce' },
      { id: 'customer-insights', label: 'Customer Insights', key: 'wix-customer-insights' },
      { id: 'automation-tools', label: 'Automation & Tools', key: 'wix-automation-tools' },
      { id: 'settings', label: 'Settings', key: 'wix-settings' },
    ],
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    categories: [
      { id: 'overview', label: 'Overview', key: 'wordpress-overview' },
      { id: 'analytics-tracking', label: 'Analytics & Tracking', key: 'wordpress-analytics-tracking' },
      { id: 'seo-content', label: 'SEO & Content', key: 'wordpress-seo-content' },
      { id: 'ecommerce', label: 'E-commerce', key: 'wordpress-ecommerce' },
      { id: 'customer-insights', label: 'Customer Insights', key: 'wordpress-customer-insights' },
      { id: 'automation-tools', label: 'Automation & Tools', key: 'wordpress-automation-tools' },
      { id: 'settings', label: 'Settings', key: 'wordpress-settings' },
    ],
  },
  {
    id: 'shopify',
    label: 'Shopify',
    categories: [
      { id: 'overview', label: 'Overview', key: 'shopify-overview' },
      { id: 'analytics-tracking', label: 'Analytics & Tracking', key: 'shopify-analytics-tracking' },
      { id: 'seo-content', label: 'SEO & Content', key: 'shopify-seo-content' },
      { id: 'ecommerce', label: 'E-commerce', key: 'shopify-ecommerce' },
      { id: 'customer-insights', label: 'Customer Insights', key: 'shopify-customer-insights' },
      { id: 'automation-tools', label: 'Automation & Tools', key: 'shopify-automation-tools' },
      { id: 'settings', label: 'Settings', key: 'shopify-settings' },
    ],
  },
  {
    id: 'google-search-console',
    label: 'Google Search Console',
    categories: [
      { id: 'overview', label: 'Overview', key: 'google-search-console-overview' },
      { id: 'analytics-tracking', label: 'Analytics & Tracking', key: 'gsc-analytics-tracking' },
      { id: 'seo-content', label: 'SEO & Content', key: 'gsc-seo-content' },
    ],
  },
];
