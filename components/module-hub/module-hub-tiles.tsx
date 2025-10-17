'use client';

import React from 'react';
import { Plus, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ModuleHubTilesProps {
  onSelectTile: (tile: 'add-module' | 'active-modules') => void;
}

export function ModuleHubTiles({ onSelectTile }: ModuleHubTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
      {/* Active Modules Tile */}
      <button onClick={() => onSelectTile('active-modules')} className="group">
        <Card className="h-48 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg hover:scale-105 hover:border-[#C33527] cursor-pointer">
          <div className="p-4 bg-[#C33527]/10 rounded-full group-hover:bg-[#C33527]/20 transition-colors">
            <Settings2 className="h-12 w-12 text-[#C33527] group-hover:text-[#DA857C]" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-[#C33527] transition-colors">
              Active Modules
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your modules</p>
          </div>
        </Card>
      </button>

      {/* Add Module Tile */}
      <button onClick={() => onSelectTile('add-module')} className="group">
        <Card className="h-48 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg hover:scale-105 hover:border-[#C33527] cursor-pointer">
          <div className="p-4 bg-[#C33527]/10 rounded-full group-hover:bg-[#C33527]/20 transition-colors">
            <Plus className="h-12 w-12 text-[#C33527] group-hover:text-[#DA857C]" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-[#C33527] transition-colors">
              Add Module
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Browse available modules</p>
          </div>
        </Card>
      </button>
    </div>
  );
}
