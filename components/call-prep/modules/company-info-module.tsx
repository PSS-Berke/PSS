'use client';

import React from 'react';
import { Building2, Users, Calendar, MapPin, Globe, DollarSign, TrendingUp } from 'lucide-react';
import type { PDLCompanyProfile } from '@/lib/peopledatalab/types';

interface CompanyInfoModuleProps {
  company: PDLCompanyProfile;
}

export function CompanyInfoModule({ company }: CompanyInfoModuleProps) {
  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        {/* Company Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-[#C33527]" />
            <h3 className="text-xl font-bold text-gray-800">
              {company.display_name || company.name}
            </h3>
          </div>
          {company.headline && (
            <p className="text-sm text-gray-600 italic">{company.headline}</p>
          )}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {company.employee_count && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Employees</p>
                <p className="text-sm font-semibold text-gray-800">
                  {company.employee_count.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {company.founded && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Founded</p>
                <p className="text-sm font-semibold text-gray-800">{company.founded}</p>
              </div>
            </div>
          )}

          {company.industry && (
            <div className="flex items-start gap-2 col-span-2">
              <TrendingUp className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Industry</p>
                <p className="text-sm font-semibold text-gray-800">{company.industry}</p>
              </div>
            </div>
          )}

          {company.location?.name && (
            <div className="flex items-start gap-2 col-span-2">
              <MapPin className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Location</p>
                <p className="text-sm font-semibold text-gray-800">{company.location.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {company.summary && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-700 line-clamp-4">{company.summary}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
          {company.linkedin_url && (
            <a
              href={company.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
