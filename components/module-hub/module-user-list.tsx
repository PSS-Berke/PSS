'use client';

import React from 'react';
import { UserCircle2, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModuleUserListProps {
  moduleName: string;
  moduleId: number;
}

export function ModuleUserList({ moduleName }: ModuleUserListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <h2 className="text-2xl font-bold mb-2">{moduleName}</h2>
        <p className="text-muted-foreground">Users in your company with this module</p>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-12 max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#C33527]/10 rounded-full">
              <Building2 className="h-16 w-16 text-[#C33527]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3">Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            User management and module analytics will be available in the next update.
          </p>
          <Badge className="bg-[#C33527]/10 text-[#C33527] hover:bg-[#C33527]/20">
            Feature in Development
          </Badge>

          {/* Preview of what it will look like */}
          <div className="mt-8 space-y-3 opacity-50">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <UserCircle2 className="h-10 w-10 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@company.com</p>
              </div>
              <Badge variant="outline">Admin</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <UserCircle2 className="h-10 w-10 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Jane Smith</p>
                <p className="text-xs text-muted-foreground">jane@company.com</p>
              </div>
              <Badge variant="outline">User</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
