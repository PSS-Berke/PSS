'use client';

import React from 'react';
import { Cpu, Tag } from 'lucide-react';
import type { PDLCompanyProfile } from '@/lib/peopledatalab/types';

interface CompanyTechModuleProps {
  company: PDLCompanyProfile;
}

export function CompanyTechModule({ company }: CompanyTechModuleProps) {
  const technologies = company.technologies || [];
  const tags = company.tags || [];

  if (technologies.length === 0 && tags.length === 0) {
    return null;
  }

  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <Cpu className="h-5 w-5 text-[#C33527]" />
          <h3 className="text-lg font-semibold text-gray-800">Technologies & Tags</h3>
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {technologies.slice(0, 12).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-200"
                >
                  {tech}
                </span>
              ))}
            </div>
            {technologies.length > 12 && (
              <p className="text-xs text-gray-500 mt-2">
                +{technologies.length - 12} more technologies
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-[#C33527]" />
              <h4 className="text-sm font-semibold text-gray-700">Company Tags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
