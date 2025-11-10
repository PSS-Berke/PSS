import React from 'react';
import { Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type FeatureRow = {
  category?: string;
  feature: string;
  pro: string | boolean;
  max: string | boolean;
  enterprise: string | boolean;
  agency: string | boolean;
};

const features: FeatureRow[] = [
  // Social Media
  {
    category: 'Social Media Copilot',
    feature: 'Platform Coverage',
    pro: 'Personal accounts',
    max: 'All 9 platforms',
    enterprise: 'All 9 platforms',
    agency: 'All 9 platforms',
  },
  { feature: 'Post Scheduling', pro: true, max: true, enterprise: true, agency: true },
  {
    feature: 'AI Content Generation',
    pro: 'Basic',
    max: 'Advanced',
    enterprise: 'Advanced',
    agency: 'Advanced',
  },

  // LinkedIn
  {
    category: 'LinkedIn Copilot',
    feature: 'Campaign Management',
    pro: false,
    max: '10 campaigns',
    enterprise: '50 campaigns',
    agency: 'Unlimited',
  },
  { feature: 'Lead Generation', pro: false, max: true, enterprise: true, agency: true },
  { feature: 'Connection Automation', pro: false, max: true, enterprise: true, agency: true },

  // Call Prep
  {
    category: 'Call Prep Assistant',
    feature: 'Call Reports/Month',
    pro: '25',
    max: '100',
    enterprise: '500',
    agency: 'Unlimited',
  },
  {
    feature: 'AI-Powered Insights',
    pro: 'Basic',
    max: 'Advanced',
    enterprise: 'Advanced',
    agency: 'Advanced',
  },
  { feature: 'Custom Templates', pro: false, max: true, enterprise: true, agency: true },

  // Battle Cards
  {
    category: 'Battle Card Intelligence',
    feature: 'Battle Cards/Month',
    pro: false,
    max: '20',
    enterprise: '100',
    agency: 'Unlimited',
  },
  { feature: 'Competitor Tracking', pro: false, max: true, enterprise: true, agency: true },
  { feature: 'Auto-Updates', pro: false, max: false, enterprise: true, agency: true },

  // VoIP
  {
    category: 'Phone/VoIP System',
    feature: 'Minutes/Month',
    pro: '500',
    max: '2,000',
    enterprise: '5,000',
    agency: '10,000',
  },
  { feature: 'Call Recording', pro: true, max: true, enterprise: true, agency: true },
  { feature: 'Team Call Analytics', pro: false, max: false, enterprise: true, agency: true },

  // Data
  {
    category: 'Data Enrichment',
    feature: 'Enrichments/Month',
    pro: '50',
    max: '250',
    enterprise: '1,000',
    agency: '2,500',
  },
  { feature: 'Premium Data Access', pro: false, max: true, enterprise: true, agency: true },
  { feature: 'Bulk Enrichment', pro: false, max: false, enterprise: true, agency: true },

  // Analytics
  {
    category: 'Analytics Integration',
    feature: 'Google Analytics',
    pro: false,
    max: true,
    enterprise: true,
    agency: true,
  },
  { feature: 'Custom Dashboards', pro: false, max: false, enterprise: true, agency: true },
  { feature: 'API Access', pro: false, max: false, enterprise: true, agency: true },

  // Team & Support
  {
    category: 'Team & Support',
    feature: 'User Seats',
    pro: '1',
    max: '3',
    enterprise: '10',
    agency: 'Unlimited',
  },
  {
    feature: 'Client Management',
    pro: false,
    max: false,
    enterprise: false,
    agency: 'Unlimited clients',
  },
  { feature: 'White Label Option', pro: false, max: false, enterprise: false, agency: true },
  { feature: 'Priority Support', pro: false, max: false, enterprise: true, agency: true },
  { feature: 'Dedicated Account Manager', pro: false, max: false, enterprise: false, agency: true },
];

function CellContent({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mx-auto" />
    );
  }
  return <span className="font-medium">{value}</span>;
}

export function PricingComparisonTable() {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] font-semibold text-base">Features</TableHead>
            <TableHead className="text-center font-semibold text-base">Pro</TableHead>
            <TableHead className="text-center font-semibold text-base">
              <div className="flex items-center justify-center gap-2">
                Max
                <Badge variant="default" className="text-xs">
                  Popular
                </Badge>
              </div>
            </TableHead>
            <TableHead className="text-center font-semibold text-base">Enterprise</TableHead>
            <TableHead className="text-center font-semibold text-base">Agency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((row, index) => (
            <React.Fragment key={index}>
              {row.category && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-semibold text-sm py-3">
                    {row.category}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">{row.feature}</TableCell>
                <TableCell className="text-center">
                  <CellContent value={row.pro} />
                </TableCell>
                <TableCell className="text-center bg-muted/30">
                  <CellContent value={row.max} />
                </TableCell>
                <TableCell className="text-center">
                  <CellContent value={row.enterprise} />
                </TableCell>
                <TableCell className="text-center">
                  <CellContent value={row.agency} />
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PricingComparisonMobile() {
  const tiers = [
    {
      name: 'Pro',
      data: features.map((f) => ({ feature: f.feature, value: f.pro, category: f.category })),
    },
    {
      name: 'Max',
      data: features.map((f) => ({ feature: f.feature, value: f.max, category: f.category })),
      isPopular: true,
    },
    {
      name: 'Enterprise',
      data: features.map((f) => ({
        feature: f.feature,
        value: f.enterprise,
        category: f.category,
      })),
    },
    {
      name: 'Agency',
      data: features.map((f) => ({ feature: f.feature, value: f.agency, category: f.category })),
    },
  ];

  return (
    <div className="space-y-6">
      {tiers.map((tier) => (
        <div key={tier.name} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            {tier.isPopular && <Badge variant="default">Popular</Badge>}
          </div>
          <div className="space-y-3">
            {tier.data.map((item, index) => (
              <React.Fragment key={index}>
                {item.category && (
                  <div className="font-semibold text-sm text-muted-foreground pt-2">
                    {item.category}
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm">{item.feature}</span>
                  <div className="flex-shrink-0 ml-4">
                    <CellContent value={item.value} />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
