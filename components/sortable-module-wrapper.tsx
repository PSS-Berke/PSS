'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableModuleWrapperProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Wrapper component that makes any module draggable and sortable
 * Uses @dnd-kit/sortable for smooth drag-and-drop interactions
 */
export function SortableModuleWrapper({ id, children }: SortableModuleWrapperProps) {
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
      {...attributes}
    >
      {children}

      {/* Drag Handle - Positioned where expand button used to be */}
      <div
        ref={setActivatorNodeRef}
        className="absolute top-[27px] right-[60px] z-10 px-1 py-3 rounded-md hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
