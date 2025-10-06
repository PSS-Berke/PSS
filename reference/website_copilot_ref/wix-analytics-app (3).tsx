import React, { useState } from 'react';
import { X, Code, AlertCircle, Settings, FileText, Lightbulb, Link2, Puzzle, Layout, Tag, Mail, Users, Gift, TrendingUp, FileCode, Clock, MousePointer } from 'lucide-react';

const WebAnalyticsCopilot = () => {
  const [selectedItem, setSelectedItem] = useState('shopify-analytics-tracking');
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({ overview: true });
  const [draggedItem, setDraggedItem] = useState(null);
  const [sidebarOrder, setSidebarOrder] = useState([
    { 
      id: 'overview', 
      label: 'Wix',
      subItems: [
        { id: 'analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'seo-content', label: 'SEO & Content' },
        { id: 'ecommerce', label: 'E-commerce' },
        { id: 'customer-insights', label: 'Customer Insights' },
        { id: 'automation-tools', label: 'Automation & Tools' },
        { id: 'settings', label: 'Settings' }
      ]
    },
    { 
      id: 'wordpress', 
      label: 'WordPress',
      subItems: [
        { id: 'wp-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'wp-seo-content', label: 'SEO & Content' },
        { id: 'wp-ecommerce', label: 'E-commerce' },
        { id: 'wp-customer-insights', label: 'Customer Insights' },
        { id: 'wp-automation-tools', label: 'Automation & Tools' },
        { id: 'wp-settings', label: 'Settings' }
      ]
    },
    { 
      id: 'googleSearchConsole', 
      label: 'Google Search Console',
      subItems: [
        { id: 'gsc-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'gsc-seo-content', label: 'SEO & Content' },
        { id: 'gsc-ecommerce', label: 'E-commerce' },
        { id: 'gsc-customer-insights', label: 'Customer Insights' },
        { id: 'gsc-automation-tools', label: 'Automation & Tools' },
        { id: 'gsc-settings', label: 'Settings' }
      ]
    },
    { 
      id: 'shopify', 
      label: 'Shopify',
      subItems: [
        { id: 'shopify-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'shopify-seo-content', label: 'SEO & Content' },
        { id: 'shopify-ecommerce', label: 'E-commerce' },
        { id: 'shopify-customer-insights', label: 'Customer Insights' },
        { id: 'shopify-automation-tools', label: 'Automation & Tools' },
        { id: 'shopify-settings', label: 'Settings' }
      ]
    }
  ]);

  const apiData = {
    overview: {
      name: 'Wix Marketing Hub',
      category: 'Wix',
      description: 'Welcome to your comprehensive Wix marketing analytics platform. Navigate through the menu to explore analytics, SEO, e-commerce, customer insights, and automation tools.',
      cards: [
        {
          id: 'analytics-tracking-overview',
          title: 'Analytics & Tracking',
          icon: TrendingUp,
          summary: 'GA4, Facebook Pixel, GTM',
          content: {
            type: 'text',
            data: '<h3>Analytics & Tracking Overview</h3><p>Access comprehensive tracking and analytics integration for your Wix site.</p><h4>Available Tools:</h4><ul><li>Google Analytics 4 Integration</li><li>Facebook Pixel Management</li><li>Google Tag Manager</li><li>Conversion Tracking Setup</li><li>UTM Campaign Builder</li></ul><p>Navigate to <strong>Analytics & Tracking</strong> in the Wix menu to explore detailed metrics and setup guides.</p>'
          }
        },
        {
          id: 'seo-content-overview',
          title: 'SEO & Content',
          icon: FileText,
          summary: 'Rankings, backlinks, content',
          content: {
            type: 'text',
            data: '<h3>SEO & Content Overview</h3><p>Monitor and optimize your search engine performance and content strategy.</p><h4>Available Tools:</h4><ul><li>SEO Performance Dashboard</li><li>Keyword Rankings Tracker</li><li>Backlink Monitor</li><li>Content Performance Analytics</li><li>Site Health & Technical SEO</li></ul><p>Navigate to <strong>SEO & Content</strong> in the Wix menu to access detailed SEO insights.</p>'
          }
        },
        {
          id: 'ecommerce-overview',
          title: 'E-commerce',
          icon: Layout,
          summary: 'Sales, revenue, cart tracking',
          content: {
            type: 'text',
            data: '<h3>E-commerce Overview</h3><p>Track product performance, revenue, and customer purchasing behavior.</p><h4>Available Tools:</h4><ul><li>Product Performance Analytics</li><li>Shopping Cart Analytics</li><li>Customer Lifetime Value</li><li>Revenue Reports</li><li>Abandoned Cart Tracking</li></ul><p>Navigate to <strong>E-commerce</strong> in the Wix menu for detailed sales analytics.</p>'
          }
        },
        {
          id: 'customer-insights-overview',
          title: 'Customer Insights',
          icon: Users,
          summary: 'Segmentation, demographics',
          content: {
            type: 'text',
            data: '<h3>Customer Insights Overview</h3><p>Deep dive into customer behavior, demographics, and user journey analysis.</p><h4>Available Tools:</h4><ul><li>Customer Segmentation</li><li>Audience Demographics</li><li>User Journey Mapping</li><li>Heatmaps & Session Recordings</li></ul><p>Navigate to <strong>Customer Insights</strong> in the Wix menu to understand your audience better.</p>'
          }
        },
        {
          id: 'automation-tools-overview',
          title: 'Automation & Tools',
          icon: Settings,
          summary: 'Workflows, testing, CRM',
          content: {
            type: 'text',
            data: '<h3>Automation & Tools Overview</h3><p>Access marketing automation, testing tools, and integration management.</p><h4>Available Tools:</h4><ul><li>Marketing Automation Setup</li><li>A/B Testing Manager</li><li>Lead Capture Forms</li><li>CRM Integration</li></ul><p>Navigate to <strong>Automation & Tools</strong> in the Wix menu to streamline your marketing.</p>'
          }
        },
        {
          id: 'quick-stats',
          title: 'Quick Stats',
          icon: TrendingUp,
          summary: 'Performance at a glance',
          content: {
            type: 'text',
            data: '<h3>Quick Performance Stats</h3><p><strong>This Month Performance:</strong></p><h4>Traffic & Engagement:</h4><ul><li>Sessions: 12,847 (+25.5%)</li><li>Unique Visitors: 8,432</li><li>Page Views: 34,892 (+18.3%)</li><li>Avg. Time on Site: 3m 42s</li></ul><h4>E-commerce:</h4><ul><li>Revenue: $42,350 (+18.5%)</li><li>Orders: 456</li><li>Conversion Rate: 4.2%</li><li>Avg. Order Value: $135.42</li></ul><h4>Marketing:</h4><ul><li>Email Campaigns: 24,567 sent</li><li>Active Automations: 12</li><li>New Leads: 145</li><li>Active Tests: 6</li></ul>'
          }
        }
      ]
    },
    'analytics-tracking': {
      name: 'Analytics & Tracking',
      category: 'Wix',
      description: 'Comprehensive tracking setup and analytics integration for your Wix site.',
      cards: [
        {
          id: 'google-analytics',
          title: 'Google Analytics Integration',
          icon: TrendingUp,
          summary: 'GA4 tracking active',
          content: {
            type: 'text',
            data: '<h3>Google Analytics Integration</h3><p><strong>Status:</strong> Connected to GA4</p><p><strong>Property ID:</strong> G-XXXXXXXXXX</p><p><strong>Data Collection:</strong> Active</p><h4>Current Metrics (Last 30 Days):</h4><ul><li>Total Users: 8,432</li><li>Sessions: 12,847</li><li>Average Engagement Time: 3m 42s</li><li>Events Tracked: 45,892</li></ul><h4>Enhanced Tracking Features:</h4><ul><li>E-commerce tracking enabled</li><li>Custom event tracking configured</li><li>Conversion goals: 8 active</li><li>Cross-domain tracking setup</li></ul><h4>Setup Instructions:</h4><ol><li>Verify GA4 property connection</li><li>Configure custom dimensions</li><li>Set up conversion events</li><li>Enable enhanced measurement</li></ol>'
          }
        },
        {
          id: 'facebook-pixel',
          title: 'Facebook Pixel Management',
          icon: MousePointer,
          summary: 'Pixel ID: 123456789',
          content: {
            type: 'text',
            data: '<h3>Facebook Pixel Management</h3><p><strong>Pixel Status:</strong> Active</p><p><strong>Pixel ID:</strong> 123456789012345</p><p><strong>Events Tracked:</strong> 12,456 this month</p><h4>Standard Events Tracked:</h4><ul><li>PageView: 12,847 events</li><li>ViewContent: 8,234 events</li><li>AddToCart: 1,456 events</li><li>Purchase: 312 events</li><li>Lead: 145 events</li></ul><h4>Custom Conversions:</h4><ul><li>Newsletter Signup: 145 conversions</li><li>Demo Request: 28 conversions</li><li>Download Whitepaper: 67 conversions</li></ul><h4>Optimization Tips:</h4><ul><li>Use Facebook Conversion API for better tracking</li><li>Test pixel events with Facebook Pixel Helper</li><li>Create custom audiences from pixel data</li><li>Set up dynamic product ads</li></ul>'
          }
        },
        {
          id: 'google-tag-manager',
          title: 'Google Tag Manager',
          icon: Code,
          summary: '24 tags configured',
          content: {
            type: 'text',
            data: '<h3>Google Tag Manager</h3><p><strong>Container ID:</strong> GTM-XXXXXXX</p><p><strong>Status:</strong> Published</p><p><strong>Last Updated:</strong> 2 days ago</p><h4>Active Tags (24):</h4><ul><li>Google Analytics 4: 1 tag</li><li>Facebook Pixel: 1 tag</li><li>Conversion Tracking: 8 tags</li><li>Remarketing Tags: 4 tags</li><li>Custom HTML: 10 tags</li></ul><h4>Triggers Configured:</h4><ul><li>Page View triggers: 12</li><li>Click triggers: 18</li><li>Form submission triggers: 6</li><li>Scroll depth triggers: 4</li></ul><h4>Best Practices:</h4><ul><li>Use dataLayer for custom events</li><li>Test tags in preview mode before publishing</li><li>Organize tags with naming conventions</li><li>Monitor tag performance regularly</li></ul>'
          }
        },
        {
          id: 'conversion-tracking',
          title: 'Conversion Tracking Setup',
          icon: TrendingUp,
          summary: '8 goals configured',
          content: {
            type: 'text',
            data: '<h3>Conversion Tracking Setup</h3><p><strong>Total Conversions:</strong> 540 this month</p><p><strong>Conversion Rate:</strong> 4.2%</p><p><strong>Revenue Tracked:</strong> $42,350</p><h4>Active Conversion Goals:</h4><ol><li>Purchase Completion - 312 conversions ($38,450)</li><li>Newsletter Signup - 145 conversions</li><li>Contact Form - 58 conversions</li><li>Account Registration - 25 conversions</li><li>Product Page View - 1,892 conversions</li><li>Add to Cart - 456 conversions</li><li>Checkout Started - 387 conversions</li><li>Demo Request - 28 conversions ($3,900)</li></ol><h4>Conversion Funnel Analysis:</h4><ul><li>Product View → Add to Cart: 24.1%</li><li>Add to Cart → Checkout: 84.9%</li><li>Checkout → Purchase: 80.6%</li></ul>'
          }
        },
        {
          id: 'utm-builder',
          title: 'UTM Campaign Builder',
          icon: Link2,
          summary: 'Track campaign performance',
          content: {
            type: 'text',
            data: '<h3>UTM Campaign Builder</h3><p>Build custom UTM parameters to track the effectiveness of your marketing campaigns across different channels.</p><h4>UTM Parameters:</h4><ul><li><strong>utm_source:</strong> Identifies traffic source (e.g., google, facebook, newsletter)</li><li><strong>utm_medium:</strong> Marketing medium (e.g., cpc, email, social)</li><li><strong>utm_campaign:</strong> Campaign name (e.g., summer_sale_2024)</li><li><strong>utm_term:</strong> Paid keywords (optional)</li><li><strong>utm_content:</strong> Differentiate ads (optional)</li></ul><h4>Recent Campaigns:</h4><ul><li>summer_sale_2024: 2,341 sessions, 4.8% conversion</li><li>newsletter_may: 1,334 sessions, 6.7% conversion</li><li>facebook_retargeting: 892 sessions, 3.2% conversion</li></ul><h4>Best Practices:</h4><ul><li>Use consistent naming conventions</li><li>Keep parameters lowercase</li><li>Use underscores instead of spaces</li><li>Document all campaign URLs</li></ul>'
          }
        }
      ]
    },
    'seo-content': {
      name: 'SEO & Content',
      category: 'Wix',
      description: 'Monitor SEO performance, track rankings, and optimize your content strategy.',
      cards: [
        {
          id: 'seo-dashboard',
          title: 'SEO Performance Dashboard',
          icon: TrendingUp,
          summary: 'Overall score: 78/100',
          content: {
            type: 'text',
            data: '<h3>SEO Performance Dashboard</h3><p><strong>Overall SEO Score:</strong> 78/100 (Good)</p><p><strong>Organic Traffic:</strong> 5,234 sessions (+15% vs last month)</p><p><strong>Indexed Pages:</strong> 142 of 156 pages</p><h4>Core Web Vitals:</h4><ul><li>Largest Contentful Paint: 2.1s (Good)</li><li>First Input Delay: 45ms (Good)</li><li>Cumulative Layout Shift: 0.08 (Good)</li><li>Mobile Page Speed: 87/100</li><li>Desktop Page Speed: 94/100</li></ul><h4>SEO Health Indicators:</h4><ul><li>✓ Mobile-friendly pages: 100%</li><li>✓ HTTPS security enabled</li><li>✓ XML sitemap submitted</li><li>⚠ 8 pages missing meta descriptions</li><li>⚠ 3 duplicate title tags found</li></ul>'
          }
        },
        {
          id: 'keyword-rankings',
          title: 'Keyword Rankings',
          icon: TrendingUp,
          summary: '124 keywords tracked',
          content: {
            type: 'table',
            data: {
              headers: ['Keyword', 'Position', 'Change', 'Search Volume', 'Traffic'],
              rows: [
                ['web design services', '3', '↑ 2', '8,100/mo', '892'],
                ['affordable website builder', '7', '↑ 1', '5,400/mo', '445'],
                ['ecommerce solutions', '12', '↓ 3', '12,100/mo', '234'],
                ['responsive web design', '5', '—', '6,600/mo', '678'],
                ['seo optimization tips', '9', '↑ 4', '4,400/mo', '312']
              ]
            }
          }
        },
        {
          id: 'backlink-monitor',
          title: 'Backlink Monitor',
          icon: Link2,
          summary: '342 backlinks from 89 domains',
          content: {
            type: 'text',
            data: '<h3>Backlink Monitor</h3><p><strong>Total Backlinks:</strong> 342 links</p><p><strong>Referring Domains:</strong> 89 domains</p><p><strong>Domain Authority:</strong> 45/100</p><p><strong>New Backlinks (30 days):</strong> 23 links</p><h4>Top Referring Domains:</h4><ol><li>techcrunch.com - DA 93 - 5 backlinks</li><li>medium.com - DA 95 - 12 backlinks</li><li>forbes.com - DA 94 - 2 backlinks</li><li>entrepreneur.com - DA 93 - 3 backlinks</li><li>hubspot.com - DA 92 - 8 backlinks</li></ol><h4>Link Quality Distribution:</h4><ul><li>High Authority (DA 60+): 45 links (13%)</li><li>Medium Authority (DA 30-59): 178 links (52%)</li><li>Low Authority (DA 0-29): 119 links (35%)</li></ul><h4>Anchor Text Analysis:</h4><ul><li>Branded anchors: 142 (41%)</li><li>Exact match: 78 (23%)</li><li>Partial match: 89 (26%)</li><li>Generic: 33 (10%)</li></ul>'
          }
        },
        {
          id: 'content-performance',
          title: 'Content Performance',
          icon: FileText,
          summary: '28% of traffic from blog',
          content: {
            type: 'text',
            data: '<h3>Content Performance</h3><p><strong>Total Content Pieces:</strong> 67 published</p><p><strong>Blog Traffic:</strong> 9,789 sessions (28% of total)</p><p><strong>Average Time on Page:</strong> 4m 47s</p><h4>Top Performing Content:</h4><ol><li>"10 SEO Tips for 2024" - 3,441 views, 5m 32s avg time</li><li>"Complete Guide to E-commerce" - 2,156 views, 7m 18s avg time</li><li>"Social Media Marketing 101" - 1,892 views, 4m 03s avg time</li><li>"Email Marketing Best Practices" - 1,445 views, 6m 12s avg time</li><li>"Website Speed Optimization" - 1,234 views, 5m 45s avg time</li></ol><h4>Content Metrics:</h4><ul><li>Average page views per article: 146</li><li>Social shares: 1,234 total</li><li>Comments: 234 total</li><li>Bounce rate: 38.5% (better than average)</li></ul><h4>Content Gaps Identified:</h4><ul><li>AI marketing tools (high search volume, low coverage)</li><li>Mobile app development (opportunity keyword)</li><li>Video marketing strategies (trending topic)</li></ul>'
          }
        },
        {
          id: 'site-health',
          title: 'Site Health & Technical SEO',
          icon: Settings,
          summary: '3 issues require attention',
          content: {
            type: 'text',
            data: '<h3>Site Health & Technical SEO</h3><p><strong>Overall Health:</strong> Good (78/100)</p><p><strong>Last Crawl:</strong> 2 hours ago</p><p><strong>Crawl Errors:</strong> 3 issues found</p><h4>Critical Issues (0):</h4><p>✓ No critical issues detected</p><h4>Warnings (3):</h4><ul><li>8 pages missing meta descriptions</li><li>3 duplicate title tags detected</li><li>2 broken internal links found</li></ul><h4>Technical SEO Checklist:</h4><ul><li>✓ XML sitemap submitted to Google</li><li>✓ Robots.txt configured correctly</li><li>✓ SSL certificate active (HTTPS)</li><li>✓ Mobile-friendly test passed</li><li>✓ Structured data implemented (Schema.org)</li><li>✓ Canonical tags properly set</li><li>⚠ Image alt text missing on 12 images</li><li>✓ No broken external links</li></ul><h4>Page Speed Insights:</h4><ul><li>Desktop: 94/100 (Excellent)</li><li>Mobile: 87/100 (Good)</li><li>Time to Interactive: 2.8s</li><li>Total Blocking Time: 180ms</li></ul>'
          }
        }
      ]
    },
    'ecommerce': {
      name: 'E-commerce',
      category: 'Wix',
      description: 'Track product performance, revenue, and customer purchasing behavior.',
      cards: [
        {
          id: 'product-performance',
          title: 'Product Performance',
          icon: TrendingUp,
          summary: '$42,350 revenue this month',
          content: {
            type: 'text',
            data: '<h3>Product Performance</h3><p><strong>Total Revenue:</strong> $42,350 (+18.5% vs last month)</p><p><strong>Units Sold:</strong> 456 products</p><p><strong>Average Order Value:</strong> $135.42</p><p><strong>Top Performing Products:</strong></p><h4>Best Sellers:</h4><ol><li>Premium Widget Pro - 89 units, $8,012 revenue</li><li>Starter Bundle - 124 units, $7,440 revenue</li><li>Professional Package - 45 units, $6,750 revenue</li><li>Essential Kit - 78 units, $5,460 revenue</li><li>Advanced Suite - 32 units, $6,400 revenue</li></ol><h4>Product Metrics:</h4><ul><li>Product views: 8,234</li><li>Add to cart rate: 17.7%</li><li>Cart abandonment rate: 19.4%</li><li>Products per order: 1.46 average</li></ul><h4>Category Performance:</h4><ul><li>Software & Tools: $18,450 (43.6%)</li><li>Digital Products: $12,340 (29.1%)</li><li>Services: $8,560 (20.2%)</li><li>Subscriptions: $3,000 (7.1%)</li></ul>'
          }
        },
        {
          id: 'shopping-cart',
          title: 'Shopping Cart Analytics',
          icon: Layout,
          summary: '19.4% abandonment rate',
          content: {
            type: 'text',
            data: '<h3>Shopping Cart Analytics</h3><p><strong>Cart Abandonment Rate:</strong> 19.4%</p><p><strong>Recovered Carts:</strong> 23 (valued at $3,105)</p><p><strong>Average Cart Value:</strong> $147.82</p><h4>Cart Funnel Analysis:</h4><ul><li>Products Added to Cart: 1,456</li><li>Checkout Initiated: 1,237 (84.9%)</li><li>Payment Info Entered: 1,089 (88.0%)</li><li>Purchase Completed: 997 (91.6%)</li></ul><h4>Abandonment Reasons:</h4><ul><li>High shipping costs: 38%</li><li>Required account creation: 24%</li><li>Long checkout process: 18%</li><li>Payment security concerns: 12%</li><li>Other: 8%</li></ul><h4>Cart Recovery Strategies:</h4><ul><li>Abandoned cart email campaigns</li><li>Exit-intent discount offers</li><li>Free shipping threshold promotions</li><li>Guest checkout option enabled</li></ul><h4>Checkout Optimization:</h4><ul><li>One-page checkout implemented</li><li>Multiple payment methods available</li><li>Trust badges displayed</li><li>Progress indicator shown</li></ul>'
          }
        },
        {
          id: 'customer-lifetime-value',
          title: 'Customer Lifetime Value',
          icon: Users,
          summary: 'Avg CLV: $342.50',
          content: {
            type: 'text',
            data: '<h3>Customer Lifetime Value</h3><p><strong>Average CLV:</strong> $342.50</p><p><strong>Customer Retention Rate:</strong> 68.5%</p><p><strong>Repeat Purchase Rate:</strong> 32.7%</p><h4>CLV by Segment:</h4><ul><li>VIP Customers (10%): $892.40 average CLV</li><li>Regular Customers (35%): $456.20 average CLV</li><li>Occasional Buyers (40%): $234.80 average CLV</li><li>One-time Buyers (15%): $89.50 average CLV</li></ul><h4>Purchase Frequency:</h4><ul><li>Average orders per customer: 2.53</li><li>Average time between purchases: 42 days</li><li>Customers with 2+ orders: 32.7%</li><li>Customers with 5+ orders: 8.2%</li></ul><h4>Revenue Breakdown:</h4><ul><li>New customers: $18,450 (43.6%)</li><li>Returning customers: $23,900 (56.4%)</li><li>Top 10% customers generate: 45% of revenue</li></ul><h4>Improvement Strategies:</h4><ul><li>Implement loyalty rewards program</li><li>Personalized product recommendations</li><li>Post-purchase email sequences</li><li>Exclusive member-only promotions</li></ul>'
          }
        },
        {
          id: 'revenue-reports',
          title: 'Revenue Reports',
          icon: TrendingUp,
          summary: '+18.5% growth MoM',
          content: {
            type: 'text',
            data: '<h3>Revenue Reports</h3><p><strong>Total Revenue (30 days):</strong> $42,350</p><p><strong>Growth:</strong> +18.5% vs previous month</p><p><strong>Daily Average:</strong> $1,411.67</p><h4>Revenue Trends:</h4><ul><li>Week 1: $9,234 (21.8%)</li><li>Week 2: $11,456 (27.0%)</li><li>Week 3: $10,892 (25.7%)</li><li>Week 4: $10,768 (25.4%)</li></ul><h4>Revenue by Traffic Source:</h4><ul><li>Organic Search: $16,234 (38.3%)</li><li>Direct Traffic: $13,456 (31.8%)</li><li>Paid Advertising: $7,892 (18.6%)</li><li>Email Marketing: $3,456 (8.2%)</li><li>Social Media: $1,312 (3.1%)</li></ul><h4>Revenue by Device:</h4><ul><li>Desktop: $24,561 (58.0%)</li><li>Mobile: $15,234 (36.0%)</li><li>Tablet: $2,555 (6.0%)</li></ul><h4>Key Performance Indicators:</h4><ul><li>Conversion rate: 4.2%</li><li>Average order value: $135.42</li><li>Customer acquisition cost: $28.50</li><li>Return on ad spend: 4.2x</li></ul>'
          }
        },
        {
          id: 'abandoned-cart',
          title: 'Abandoned Cart Tracking',
          icon: AlertCircle,
          summary: '$8,450 in abandoned carts',
          content: {
            type: 'text',
            data: '<h3>Abandoned Cart Tracking</h3><p><strong>Total Abandoned Cart Value:</strong> $8,450</p><p><strong>Number of Abandoned Carts:</strong> 62</p><p><strong>Average Abandoned Cart Value:</strong> $136.29</p><p><strong>Recovery Rate:</strong> 37.1% (23 carts recovered)</p><h4>Abandonment Timeline:</h4><ul><li>Within 1 hour: 18 carts ($2,450)</li><li>1-24 hours: 24 carts ($3,270)</li><li>24-72 hours: 12 carts ($1,635)</li><li>72+ hours: 8 carts ($1,095)</li></ul><h4>Recovery Campaign Performance:</h4><ul><li>Email 1 (1 hour): 28% open rate, 12% recovery</li><li>Email 2 (24 hours): 32% open rate, 15% recovery</li><li>Email 3 (72 hours): 24% open rate, 10% recovery</li></ul><h4>Products Most Often Abandoned:</h4><ol><li>Premium Widget Pro - 15 occurrences</li><li>Professional Package - 12 occurrences</li><li>Starter Bundle - 9 occurrences</li><li>Advanced Suite - 8 occurrences</li></ol><h4>Recovery Tactics:</h4><ul><li>Discount codes in recovery emails</li><li>Free shipping incentives</li><li>Product scarcity messaging</li><li>Customer testimonials included</li></ul>'
          }
        }
      ]
    },
    'customer-insights': {
      name: 'Customer Insights',
      category: 'Wix',
      description: 'Deep dive into customer behavior, demographics, and user journey analysis.',
      cards: [
        {
          id: 'customer-segmentation',
          title: 'Customer Segmentation',
          icon: Users,
          summary: '5 customer segments',
          content: {
            type: 'text',
            data: '<h3>Customer Segmentation</h3><p><strong>Total Customers:</strong> 1,245</p><p><strong>Active Segments:</strong> 5 segments</p><h4>Segment Breakdown:</h4><ul><li><strong>VIP Customers (10%):</strong> 125 customers<br>- Avg CLV: $892.40<br>- 5+ purchases<br>- High engagement rate</li><li><strong>Regular Customers (35%):</strong> 436 customers<br>- Avg CLV: $456.20<br>- 2-4 purchases<br>- Medium engagement</li><li><strong>Occasional Buyers (40%):</strong> 498 customers<br>- Avg CLV: $234.80<br>- 1-2 purchases<br>- Low-medium engagement</li><li><strong>At-Risk Customers (10%):</strong> 125 customers<br>- Last purchase 90+ days ago<br>- Need re-engagement</li><li><strong>New Customers (5%):</strong> 61 customers<br>- First purchase in last 30 days<br>- High potential</li></ul><h4>Segmentation Criteria:</h4><ul><li>Purchase frequency and recency</li><li>Total spending amount</li><li>Product preferences</li><li>Engagement level</li><li>Geographic location</li></ul>'
          }
        },
        {
          id: 'audience-demographics',
          title: 'Audience Demographics',
          icon: Users,
          summary: 'Multi-demographic analysis',
          content: {
            type: 'text',
            data: '<h3>Audience Demographics</h3><p><strong>Total Unique Visitors:</strong> 8,432</p><h4>Age Distribution:</h4><ul><li>18-24: 12% (1,012 visitors)</li><li>25-34: 38% (3,204 visitors)</li><li>35-44: 28% (2,361 visitors)</li><li>45-54: 15% (1,265 visitors)</li><li>55+: 7% (590 visitors)</li></ul><h4>Gender Breakdown:</h4><ul><li>Male: 52% (4,385 visitors)</li><li>Female: 46% (3,879 visitors)</li><li>Other/Unknown: 2% (168 visitors)</li></ul><h4>Geographic Distribution:</h4><ul><li>United States: 42% (3,541 visitors)</li><li>United Kingdom: 18% (1,518 visitors)</li><li>Canada: 12% (1,012 visitors)</li><li>Australia: 8% (675 visitors)</li><li>Germany: 5% (422 visitors)</li><li>Other: 15% (1,264 visitors)</li></ul><h4>Device Preferences by Age:</h4><ul><li>18-34: 78% mobile, 18% desktop, 4% tablet</li><li>35-54: 54% mobile, 38% desktop, 8% tablet</li><li>55+: 35% mobile, 58% desktop, 7% tablet</li></ul>'
          }
        },
        {
          id: 'user-journey',
          title: 'User Journey Mapping',
          icon: Link2,
          summary: 'Avg 4.3 touchpoints',
          content: {
            type: 'text',
            data: '<h3>User Journey Mapping</h3><p><strong>Average Touchpoints to Conversion:</strong> 4.3</p><p><strong>Average Journey Duration:</strong> 8.5 days</p><h4>Common Journey Paths:</h4><ol><li><strong>Path A (35%):</strong> Social Media → Homepage → Product Page → Purchase<br>- Average duration: 2.3 days<br>- Conversion rate: 6.2%</li><li><strong>Path B (28%):</strong> Organic Search → Blog Post → Product Page → Cart → Purchase<br>- Average duration: 5.8 days<br>- Conversion rate: 4.8%</li><li><strong>Path C (22%):</strong> Email → Landing Page → Pricing → Purchase<br>- Average duration: 1.5 days<br>- Conversion rate: 8.7%</li><li><strong>Path D (15%):</strong> Direct → Multiple Product Pages → Comparison → Purchase<br>- Average duration: 12.4 days<br>- Conversion rate: 5.1%</li></ol><h4>Touchpoint Analysis:</h4><ul><li>First touch: Social media (32%), Organic search (38%), Direct (20%)</li><li>Mid-funnel: Blog content (45%), Product pages (38%), Reviews (17%)</li><li>Last touch before conversion: Email (28%), Product page (45%), Pricing page (27%)</li></ul>'
          }
        },
        {
          id: 'heatmaps',
          title: 'Heatmaps & Session Recordings',
          icon: MousePointer,
          summary: '2,450 sessions recorded',
          content: {
            type: 'text',
            data: '<h3>Heatmaps & Session Recordings</h3><p><strong>Sessions Recorded:</strong> 2,450 (last 30 days)</p><p><strong>Pages Analyzed:</strong> 28 pages</p><h4>Click Heatmap Insights:</h4><ul><li><strong>Homepage:</strong><br>- 45% click "Get Started" CTA<br>- 28% navigate to pricing<br>- 18% explore product features<br>- 9% click social proof/testimonials</li><li><strong>Product Pages:</strong><br>- 62% interact with product images<br>- 24% click "Add to Cart"<br>- 14% read customer reviews</li><li><strong>Checkout Page:</strong><br>- 87% complete payment fields<br>- 13% abandon at shipping info</li></ul><h4>Scroll Depth Analysis:</h4><ul><li>Homepage: 65% scroll below fold, 38% reach footer</li><li>Product pages: 78% scroll below fold, 52% reach reviews</li><li>Blog posts: 82% scroll below fold, 45% reach end of article</li></ul><h4>Session Recording Findings:</h4><ul><li>Average session duration: 3m 42s</li><li>Rage clicks detected: 45 instances (checkout page)</li><li>Form abandonment: 12% on contact form</li><li>Mobile navigation issues: 23 instances</li></ul>'
          }
        }
      ]
    },
    'automation-tools': {
      name: 'Automation & Tools',
      category: 'Wix',
      description: 'Marketing automation, testing tools, and integration management.',
      cards: [
        {
          id: 'marketing-automation',
          title: 'Marketing Automation Setup',
          icon: Settings,
          summary: '12 workflows active',
          content: {
            type: 'text',
            data: '<h3>Marketing Automation Setup</h3><p><strong>Active Workflows:</strong> 12 automations</p><p><strong>Total Contacts:</strong> 8,432 in system</p><p><strong>Emails Sent (30 days):</strong> 24,567</p><h4>Active Automation Workflows:</h4><ol><li><strong>Welcome Series</strong> (3 emails)<br>- Triggered by: New signup<br>- Active contacts: 1,245<br>- Open rate: 42.5%<br>- Conversion: 8.2%</li><li><strong>Abandoned Cart Recovery</strong> (3 emails)<br>- Triggered by: Cart abandonment<br>- Active carts: 62<br>- Recovery rate: 37.1%<br>- Revenue recovered: $3,105</li><li><strong>Post-Purchase Follow-up</strong> (4 emails)<br>- Triggered by: Purchase completion<br>- Active customers: 456<br>- Review request rate: 28.5%</li><li><strong>Re-engagement Campaign</strong> (2 emails)<br>- Triggered by: 90 days inactive<br>- Target contacts: 892<br>- Win-back rate: 15.3%</li></ol><h4>Segmentation Rules:</h4><ul><li>Behavioral triggers: 8 active</li><li>Purchase-based segments: 5 active</li><li>Engagement scoring: Enabled</li></ul>'
          }
        },
        {
          id: 'ab-testing',
          title: 'A/B Testing Manager',
          icon: Puzzle,
          summary: '6 tests running',
          content: {
            type: 'text',
            data: '<h3>A/B Testing Manager</h3><p><strong>Active Tests:</strong> 6 experiments</p><p><strong>Completed Tests:</strong> 18 this quarter</p><p><strong>Average Lift:</strong> +12.4% conversion improvement</p><h4>Currently Running Tests:</h4><ol><li><strong>Homepage CTA Test</strong><br>- Variant A: "Get Started Free"<br>- Variant B: "Start Your Free Trial"<br>- Traffic split: 50/50<br>- Current winner: Variant B (+8.5% conversions)<br>- Statistical significance: 92%</li><li><strong>Product Page Layout</strong><br>- Testing: Image gallery vs video<br>- Current leader: Video version (+15.2% engagement)<br>- Statistical significance: 87%</li><li><strong>Checkout Button Color</strong><br>- Testing: Green vs Red vs Blue<br>- Current leader: Red (+11.3% clicks)<br>- Statistical significance: 95%</li></ol><h4>Recent Winning Tests:</h4><ul><li>Email subject lines: +23% open rate improvement</li><li>Landing page headline: +18% conversion lift</li><li>Product description length: +9% add-to-cart rate</li></ul>'
          }
        },
        {
          id: 'lead-capture',
          title: 'Lead Capture Forms',
          icon: FileText,
          summary: '145 leads captured',
          content: {
            type: 'text',
            data: '<h3>Lead Capture Forms</h3><p><strong>Total Leads (30 days):</strong> 145 new leads</p><p><strong>Form Conversion Rate:</strong> 5.8%</p><p><strong>Average Time to Complete:</strong> 32 seconds</p><h4>Active Forms:</h4><ul><li><strong>Newsletter Signup</strong><br>- Submissions: 89<br>- Conversion rate: 8.2%<br>- Location: Homepage, Blog footer<br>- Fields: Email only</li><li><strong>Demo Request Form</strong><br>- Submissions: 28<br>- Conversion rate: 12.4%<br>- Location: Pricing page<br>- Fields: Name, Email, Company, Phone</li><li><strong>Contact Form</strong><br>- Submissions: 18<br>- Conversion rate: 4.1%<br>- Location: Contact page<br>- Fields: Name, Email, Subject, Message</li><li><strong>Resource Download</strong><br>- Submissions: 10<br>- Conversion rate: 15.7%<br>- Location: Blog posts<br>- Fields: Name, Email, Company</li></ul><h4>Form Optimization:</h4><ul><li>Progressive profiling enabled</li><li>Auto-fill functionality active</li><li>Mobile-optimized layouts</li><li>GDPR consent checkboxes</li></ul>'
          }
        },
        {
          id: 'crm-integration',
          title: 'CRM Integration',
          icon: Link2,
          summary: 'Connected to HubSpot',
          content: {
            type: 'text',
            data: '<h3>CRM Integration</h3><p><strong>Connected CRM:</strong> HubSpot</p><p><strong>Sync Status:</strong> Active (Real-time)</p><p><strong>Total Contacts Synced:</strong> 8,432</p><p><strong>Last Sync:</strong> 5 minutes ago</p><h4>Integration Features:</h4><ul><li>✓ Bi-directional contact sync</li><li>✓ Deal/opportunity tracking</li><li>✓ Email activity logging</li><li>✓ Website behavior tracking</li><li>✓ Form submission sync</li><li>✓ Custom field mapping</li><li>✓ Lead scoring sync</li></ul><h4>Synced Data:</h4><ul><li>Contacts: 8,432 records</li><li>Companies: 1,234 records</li><li>Deals: 89 active opportunities</li><li>Activities: 24,567 logged events</li></ul><h4>Pipeline Overview:</h4><ul><li>New leads: 145 (this month)</li><li>Qualified leads: 67</li><li>Opportunities: 28</li><li>Closed won: 18 ($42,350)</li><li>Win rate: 64.3%</li></ul><h4>Available Integrations:</h4><ul><li>✓ HubSpot (Connected)</li><li>Salesforce</li><li>Pipedrive</li><li>Zoho CRM</li><li>ActiveCampaign</li></ul>'
          }
        }
      ]
    },
    settings: {
      name: 'Settings',
      category: 'Wix',
      description: 'Configure your Wix connection, manage integrations, and control system preferences.',
      cards: [
        {
          id: 'wix-connection',
          title: 'Wix Site Connection',
          icon: Link2,
          summary: 'Connected to 2 sites',
          content: {
            type: 'text',
            data: '<h3>Wix Site Connection</h3><p><strong>Connection Status:</strong> ✓ Connected</p><p><strong>Active Sites:</strong> 2 sites</p><p><strong>Last Sync:</strong> 3 minutes ago</p><h4>Connected Sites:</h4><ul><li><strong>mybusiness.com</strong><br>- Site ID: wix-abc123<br>- Status: Active<br>- Analytics: Enabled<br>- Last updated: Just now</li><li><strong>myblog.wixsite.com</strong><br>- Site ID: wix-xyz789<br>- Status: Active<br>- Analytics: Enabled<br>- Last updated: 2 hours ago</li></ul><h4>Connection Features:</h4><ul><li>✓ Real-time analytics sync</li><li>✓ E-commerce data tracking</li><li>✓ Form submission monitoring</li><li>✓ Automatic daily backups</li><li>✓ Cross-site reporting</li></ul><h4>How to Connect New Site:</h4><ol><li>Click "Add New Site" button</li><li>Log in to your Wix account</li><li>Select the site you want to connect</li><li>Authorize analytics access</li><li>Configure tracking preferences</li></ol><h4>Sync Settings:</h4><ul><li>Data sync interval: Real-time</li><li>Historical data import: 90 days</li><li>Auto-sync enabled: Yes</li></ul>'
          }
        },
        {
          id: 'notification-preferences',
          title: 'Notification Preferences',
          icon: AlertCircle,
          summary: 'Email & in-app alerts',
          content: {
            type: 'text',
            data: '<h3>Notification Preferences</h3><p><strong>Email:</strong> user@example.com</p><p><strong>Notification Method:</strong> Email + In-App</p><h4>Email Notifications:</h4><ul><li>✓ Daily performance summary (8:00 AM)</li><li>✓ Weekly analytics report (Monday)</li><li>✓ Monthly business review (1st of month)</li><li>✓ Real-time traffic spike alerts</li><li>✓ Conversion goal achievements</li><li>✓ A/B test completion notifications</li><li>✗ Product updates & announcements</li></ul><h4>Alert Thresholds:</h4><ul><li>Traffic spike: +50% vs 7-day average</li><li>Traffic drop: -30% vs 7-day average</li><li>Bounce rate alert: >65%</li><li>Conversion rate alert: <2%</li><li>Page load time alert: >5 seconds</li><li>Shopping cart abandonment: >25%</li></ul><h4>In-App Notifications:</h4><ul><li>✓ Show desktop notifications</li><li>✓ Play notification sounds</li><li>✓ Badge counts on sidebar</li><li>Notification retention: 30 days</li></ul><h4>Quiet Hours:</h4><ul><li>Enabled: 10:00 PM - 7:00 AM</li><li>Timezone: Eastern Time (ET)</li><li>Critical alerts only during quiet hours</li></ul>'
          }
        },
        {
          id: 'data-privacy',
          title: 'Data & Privacy Settings',
          icon: Settings,
          summary: 'GDPR compliant',
          content: {
            type: 'text',
            data: '<h3>Data & Privacy Settings</h3><p><strong>Compliance Status:</strong> ✓ GDPR & CCPA Compliant</p><h4>Data Collection:</h4><ul><li>✓ Page view tracking enabled</li><li>✓ User behavior tracking enabled</li><li>✓ E-commerce tracking enabled</li><li>✓ Form submission tracking enabled</li><li>✓ Click tracking enabled</li><li>✓ Session recording enabled</li><li>✗ Audio recording disabled</li></ul><h4>Privacy Controls:</h4><ul><li>✓ IP address anonymization enabled</li><li>✓ Cookie consent banner active</li><li>✓ Do Not Track (DNT) headers respected</li><li>✓ Data minimization enabled</li><li>Visitor data retention: 26 months</li><li>Analytics data retention: 50 months</li></ul><h4>User Rights Management:</h4><ul><li>Data access requests: Automated</li><li>Data deletion requests: Automated</li><li>Data portability: CSV/JSON export available</li><li>Opt-out mechanism: Active</li></ul><h4>Cookie Settings:</h4><ul><li>Essential cookies: Always active</li><li>Analytics cookies: Active (with consent)</li><li>Marketing cookies: Active (with consent)</li><li>Preference cookies: Active</li></ul><h4>Data Processing:</h4><ul><li>Data location: US East (Virginia)</li><li>Backup location: US West (Oregon)</li><li>Encryption: AES-256 at rest, TLS 1.3 in transit</li></ul>'
          }
        },
        {
          id: 'api-management',
          title: 'API Access & Keys',
          icon: Code,
          summary: '3 active API keys',
          content: {
            type: 'text',
            data: '<h3>API Access & Keys</h3><p><strong>Active API Keys:</strong> 3 keys</p><p><strong>API Version:</strong> v2.0</p><p><strong>Rate Limit:</strong> 10,000 requests/hour</p><h4>Your API Keys:</h4><ul><li><strong>Production Key</strong><br>- Key: wix_prod_••••••••1234<br>- Created: Jan 15, 2024<br>- Last used: 2 hours ago<br>- Requests today: 2,847<br>- Status: Active</li><li><strong>Development Key</strong><br>- Key: wix_dev_••••••••5678<br>- Created: Jan 20, 2024<br>- Last used: 1 day ago<br>- Requests today: 156<br>- Status: Active</li><li><strong>Integration Key</strong><br>- Key: wix_int_••••••••9012<br>- Created: Feb 1, 2024<br>- Last used: 5 minutes ago<br>- Requests today: 1,234<br>- Status: Active</li></ul><h4>API Documentation:</h4><ul><li>REST API endpoints: <a href="#">View Docs</a></li><li>Authentication: API Key + OAuth 2.0</li><li>Response format: JSON</li><li>Webhooks: Supported</li><li>Rate limits: 10,000/hour per key</li><li>Burst limit: 100 requests/second</li></ul><h4>Security Features:</h4><ul><li>✓ IP whitelisting supported</li><li>✓ Key rotation available</li><li>✓ Request logging enabled</li><li>✓ Automatic key expiration (90 days)</li><li>✓ Two-factor authentication required</li></ul>'
          }
        },
        {
          id: 'integrations-hub',
          title: 'Integrations Hub',
          icon: Puzzle,
          summary: '8 active integrations',
          content: {
            type: 'text',
            data: '<h3>Integrations Hub</h3><p><strong>Active Integrations:</strong> 8 connected</p><p><strong>Available Integrations:</strong> 50+ apps</p><h4>Connected Integrations:</h4><ul><li>✓ <strong>Google Analytics 4</strong> - Analytics<br>Status: Active | Last sync: Real-time</li><li>✓ <strong>Facebook Pixel</strong> - Advertising<br>Status: Active | Last sync: Real-time</li><li>✓ <strong>Google Tag Manager</strong> - Tag Management<br>Status: Active | Last sync: Real-time</li><li>✓ <strong>HubSpot CRM</strong> - Customer Management<br>Status: Active | Last sync: 5 min ago</li><li>✓ <strong>Mailchimp</strong> - Email Marketing<br>Status: Active | Last sync: 1 hour ago</li><li>✓ <strong>Stripe</strong> - Payments<br>Status: Active | Last sync: Real-time</li><li>✓ <strong>Zapier</strong> - Automation<br>Status: Active | Connected workflows: 4</li><li>✓ <strong>Slack</strong> - Team Communication<br>Status: Active | Notifications enabled</li></ul><h4>Popular Available Integrations:</h4><ul><li>Salesforce - CRM</li><li>Shopify - E-commerce</li><li>WordPress - Content Management</li><li>Instagram - Social Media</li><li>Google Ads - Advertising</li><li>LinkedIn Ads - Advertising</li></ul><h4>Integration Settings:</h4><ul><li>Auto-sync frequency: Real-time</li><li>Error notifications: Enabled</li><li>Sync logs retention: 90 days</li></ul>'
          }
        },
        {
          id: 'user-permissions',
          title: 'User & Team Permissions',
          icon: Users,
          summary: '5 team members',
          content: {
            type: 'text',
            data: '<h3>User & Team Permissions</h3><p><strong>Total Users:</strong> 5 team members</p><p><strong>Your Role:</strong> Admin</p><h4>Team Members:</h4><ul><li><strong>John Doe (You)</strong><br>- Role: Admin<br>- Email: john@example.com<br>- Access: Full access<br>- Last active: Now</li><li><strong>Sarah Johnson</strong><br>- Role: Editor<br>- Email: sarah@example.com<br>- Access: Analytics, Reports, Content<br>- Last active: 2 hours ago</li><li><strong>Mike Chen</strong><br>- Role: Analyst<br>- Email: mike@example.com<br>- Access: View-only analytics<br>- Last active: 1 day ago</li><li><strong>Emily Brown</strong><br>- Role: Marketing Manager<br>- Email: emily@example.com<br>- Access: Marketing tools, Campaigns<br>- Last active: 3 hours ago</li><li><strong>David Smith</strong><br>- Role: Developer<br>- Email: david@example.com<br>- Access: API, Integrations, Settings<br>- Last active: 30 minutes ago</li></ul><h4>Available Roles:</h4><ul><li><strong>Admin:</strong> Full access to all features</li><li><strong>Editor:</strong> Edit content and view analytics</li><li><strong>Analyst:</strong> View-only access to analytics</li><li><strong>Marketing Manager:</strong> Marketing tools and campaigns</li><li><strong>Developer:</strong> API and technical integrations</li><li><strong>Viewer:</strong> Read-only access</li></ul><h4>Team Settings:</h4><ul><li>Max users on plan: 10</li><li>Two-factor authentication: Required for admins</li><li>Session timeout: 24 hours</li><li>Password policy: Strong passwords enforced</li></ul>'
          }
        },
        {
          id: 'account-billing',
          title: 'Account & Billing',
          icon: Settings,
          summary: 'Pro Plan - Active',
          content: {
            type: 'text',
            data: '<h3>Account & Billing</h3><p><strong>Current Plan:</strong> Professional Plan</p><p><strong>Billing Status:</strong> Active</p><p><strong>Next Billing Date:</strong> November 15, 2025</p><h4>Plan Details:</h4><ul><li>Plan: Professional</li><li>Price: $99/month (billed annually)</li><li>Billing cycle: Annual</li><li>Sites included: 5</li><li>Team members: 10</li><li>API calls: 10,000/hour</li><li>Data retention: 50 months</li><li>Support: Priority email & chat</li></ul><h4>Usage This Month:</h4><ul><li>Sites connected: 2 of 5</li><li>Team members: 5 of 10</li><li>API calls: 127,456 (within limit)</li><li>Storage used: 2.3 GB of 50 GB</li></ul><h4>Billing History:</h4><ul><li>Oct 15, 2025 - $99.00 (Paid)</li><li>Sep 15, 2025 - $99.00 (Paid)</li><li>Aug 15, 2025 - $99.00 (Paid)</li></ul><h4>Payment Method:</h4><ul><li>Card ending in ••••4242</li><li>Expires: 12/2026</li><li>Type: Visa</li></ul><h4>Available Plans:</h4><ul><li>Starter: $29/month</li><li>Professional: $99/month (Current)</li><li>Enterprise: Custom pricing</li></ul>'
          }
        },
        {
          id: 'backup-export',
          title: 'Backup & Data Export',
          icon: FileCode,
          summary: 'Last backup: Today',
          content: {
            type: 'text',
            data: '<h3>Backup & Data Export</h3><p><strong>Auto-Backup:</strong> Enabled</p><p><strong>Last Backup:</strong> Today at 2:00 AM</p><p><strong>Next Scheduled:</strong> Tomorrow at 2:00 AM</p><h4>Backup Schedule:</h4><ul><li>Frequency: Daily</li><li>Time: 2:00 AM ET</li><li>Retention: 30 days</li><li>Backup location: Secure cloud storage</li><li>Encryption: AES-256</li></ul><h4>Recent Backups:</h4><ul><li>Oct 5, 2025 at 2:00 AM - 245 MB (Success)</li><li>Oct 4, 2025 at 2:00 AM - 243 MB (Success)</li><li>Oct 3, 2025 at 2:00 AM - 241 MB (Success)</li><li>Oct 2, 2025 at 2:00 AM - 238 MB (Success)</li></ul><h4>Data Export Options:</h4><ul><li><strong>Analytics Data</strong><br>- Format: CSV, JSON, Excel<br>- Date range: Last 90 days<br>- Size: ~15 MB</li><li><strong>Customer Data</strong><br>- Format: CSV, JSON<br>- Records: 8,432 contacts<br>- Size: ~3 MB</li><li><strong>E-commerce Data</strong><br>- Format: CSV, Excel<br>- Orders: 456 transactions<br>- Size: ~2 MB</li><li><strong>Full Account Export</strong><br>- Format: ZIP archive<br>- Includes: All data + settings<br>- Size: ~245 MB</li></ul><h4>Export Settings:</h4><ul><li>Include personal data: Yes (GDPR compliant)</li><li>Include historical data: Last 26 months</li><li>Include attachments: Yes</li></ul>'
          }
        }
      ]
    },
    wordpress: {
      name: 'WordPress Marketing Hub',
      category: 'WordPress',
      description: 'Welcome to your comprehensive WordPress marketing analytics platform. Navigate through the menu to explore analytics, SEO, e-commerce, customer insights, and automation tools.',
      cards: [
        {
          id: 'wp-analytics-tracking-overview',
          title: 'Analytics & Tracking',
          icon: TrendingUp,
          summary: 'MonsterInsights, Jetpack Stats',
          content: {
            type: 'text',
            data: '<h3>Analytics & Tracking Overview</h3><p>Access comprehensive tracking and analytics integration for your WordPress site.</p><h4>Available Tools:</h4><ul><li>MonsterInsights Integration</li><li>Jetpack Stats & Analytics</li><li>Google Analytics Dashboard</li><li>WooCommerce Analytics</li><li>Custom Event Tracking</li></ul><p>Navigate to <strong>Analytics & Tracking</strong> in the WordPress menu to explore detailed metrics and setup guides.</p>'
          }
        },
        {
          id: 'wp-seo-content-overview',
          title: 'SEO & Content',
          icon: FileText,
          summary: 'Yoast, RankMath, content tools',
          content: {
            type: 'text',
            data: '<h3>SEO & Content Overview</h3><p>Monitor and optimize your WordPress SEO performance and content strategy.</p><h4>Available Tools:</h4><ul><li>Yoast SEO Dashboard</li><li>RankMath Analytics</li><li>Content Performance Tracker</li><li>Keyword Optimization</li><li>Site Health Monitor</li></ul><p>Navigate to <strong>SEO & Content</strong> in the WordPress menu to access detailed SEO insights.</p>'
          }
        },
        {
          id: 'wp-ecommerce-overview',
          title: 'E-commerce',
          icon: Layout,
          summary: 'WooCommerce analytics',
          content: {
            type: 'text',
            data: '<h3>E-commerce Overview</h3><p>Track WooCommerce performance, revenue, and customer purchasing behavior.</p><h4>Available Tools:</h4><ul><li>WooCommerce Analytics</li><li>Product Performance</li><li>Customer Lifetime Value</li><li>Sales Reports</li><li>Cart Abandonment Tracking</li></ul><p>Navigate to <strong>E-commerce</strong> in the WordPress menu for detailed sales analytics.</p>'
          }
        },
        {
          id: 'wp-customer-insights-overview',
          title: 'Customer Insights',
          icon: Users,
          summary: 'User behavior & segments',
          content: {
            type: 'text',
            data: '<h3>Customer Insights Overview</h3><p>Deep dive into WordPress user behavior, demographics, and engagement patterns.</p><h4>Available Tools:</h4><ul><li>User Segmentation</li><li>Visitor Demographics</li><li>User Journey Mapping</li><li>Heatmaps & Recordings</li></ul><p>Navigate to <strong>Customer Insights</strong> in the WordPress menu to understand your audience better.</p>'
          }
        },
        {
          id: 'wp-automation-tools-overview',
          title: 'Automation & Tools',
          icon: Settings,
          summary: 'Plugins, workflows, integrations',
          content: {
            type: 'text',
            data: '<h3>Automation & Tools Overview</h3><p>Access WordPress automation, plugin management, and integration tools.</p><h4>Available Tools:</h4><ul><li>Marketing Automation</li><li>Plugin Performance</li><li>Form Builder Analytics</li><li>Integration Manager</li></ul><p>Navigate to <strong>Automation & Tools</strong> in the WordPress menu to streamline your marketing.</p>'
          }
        },
        {
          id: 'wp-quick-stats',
          title: 'Quick Stats',
          icon: TrendingUp,
          summary: 'WordPress at a glance',
          content: {
            type: 'text',
            data: '<h3>Quick WordPress Stats</h3><p><strong>This Month Performance:</strong></p><h4>Site Health:</h4><ul><li>WordPress Version: 6.4.2 (Latest)</li><li>Active Plugins: 18</li><li>Site Speed: 1.8s (Excellent)</li><li>Uptime: 99.98%</li></ul><h4>Traffic & Engagement:</h4><ul><li>Sessions: 15,234 (+28.3%)</li><li>Page Views: 42,156 (+22.1%)</li><li>Avg. Time on Site: 4m 12s</li><li>Bounce Rate: 38.5%</li></ul><h4>Content:</h4><ul><li>Published Posts: 156</li><li>Published Pages: 24</li><li>Comments: 892 this month</li><li>Media Files: 2,341</li></ul>'
          }
        }
      ]
    },
    'wp-analytics-tracking': {
      name: 'Analytics & Tracking',
      category: 'WordPress',
      description: 'Comprehensive WordPress analytics tracking and integration management.',
      cards: [
        {
          id: 'monsterinsights',
          title: 'MonsterInsights Integration',
          icon: TrendingUp,
          summary: 'Premium version active',
          content: {
            type: 'text',
            data: '<h3>MonsterInsights Integration</h3><p><strong>Status:</strong> Active (Premium)</p><p><strong>Google Analytics:</strong> Connected</p><p><strong>Version:</strong> 8.24.0</p><h4>Dashboard Overview (Last 30 Days):</h4><ul><li>Sessions: 15,234</li><li>Users: 10,892</li><li>Page Views: 42,156</li><li>Bounce Rate: 38.5%</li><li>Session Duration: 4m 12s</li></ul><h4>Enabled Features:</h4><ul><li>✓ Enhanced eCommerce tracking</li><li>✓ Custom dimensions</li><li>✓ Form tracking (Gravity Forms, WPForms)</li><li>✓ Author tracking</li><li>✓ Download tracking</li><li>✓ Affiliate link tracking</li><li>✓ EU compliance (GDPR)</li></ul><h4>Top Content (This Month):</h4><ol><li>/blog/wordpress-seo-guide - 3,892 views</li><li>/blog/woocommerce-tips - 2,445 views</li><li>/products/premium-theme - 1,892 views</li><li>/about - 1,567 views</li><li>/contact - 1,234 views</li></ol>'
          }
        },
        {
          id: 'jetpack-stats',
          title: 'Jetpack Stats & Analytics',
          icon: TrendingUp,
          summary: 'Real-time insights',
          content: {
            type: 'text',
            data: '<h3>Jetpack Stats & Analytics</h3><p><strong>Status:</strong> Active</p><p><strong>Plan:</strong> Professional</p><p><strong>Real-time Visitors:</strong> 47 online now</p><h4>Today\'s Stats:</h4><ul><li>Views: 1,456</li><li>Visitors: 892</li><li>Likes: 67</li><li>Comments: 23</li></ul><h4>This Week:</h4><ul><li>Total Views: 8,234</li><li>Best Day: Tuesday (1,678 views)</li><li>Avg. Views/Day: 1,176</li></ul><h4>Top Referrers:</h4><ol><li>Google Search - 3,892 visits</li><li>Facebook - 1,234 visits</li><li>Twitter - 892 visits</li><li>Direct - 2,216 visits</li></ol><h4>Active Features:</h4><ul><li>✓ Site stats tracking</li><li>✓ Real-time visitor monitoring</li><li>✓ Comment analytics</li><li>✓ Social media insights</li><li>✓ Search term tracking</li><li>✓ Referrer tracking</li></ul>'
          }
        },
        {
          id: 'wp-ga-dashboard',
          title: 'Google Analytics Dashboard',
          icon: Code,
          summary: 'GA4 integrated in WP',
          content: {
            type: 'text',
            data: '<h3>Google Analytics Dashboard for WordPress</h3><p><strong>Property:</strong> GA4 - yoursite.com</p><p><strong>Measurement ID:</strong> G-XXXXXXXXXX</p><p><strong>Connection Status:</strong> Active</p><h4>Key Metrics (30 Days):</h4><ul><li>Users: 10,892 (+24.5%)</li><li>Sessions: 15,234 (+28.3%)</li><li>Engagement Rate: 61.5%</li><li>Events: 89,456</li></ul><h4>User Acquisition:</h4><ul><li>Organic Search: 45.2% (6,892 users)</li><li>Direct: 28.7% (4,378 users)</li><li>Social: 15.6% (2,381 users)</li><li>Referral: 10.5% (1,603 users)</li></ul><h4>Conversion Events:</h4><ul><li>Form Submissions: 234 conversions</li><li>Product Purchases: 456 conversions</li><li>Newsletter Signups: 189 conversions</li><li>Video Plays: 1,892 engagements</li></ul><h4>Plugin Settings:</h4><ul><li>✓ Automatic GA4 tracking code</li><li>✓ Enhanced measurement enabled</li><li>✓ Cross-domain tracking configured</li><li>✓ IP anonymization active</li></ul>'
          }
        },
        {
          id: 'woocommerce-analytics-tracking',
          title: 'WooCommerce Analytics',
          icon: Layout,
          summary: 'E-commerce tracking active',
          content: {
            type: 'text',
            data: '<h3>WooCommerce Analytics Integration</h3><p><strong>Store Status:</strong> Active</p><p><strong>Enhanced Ecommerce:</strong> Enabled</p><p><strong>Revenue (30 Days):</strong> $38,945</p><h4>Sales Performance:</h4><ul><li>Total Orders: 342</li><li>Average Order Value: $113.87</li><li>Products Sold: 678 units</li><li>Conversion Rate: 3.8%</li></ul><h4>Tracked Events:</h4><ul><li>✓ Product impressions</li><li>✓ Product clicks</li><li>✓ Add to cart events</li><li>✓ Remove from cart</li><li>✓ Checkout initiated</li><li>✓ Purchase completed</li><li>✓ Refund tracking</li></ul><h4>Top Products:</h4><ol><li>Premium WordPress Theme - 89 sales ($7,121)</li><li>SEO Plugin Pro - 124 sales ($6,820)</li><li>Design Template Bundle - 67 sales ($5,360)</li></ol><h4>Analytics Features:</h4><ul><li>Product performance reports</li><li>Customer lifetime value</li><li>Purchase funnel analysis</li><li>Revenue by traffic source</li><li>Cart abandonment tracking</li></ul>'
          }
        },
        {
          id: 'wp-custom-events',
          title: 'Custom Event Tracking',
          icon: MousePointer,
          summary: '12 custom events',
          content: {
            type: 'text',
            data: '<h3>Custom Event Tracking</h3><p><strong>Active Events:</strong> 12 custom events</p><p><strong>Total Triggers (30 days):</strong> 24,567</p><h4>Configured Custom Events:</h4><ul><li><strong>Download PDF</strong><br>- Triggers: 892 times<br>- Category: Resource Downloads<br>- Value: Lead generation</li><li><strong>Video Completion</strong><br>- Triggers: 1,234 times<br>- Tracked: 25%, 50%, 75%, 100%<br>- Top video: Product demo (456 completions)</li><li><strong>External Link Clicks</strong><br>- Triggers: 2,341 times<br>- Top destination: affiliate links<br>- Revenue tracked: $2,456</li><li><strong>Newsletter Popup Interaction</strong><br>- Shown: 8,234 times<br>- Closed: 6,892 times<br>- Submitted: 189 times (2.3% conversion)</li><li><strong>Search Usage</strong><br>- Searches: 1,567<br>- No results: 234 (14.9%)<br>- Top term: "WordPress plugins"</li></ul><h4>Event Categories:</h4><ul><li>User Engagement: 8 events</li><li>Lead Generation: 4 events</li><li>E-commerce: 6 events</li><li>Content Interaction: 5 events</li></ul>'
          }
        }
      ]
    },
    'wp-seo-content': {
      name: 'SEO & Content',
      category: 'WordPress',
      description: 'WordPress SEO optimization and content performance tracking with Yoast and RankMath.',
      cards: []
    },
    'wp-ecommerce': {
      name: 'E-commerce',
      category: 'WordPress',
      description: 'WooCommerce analytics, product performance, and sales tracking.',
      cards: []
    },
    'wp-customer-insights': {
      name: 'Customer Insights',
      category: 'WordPress',
      description: 'WordPress user behavior analysis, demographics, and engagement tracking.',
      cards: []
    },
    'wp-automation-tools': {
      name: 'Automation & Tools',
      category: 'WordPress',
      description: 'WordPress automation plugins, performance monitoring, and integration management.',
      cards: []
    },
    'wp-settings': {
      name: 'Settings',
      category: 'WordPress',
      description: 'WordPress site configuration, security, and system management.',
      cards: []
    },
    googleSearchConsole: {
      name: 'Google Search Console Hub',
      category: 'Google',
      description: 'Monitor your site\'s presence in Google Search results, track performance, fix indexing issues, and optimize your visibility.',
      cards: []
    },
    'gsc-analytics-tracking': {
      name: 'Analytics & Tracking',
      category: 'Google Search Console',
      description: 'Track search performance, monitor clicks, impressions, and analyze user behavior in Google Search.',
      cards: []
    },
    'gsc-seo-content': {
      name: 'SEO & Content',
      category: 'Google Search Console',
      description: 'Monitor indexing, optimize content, track Core Web Vitals, and ensure mobile usability.',
      cards: []
    },
    'gsc-ecommerce': {
      name: 'E-commerce',
      category: 'Google Search Console',
      description: 'Track product performance in Google Search, Shopping tab, and manage Merchant Center integration.',
      cards: []
    },
    'gsc-customer-insights': {
      name: 'Customer Insights',
      category: 'Google Search Console',
      description: 'Understand search behavior, analyze user intent, and track discovery performance.',
      cards: []
    },
    'gsc-automation-tools': {
      name: 'Automation & Tools',
      category: 'Google Search Console',
      description: 'API access, sitemap management, automated reporting, and third-party integrations.',
      cards: []
    },
    'gsc-settings': {
      name: 'Settings',
      category: 'Google Search Console',
      description: 'Property settings, user management, verification, and Search Console configuration.',
      cards: []
    },
    shopify: {
      name: 'Shopify Commerce Hub',
      category: 'Shopify',
      description: 'Complete e-commerce analytics and management for your Shopify store. Track sales, manage products, and optimize your online business.',
      cards: []
    },
    'shopify-analytics-tracking': {
      name: 'Analytics & Tracking',
      category: 'Shopify',
      description: 'Track store performance, sales analytics, and customer behavior with Shopify Analytics.',
      cards: []
    },
    'shopify-seo-content': {
      name: 'SEO & Content',
      category: 'Shopify',
      description: 'Optimize Shopify store for search engines and manage product content.',
      cards: []
    },
    'shopify-ecommerce': {
      name: 'E-commerce',
      category: 'Shopify',
      description: 'Manage products, track inventory, and monitor Shopify sales performance.',
      cards: []
    },
    'shopify-customer-insights': {
      name: 'Customer Insights',
      category: 'Shopify',
      description: 'Shopify customer analytics, purchase behavior, and segmentation.',
      cards: []
    },
    'shopify-automation-tools': {
      name: 'Automation & Tools',
      category: 'Shopify',
      description: 'Shopify automation, app integrations, and workflow management.',
      cards: []
    },
    'shopify-settings': {
      name: 'Settings',
      category: 'Shopify',
      description: 'Shopify store configuration, theme settings, and system preferences.',
      cards: []
    },
    referralProgram: {
      name: 'Referral Program API',
      category: 'Growth',
      description: 'Create and manage referral programs to incentivize customers to bring in new business.',
      cards: []
    }
  };

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Wix',
      subItems: [
        { id: 'analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'seo-content', label: 'SEO & Content' },
        { id: 'ecommerce', label: 'E-commerce' },
        { id: 'customer-insights', label: 'Customer Insights' },
        { id: 'automation-tools', label: 'Automation & Tools' },
        { id: 'settings', label: 'Settings' }
      ]
    },
    { 
      id: 'wordpress', 
      label: 'WordPress',
      subItems: [
        { id: 'wp-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'wp-seo-content', label: 'SEO & Content' },
        { id: 'wp-ecommerce', label: 'E-commerce' },
        { id: 'wp-customer-insights', label: 'Customer Insights' },
        { id: 'wp-automation-tools', label: 'Automation & Tools' },
        { id: 'wp-settings', label: 'Settings' }
      ]
    },
    { 
      id: 'googleSearchConsole', 
      label: 'Google Search Console',
      subItems: [
        { id: 'gsc-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'gsc-seo-content', label: 'SEO & Content' },
        { id: 'gsc-ecommerce', label: 'E-commerce' },
        { id: 'gsc-customer-insights', label: 'Customer Insights' },
        { id: 'gsc-automation-tools', label: 'Automation & Tools' },
        { id: 'gsc-settings', label: 'Settings' }
      ]
    },
    { 
      id: 'shopify', 
      label: 'Shopify',
      subItems: [
        { id: 'shopify-analytics-tracking', label: 'Analytics & Tracking' },
        { id: 'shopify-seo-content', label: 'SEO & Content' },
        { id: 'shopify-ecommerce', label: 'E-commerce' },
        { id: 'shopify-customer-insights', label: 'Customer Insights' },
        { id: 'shopify-automation-tools', label: 'Automation & Tools' },
        { id: 'shopify-settings', label: 'Settings' }
      ]
    }
  ];

  const currentData = apiData[selectedItem] || apiData.overview;

  return (
    <div className="flex h-screen bg-gray-50">
      {!sidebarOpen && (
        <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors mb-4"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      )}
      
      {sidebarOpen && (
        <div className="w-64 bg-gray-100 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">Web Analytics Copilot</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <nav className="p-2">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      setExpandedMenus(prev => ({
                        ...prev,
                        [item.id]: !prev[item.id]
                      }));
                    }
                    setSelectedItem(item.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all flex items-center justify-between ${
                    selectedItem === item.id
                      ? 'bg-white font-medium shadow-sm'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  style={selectedItem === item.id ? {
                    borderLeft: '4px solid #C33527',
                    color: '#C33527'
                  } : {}}
                >
                  <span className="text-sm">{item.label}</span>
                  {item.subItems && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedMenus[item.id] ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {item.subItems && expandedMenus[item.id] && (
                  <div className="ml-4 mb-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setSelectedItem(subItem.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${
                          selectedItem === subItem.id
                            ? 'bg-white font-medium shadow-sm'
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                        style={selectedItem === subItem.id ? {
                          borderLeft: '3px solid #C33527',
                          color: '#C33527'
                        } : {}}
                      >
                        <span className="text-xs">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentData.name}
            {currentData.category && (
              <span className="ml-3 text-sm px-3 py-1 text-white rounded-full font-semibold" style={{ backgroundColor: '#C33527' }}>
                {currentData.category}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-lg">{currentData.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {currentData.cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setActiveModal(card.id);
                  setModalData(card);
                }}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:shadow-lg transition-all group"
                style={{
                  borderTopColor: 'transparent',
                  borderTopWidth: '3px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderTopColor = '#C33527';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderTopColor = 'transparent';
                }}
              >
                <div className="flex items-start gap-4">
                  <IconComponent className="w-8 h-8" style={{ color: '#C33527' }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#C33527] transition-colors">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.summary}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => {
          setActiveModal(null);
          setModalData(null);
        }}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center" style={{ borderTop: '4px solid #C33527' }}>
              <h2 className="text-xl font-semibold">{modalData.title}</h2>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setModalData(null);
                }} 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = '#C33527'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {modalData.content.type === 'code' ? (
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{modalData.content.data}</pre>
                </div>
              ) : modalData.content.type === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        {modalData.content.data.headers.map((header, idx) => (
                          <th key={idx} className="p-3 text-left border border-gray-300">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.content.data.rows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-3 border border-gray-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-[#C33527] prose-code:text-[#C33527] prose-code:bg-red-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                  <div dangerouslySetInnerHTML={{ __html: modalData.content.data }} />
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => {
                setActiveModal(null);
                setModalData(null);
              }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Close
              </button>
              {modalData.content.type === 'code' && (
                <button 
                  onClick={() => navigator.clipboard.writeText(modalData.content.data)} 
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#C33527' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A82A1F'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C33527'}
                >
                  Copy Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAnalyticsCopilot;