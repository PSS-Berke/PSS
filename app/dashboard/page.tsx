"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CallPrepModule } from '@/components/call-prep/call-prep-module';
import { BattleCardModule } from '@/components/battle-card/battle-card-module';
import { LinkedInModule } from '@/components/linkedin/linkedin-module';
import { SocialMediaModule } from '@/components/social/social-media-module';
import { CallPrepProvider } from '@/lib/xano/call-prep-context';
import { BattleCardProvider } from '@/lib/xano/battle-card-context';
import { LinkedInProvider } from '@/lib/xano/linkedin-context';
import { SocialMediaProvider } from '@/lib/xano/social-media-context';
import { useUser } from '@/lib/xano/auth-context';
import { SortableModuleWrapper } from '@/components/sortable-module-wrapper';

// Define module configuration
interface ModuleConfig {
  id: number;
  sortId: string;
  Component: React.ComponentType<{ className?: string }>;
  Provider: React.ComponentType<{ children: React.ReactNode }>;
}

const ALL_MODULES: ModuleConfig[] = [
  { id: 4, sortId: 'linkedin', Component: LinkedInModule, Provider: LinkedInProvider },
  { id: 5, sortId: 'social', Component: SocialMediaModule, Provider: SocialMediaProvider },
  { id: 6, sortId: 'callprep', Component: CallPrepModule, Provider: CallPrepProvider },
  { id: 7, sortId: 'battlecard', Component: BattleCardModule, Provider: BattleCardProvider },
];

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  // Get user's module IDs
  const userModuleIds = user?.modules?.map(m => m.id) || [];

  // Filter modules based on user's access and initialize state
  const initialModules = ALL_MODULES.filter(module => userModuleIds.includes(module.id));
  const [modules, setModules] = useState<ModuleConfig[]>(initialModules);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder modules
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.sortId === active.id);
        const newIndex = items.findIndex((item) => item.sortId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return (
      <main className="w-full h-full">
        <div className="w-full p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Loading your modules...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">All your modules in one place</p>
        </div>

        {/* Sortable Modules */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.sortId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 w-full">
              {modules.map(({ sortId, Component, Provider }) => (
                <SortableModuleWrapper key={sortId} id={sortId}>
                  <Provider>
                    <Component />
                  </Provider>
                </SortableModuleWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}
