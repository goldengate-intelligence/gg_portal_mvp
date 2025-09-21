import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PortfolioItemCard } from './PortfolioItemCard';
import { EmptyState } from '../ui/skeleton';
import type { PortfolioItem } from '../../types';

interface PortfolioListProps {
  items: PortfolioItem[];
  viewMode: 'grid' | 'list';
  onReorder: (items: PortfolioItem[]) => void;
  onRemove: (contractorId: string) => void;
  searchQuery?: string;
}

export function PortfolioList({
  items,
  viewMode,
  onReorder,
  onRemove,
  searchQuery,
}: PortfolioListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index + 1,
      }));
      
      onReorder(reorderedItems);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title={searchQuery ? "No contractors found" : "Portfolio is empty"}
          description={
            searchQuery 
              ? "Try adjusting your search query" 
              : "Add contractors to your portfolio to start tracking"
          }
        />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`p-6 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onRemove={() => onRemove(item.contractorId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}