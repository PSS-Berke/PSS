'use client';

import React, { useState } from 'react';
import { ActiveModulesSidebar } from './active-modules-sidebar';
import { ModuleUserList } from './module-user-list';
import { Linkedin, ShieldCheck, Building2, Share2, BarChart3 } from 'lucide-react';

const MODULE_NAMES: Record<number, string> = {
  4: 'LinkedIn Copilot',
  7: 'Battle Card',
  6: 'Call Prep',
  5: 'Social Media',
  1: 'Analytics',
};

export function ActiveModulesView() {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(4); // Default to first module
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedModuleName = MODULE_NAMES[selectedModuleId] || 'Module';

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ActiveModulesSidebar
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
        selectedModuleId={selectedModuleId}
        onSelectModule={setSelectedModuleId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ModuleUserList
          moduleName={selectedModuleName}
          moduleId={selectedModuleId}
        />
      </div>
    </div>
  );
}
