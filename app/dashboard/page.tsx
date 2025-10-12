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
import { WixAnalyticsModule } from '@/components/wix-analytics/wix-analytics-module';
import { CallPrepProvider } from '@/lib/xano/call-prep-context';
import { BattleCardProvider } from '@/lib/xano/battle-card-context';
import { LinkedInProvider } from '@/lib/xano/linkedin-context';
import { SocialMediaProvider } from '@/lib/xano/social-media-context';
import { WixAnalyticsProvider } from '@/lib/xano/wix-analytics-context';
import { useAuth } from '@/lib/xano/auth-context';
import { SortableModuleWrapper } from '@/components/sortable-module-wrapper';
import { getAuthHeaders } from '@/lib/xano/config';

// Define module configuration
interface ModuleConfig {
  id: number;
  sortId: string;
  Component: React.ComponentType<{
    className?: string;
    onExpandedChange?: (isExpanded: boolean) => void;
  }>;
  Provider: React.ComponentType<{ children: React.ReactNode }>;
}

const ALL_MODULES: ModuleConfig[] = [
  { id: 1, sortId: 'wixanalytics', Component: WixAnalyticsModule, Provider: WixAnalyticsProvider },
  { id: 4, sortId: 'linkedin', Component: LinkedInModule, Provider: LinkedInProvider },
  { id: 5, sortId: 'social', Component: SocialMediaModule, Provider: SocialMediaProvider },
  { id: 6, sortId: 'callprep', Component: CallPrepModule, Provider: CallPrepProvider },
  { id: 7, sortId: 'battlecard', Component: BattleCardModule, Provider: BattleCardProvider },
];

export default function DashboardPage() {
  const { user, isLoading, token } = useAuth();

  // Get user's module IDs - memoized to prevent recreation on every render
  const userModuleIds = React.useMemo(() => user?.modules?.map(m => m.id) || [], [user?.modules]);

  // Filter modules based on user's access and initialize state
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [isLoadingLayout, setIsLoadingLayout] = useState(false);

  // Track expanded state for each module
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Fetch saved layout order and update modules when user's modules change
  React.useEffect(() => {
    // Don't run if still loading auth
    if (isLoading) {
      return;
    }

    const fetchLayoutAndUpdateModules = async () => {
      setIsLoadingLayout(true);
      const updatedModules = ALL_MODULES.filter(module => userModuleIds.includes(module.id));

      // If no token or no modules, just set the default order
      if (!token || updatedModules.length === 0) {
        setModules(updatedModules);
        setIsLoadingLayout(false);
        return;
      }

      try {
        // Fetch saved layout
        const response = await fetch(
          'https://xnpm-iauo-ef2d.n7e.xano.io/api:omCf_wtg/position',
          {
            method: 'GET',
            headers: getAuthHeaders(token),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const savedSequence = data.sequence_dashboard as number[] | undefined;

          // If we have a saved sequence, reorder modules based on it
          if (savedSequence && Array.isArray(savedSequence) && savedSequence.length > 0) {
            const orderedModules = [...updatedModules].sort((a, b) => {
              const indexA = savedSequence.indexOf(a.id);
              const indexB = savedSequence.indexOf(b.id);

              // If both are in the sequence, sort by their position
              if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
              }
              // If only A is in sequence, A comes first
              if (indexA !== -1) return -1;
              // If only B is in sequence, B comes first
              if (indexB !== -1) return 1;
              // If neither is in sequence, maintain original order
              return 0;
            });
            setModules(orderedModules);
          } else {
            setModules(updatedModules);
          }
        } else {
          // If fetch fails, use default order
          setModules(updatedModules);
        }
      } catch (error) {
        console.error('Failed to fetch layout:', error);
        // On error, use default order
        setModules(updatedModules);
      } finally {
        setIsLoadingLayout(false);
      }
    };

    void fetchLayoutAndUpdateModules();
  }, [isLoading, userModuleIds, token]); // Re-run when auth loading completes, user's module IDs or token change

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder modules and save to backend
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('=== handleDragEnd called ===');
    console.log('active.id:', active.id);
    console.log('over:', over);
    console.log('token:', token ? 'exists' : 'missing');
    console.log('current modules:', modules);

    if (over && active.id !== over.id) {
      console.log('Reordering modules...');
      
      setModules((items) => {
        console.log('Inside setModules, items:', items);
        const oldIndex = items.findIndex((item) => item.sortId === active.id);
        const newIndex = items.findIndex((item) => item.sortId === over.id);
        console.log('oldIndex:', oldIndex, 'newIndex:', newIndex);
        
        const newModuleOrder = arrayMove(items, oldIndex, newIndex);
        console.log('newModuleOrder:', newModuleOrder);
        
        // Save the new order to the backend
        if (token && newModuleOrder.length > 0) {
          const sequence = newModuleOrder.map(m => m.id);
          console.log('Saving layout order:', sequence);
          
          fetch(
            'https://xnpm-iauo-ef2d.n7e.xano.io/api:omCf_wtg/position',
            {
              method: 'POST',
              headers: getAuthHeaders(token),
              body: JSON.stringify({
                page: 'dashboard',
                sequence: sequence,
              }),
            }
          )
          .then(response => {
            console.log('Response received:', response.status);
            if (response.ok) {
              console.log('Layout saved successfully');
            } else {
              console.error('Failed to save layout, status:', response.status);
              return response.text().then(text => console.error('Error details:', text));
            }
          })
          .catch(error => {
            console.error('Failed to save layout:', error);
          });
        } else {
          console.log('Not saving - token:', !!token, 'newModuleOrder.length:', newModuleOrder.length);
        }
        
        return newModuleOrder;
      });
    } else {
      console.log('Skipping - condition not met');
      if (!over) console.log('  - over is null');
      if (over && active.id === over.id) console.log('  - active.id === over.id');
    }
  };

  if (isLoading || isLoadingLayout) {
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
      <div className="w-full p-0 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="mb-6 px-2">
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
            <div className="space-y-6 w-full px-2">
              {modules.map(({ sortId, Component, Provider }) => (
                <div key={sortId} className="w-full mx-auto px-1">
                  <SortableModuleWrapper id={sortId} isExpanded={expandedModules[sortId] || false}>
                    <Provider>
                      <Component
                        onExpandedChange={(isExpanded) => {
                          setExpandedModules(prev => ({ ...prev, [sortId]: isExpanded }));
                        }}
                      />
                    </Provider>
                  </SortableModuleWrapper>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}
