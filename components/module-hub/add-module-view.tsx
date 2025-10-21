'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Linkedin,
  ShieldCheck,
  Building2,
  Share2,
  BarChart3,
  Zap,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddModuleSidebar } from './add-module-sidebar';
import { useAuth } from '@/lib/xano/auth-context';
import { getAuthHeaders } from '@/lib/xano/config';

type CategoryType = 'all' | 'analytics' | 'marketing' | 'sales' | 'productivity';

type Module = {
  id: number;
  name: string;
  description?: string;
};

type UserModule = {
  id: number;
  name: string;
  description?: string;
};

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

const getModuleIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('linkedin')) return Linkedin;
  if (n.includes('battle')) return ShieldCheck;
  if (n.includes('call') || n.includes('prep')) return Building2;
  if (n.includes('social')) return Share2;
  if (n.includes('analytic')) return BarChart3;
  if (n.includes('automation')) return Zap;
  return BarChart3; // default
};

const getModuleCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('linkedin') || n.includes('social')) return 'Marketing';
  if (n.includes('battle') || n.includes('call') || n.includes('prep')) return 'Sales';
  if (n.includes('analytic')) return 'Analytics';
  if (n.includes('automation')) return 'Productivity';
  return 'General';
};

export function AddModuleView() {
  const { token, refreshUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingModuleId, setAddingModuleId] = useState<number | null>(null);

  const userModuleIds = userModules.map((m) => m.id);

  useEffect(() => {
    const fetchModules = async () => {
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching user modules...');
        const userModulesResponse = await fetch(
          'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_my_modules',
          {
            method: 'GET',
            headers: getAuthHeaders(token),
          },
        );

        if (!userModulesResponse.ok) {
          throw new Error('Failed to fetch user modules');
        }

        const userModulesData: UserModule[] = await userModulesResponse.json();
        console.log('User modules received:', userModulesData);

        console.log('Fetching all modules...');
        const allModulesResponse = await fetch(
          'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/all_modules',
          {
            method: 'GET',
            headers: getAuthHeaders(token),
          },
        );

        if (!allModulesResponse.ok) {
          throw new Error('Failed to fetch all modules');
        }

        const allModulesData: Module[] = await allModulesResponse.json();
        console.log('All modules received:', allModulesData);

        setUserModules(userModulesData);
        setAllModules(allModulesData);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [token]);

  const handleAddModule = async (moduleId: number) => {
    if (!token || addingModuleId) return;

    try {
      setAddingModuleId(moduleId);
      console.log('Adding module:', moduleId);

      const response = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/save_module_selection',
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ module_id: moduleId }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to add module');
      }

      console.log('Module added successfully');
      await refreshUser();

      // Refresh the module lists
      const userModulesResponse = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_my_modules',
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        },
      );

      if (userModulesResponse.ok) {
        const userModulesData: UserModule[] = await userModulesResponse.json();
        setUserModules(userModulesData);
      }
    } catch (err) {
      console.error('Error adding module:', err);
      setError(err instanceof Error ? err.message : 'Failed to add module');
    } finally {
      setAddingModuleId(null);
    }
  };

  // Merge all modules with user modules to ensure we show everything
  // Start with all available modules from the API
  const allModulesMap = new Map(allModules.map((m) => [m.id, m]));

  // Add user modules that might not be in all_modules
  userModules.forEach((um) => {
    if (!allModulesMap.has(um.id)) {
      allModulesMap.set(um.id, um);
    }
  });

  // Convert back to array and enrich with UI properties
  const enrichedModules = Array.from(allModulesMap.values()).map((module) => ({
    ...module,
    icon: getModuleIcon(module.name),
    category: getModuleCategory(module.name),
    isActive: userModuleIds.includes(module.id),
  }));

  console.log('All modules count:', allModules.length);
  console.log('User modules count:', userModules.length);
  console.log('Enriched modules count:', enrichedModules.length);
  console.log('Active module IDs:', userModuleIds);

  const filteredModules = enrichedModules
    .filter((module) => {
      // Filter by search query
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory =
        selectedCategory === 'all' ||
        module.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort: inactive modules first, active modules at the bottom
      if (a.isActive && !b.isActive) return 1;
      if (!a.isActive && b.isActive) return -1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading modules</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

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
                const isActive = module.isActive;
                const isAdding = addingModuleId === module.id;

                return (
                  <Card
                    key={module.id}
                    onClick={() => !isActive && !isAdding && handleAddModule(module.id)}
                    className={`p-4 sm:p-5 md:p-6 transition-all border-2 ${
                      isActive
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        : 'hover:shadow-lg cursor-pointer hover:border-[#C33527] group'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-2 sm:p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : 'bg-[#C33527]/10 group-hover:bg-[#C33527]/20'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${
                              isActive ? 'text-gray-400' : 'text-[#C33527]'
                            }`}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>

                      <div>
                        <h3
                          className={`font-semibold text-base sm:text-lg mb-2 transition-colors ${
                            isActive ? 'text-gray-400' : 'group-hover:text-[#C33527]'
                          }`}
                        >
                          {module.name}
                        </h3>
                        <p
                          className={`text-sm line-clamp-2 ${
                            isActive ? 'text-gray-400' : 'text-muted-foreground'
                          }`}
                        >
                          {module.description || 'No description available'}
                        </p>
                      </div>

                      <div className="mt-2">
                        {isAdding ? (
                          <Badge className="bg-blue-500/10 text-blue-500">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Adding...
                          </Badge>
                        ) : isActive ? (
                          <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                        ) : (
                          <Badge className="bg-[#C33527]/10 text-[#C33527] hover:bg-[#C33527]/20">
                            Click to Add
                          </Badge>
                        )}
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
