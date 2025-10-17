'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableModuleWrapperProps {
  id: string;
  children: React.ReactNode;
  isExpanded?: boolean;
}

/**
 * Wrapper component that makes any module draggable and sortable
 * Uses @dnd-kit/sortable for smooth drag-and-drop interactions
 */
export function SortableModuleWrapper({
  id,
  children,
  isExpanded = false,
}: SortableModuleWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Apply transforms for drag animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative transition-all duration-200
        ${isDragging ? 'scale-[1.02] shadow-2xl' : ''}
      `}
    >
      {children}

      {/* Drag Handle - Hidden on mobile and when module is expanded, positioned on desktop between badges and expand button */}
      {!isExpanded && (
        <div
          ref={setActivatorNodeRef}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-12 z-10 items-center justify-center h-9 w-9 p-0 rounded-md hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing touch-none mr-2"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        </div>
      )}
    </div>
  );
}
