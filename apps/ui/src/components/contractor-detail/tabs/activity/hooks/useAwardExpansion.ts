/**
 * Award Expansion Hook
 *
 * Manages expansion state for award items
 */

import { useState } from 'react';

export const useAwardExpansion = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isExpanded = (itemId: string): boolean => {
    return expandedItems.has(itemId);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const expandAll = (itemIds: string[]) => {
    setExpandedItems(new Set(itemIds));
  };

  return {
    expandedItems,
    toggleItemExpansion,
    isExpanded,
    collapseAll,
    expandAll
  };
};