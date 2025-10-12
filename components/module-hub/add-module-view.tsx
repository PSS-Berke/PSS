'use client';

import React, { useState } from 'react';
import { Search, Linkedin, ShieldCheck, Building2, Share2, BarChart3, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddModuleSidebar } from './add-module-sidebar';

type CategoryType = 'all' | 'analytics' | 'marketing' | 'sales' | 'productivity';

const MOCK_MODULES = [
  {
    id: 4,
    name: 'LinkedIn Copilot',
    description: 'AI-powered LinkedIn content creation and campaign management',
    icon: Linkedin,
    category: 'Marketing',
    isActive: false,
  },
  {
    id: 7,
    name: 'Battle Card',
    description: 'Competitive analysis and battle card generation',
    icon: ShieldCheck,
    category: 'Sales',
    isActive: false,
  },
  {
    id: 6,
    name: 'Call Prep',
    description: 'AI-powered call preparation and company research',
    icon: Building2,
    category: 'Sales',
    isActive: false,
  },
  {
    id: 5,
    name: 'Social Media',
    description: 'Social media content planning and scheduling',
    icon: Share2,
    category: 'Marketing',
    isActive: false,
  },
  {
    id: 1,
    name: 'Analytics',
    description: 'Multi-platform website analytics and insights',
    icon: BarChart3,
    category: 'Analytics',
    isActive: false,
  },
  {
    id: 8,
    name: 'Automations',
    description: 'Workflow automation and task management',
    icon: Zap,
    category: 'Productivity',
    isActive: false,
  },
];

export function AddModuleView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const filteredModules = MOCK_MODULES.filter((module) => {
    // Filter by search query
    const matchesSearch =
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    const matchesCategory =
      selectedCategory === 'all' ||
      module.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <AddModuleSidebar
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Module Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {filteredModules.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No modules found {searchQuery && `matching "${searchQuery}"`}
                  {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filteredModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card
                    key={module.id}
                    className="p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#C33527] group"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2 sm:p-3 bg-[#C33527]/10 rounded-lg group-hover:bg-[#C33527]/20 transition-colors">
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#C33527]" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-[#C33527] transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {module.description}
                        </p>
                      </div>

                      <div className="mt-2">
                        <Badge className="bg-[#C33527]/10 text-[#C33527] hover:bg-[#C33527]/20">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
