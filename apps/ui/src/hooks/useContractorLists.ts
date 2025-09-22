import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ContractorList, type ContractorListItem } from '../services/api-client';

export function useContractorLists() {
  const [lists, setLists] = useState<ContractorList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getContractorLists();
      // Ensure we always have an array
      const listsArray = Array.isArray(data) ? data : [];
      setLists(listsArray);
      
      // Ensure user has a default list
      if (listsArray.length === 0) {
        const defaultList = await apiClient.ensureDefaultList();
        setLists([defaultList]);
      }
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lists');
      // Set empty array on error to prevent undefined
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createList = useCallback(async (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      const newList = await apiClient.createContractorList(data);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      console.error('Error creating list:', err);
      throw err;
    }
  }, []);

  const updateList = useCallback(async (listId: string, updates: Partial<ContractorList>) => {
    try {
      const cleanedUpdates: any = {};
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        cleanedUpdates[key] = value === null ? undefined : value;
      });
      const updatedList = await apiClient.updateContractorList(listId, cleanedUpdates);
      setLists(prev => prev.map(list => list.id === listId ? updatedList : list));
      return updatedList;
    } catch (err) {
      console.error('Error updating list:', err);
      throw err;
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await apiClient.deleteContractorList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    refetch: fetchLists,
    createList,
    updateList,
    deleteList,
  };
}

export function useContractorFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getContractorFavorites();
      console.log('Fetched favorites data:', data);
      // Ensure contractorIds exists and is an array
      const ids = data?.contractorIds || [];
      setFavorites(new Set(ids));
    } catch (err) {
      console.error('Error fetching favorites:', err);
      // Set empty set on error
      setFavorites(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (contractorProfileId: string) => {
    try {
      console.log('Toggling favorite for:', contractorProfileId);
      const result = await apiClient.toggleContractorFavorite(contractorProfileId);
      console.log('Toggle result:', result);
      
      if (result.added) {
        setFavorites(prev => new Set([...prev, contractorProfileId]));
      } else {
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(contractorProfileId);
          return next;
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  const checkFavorites = useCallback(async (contractorProfileIds: string[]) => {
    try {
      const results = await apiClient.checkContractorFavorites(contractorProfileIds);
      
      // Update local state based on results
      const inLists = new Set<string>();
      Object.entries(results).forEach(([id, status]) => {
        if (status.inLists) {
          inLists.add(id);
        }
      });
      
      setFavorites(inLists);
      return results;
    } catch (err) {
      console.error('Error checking favorites:', err);
      return {};
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    isFavorite: (contractorProfileId: string) => favorites.has(contractorProfileId),
    toggleFavorite,
    checkFavorites,
    refetch: fetchFavorites,
  };
}

export function useContractorListItems(listId: string | null) {
  const [items, setItems] = useState<Array<ContractorListItem & { contractor: any }>>([]);
  const [list, setList] = useState<ContractorList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListItems = useCallback(async () => {
    if (!listId) {
      setItems([]);
      setList(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getContractorList(listId);
      setList(data?.list || null);
      // Ensure items is always an array
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error('Error fetching list items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch list items');
      setItems([]);
      setList(null);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const addToList = useCallback(async (contractorProfileId: string, data?: {
    notes?: string;
    tags?: string[];
    rating?: number;
    priority?: 'high' | 'medium' | 'low';
  }) => {
    if (!listId) return;

    try {
      const newItem = await apiClient.addToContractorList(listId, {
        contractorProfileId,
        ...data,
      });
      
      // Refetch to get the full item with contractor data
      await fetchListItems();
      return newItem;
    } catch (err) {
      console.error('Error adding to list:', err);
      throw err;
    }
  }, [listId, fetchListItems]);

  const removeFromList = useCallback(async (contractorProfileId: string) => {
    if (!listId) return;

    try {
      await apiClient.removeFromContractorList(listId, contractorProfileId);
      setItems(prev => prev.filter(item => item.contractorProfileId !== contractorProfileId));
    } catch (err) {
      console.error('Error removing from list:', err);
      throw err;
    }
  }, [listId]);

  useEffect(() => {
    fetchListItems();
  }, [fetchListItems]);

  return {
    list,
    items,
    isLoading,
    error,
    refetch: fetchListItems,
    addToList,
    removeFromList,
  };
}