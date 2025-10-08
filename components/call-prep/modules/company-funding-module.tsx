'use client';

import React from 'react';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import type { PDLCompanyProfile } from '@/lib/peopledatalab/types';

interface CompanyFundingModuleProps {
  company: PDLCompanyProfile;
}

export function CompanyFundingModule({ company }: CompanyFundingModuleProps) {
  const hasFundingData = company.funding_total || company.funding_stage || company.last_funding_date;
  const hasGrowthData = company.employee_growth_rate;

  if (!hasFundingData && !hasGrowthData) {
    return null;
  }

  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <DollarSign className="h-5 w-5 text-[#C33527]" />
          <h3 className="text-lg font-semibold text-gray-800">Funding & Growth</h3>
        </div>

        {/* Funding Information */}
        {hasFundingData && (
          <div className="space-y-3">
            {company.funding_total && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Funding</p>
                <p className="text-2xl font-bold text-[#C33527]">
                  ${(company.funding_total / 1000000).toFixed(1)}M
                </p>
              </div>
            )}

            {company.funding_stage && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Funding Stage</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {company.funding_stage}
                </span>
              </div>
            )}

            {company.last_funding_date && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Funding</p>
                <p className="text-sm font-semibold text-gray-800">{company.last_funding_date}</p>
              </div>
            )}
          </div>
        )}

        {/* Employee Growth Rate */}
        {hasGrowthData && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#C33527]" />
              <h4 className="text-sm font-semibold text-gray-700">Employee Growth Rate</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {company.employee_growth_rate['3_month'] !== undefined && (
                <div>
                  <p className="text-xs text-gray-600">3 Months</p>
                  <p className={`text-sm font-semibold ${
                    company.employee_growth_rate['3_month'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {company.employee_growth_rate['3_month'] > 0 ? '+' : ''}
                    {(company.employee_growth_rate['3_month'] * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {company.employee_growth_rate['12_month'] !== undefined && (
                <div>
                  <p className="text-xs text-gray-600">12 Months</p>
                  <p className={`text-sm font-semibold ${
                    company.employee_growth_rate['12_month'] > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {company.employee_growth_rate['12_month'] > 0 ? '+' : ''}
                    {(company.employee_growth_rate['12_month'] * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
