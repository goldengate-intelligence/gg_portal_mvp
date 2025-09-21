import React, { useState, useEffect } from 'react';
import { Plus, Folder, Star, Trash2, ChevronRight, Download, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { useContractorLists, useContractorListItems } from '../../hooks/useContractorLists';
import { formatCurrency } from '../../utils/contractor-profile-transform';
import { ContractorCard } from '../../components/ui/card';
import { LoadingState, EmptyState } from '../../components/ui/skeleton';

export function Portfolio() {
  const { lists, isLoading: listsLoading, createList, deleteList } = useContractorLists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  const { 
    list: selectedList, 
    items: listItems, 
    isLoading: itemsLoading,
    removeFromList 
  } = useContractorListItems(selectedListId);

  // Select default list by default
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      const defaultList = lists.find(l => l.isDefault);
      if (defaultList) {
        setSelectedListId(defaultList.id);
      } else {
        setSelectedListId(lists[0].id);
      }
    }
  }, [lists, selectedListId]);

  const handleCreateList = async () => {
    const name = prompt('Enter list name:');
    if (name) {
      try {
        const newList = await createList({
          name,
          description: '',
          color: '#EAB308',
        });
        setSelectedListId(newList.id);
      } catch (error) {
        console.error('Failed to create list:', error);
      }
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(listId);
        if (selectedListId === listId) {
          setSelectedListId(lists[0]?.id || null);
        }
      } catch (error) {
        console.error('Failed to delete list:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete list');
      }
    }
  };

  const handleRemoveFromList = async (contractorProfileId: string) => {
    if (!selectedListId) return;
    
    try {
      await removeFromList(contractorProfileId);
    } catch (error) {
      console.error('Failed to remove from list:', error);
    }
  };

  if (listsLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Lists */}
      <div className="w-80 bg-dark-gray border-r border-yellow-500/20 flex flex-col">
        <div className="p-4 border-b border-yellow-500/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-yellow-500 font-aptos">My Lists</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateList}
              className="text-gray-400 hover:text-yellow-500"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {lists.map(list => (
            <div
              key={list.id}
              className={`
                group relative p-3 mb-2 rounded-lg cursor-pointer transition-all
                ${selectedListId === list.id 
                  ? 'bg-yellow-500/10 border border-yellow-500/30' 
                  : 'hover:bg-yellow-500/5 border border-transparent hover:border-yellow-500/20'
                }
              `}
              onClick={() => setSelectedListId(list.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-black/30`}>
                  {list.isDefault ? (
                    <Star className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {list.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {list.itemCount} {list.itemCount === 1 ? 'contractor' : 'contractors'}
                  </p>
                  {list.totalValue && parseFloat(list.totalValue) > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">
                      {formatCurrency(list.totalValue)}
                    </p>
                  )}
                </div>
                {selectedListId === list.id && (
                  <ChevronRight className="h-4 w-4 text-yellow-500 mt-1" />
                )}
              </div>
              
              {!list.isDefault && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - List Items */}
      <div className="flex-1 bg-medium-gray overflow-y-auto">
        {selectedList ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-yellow-500 font-aptos">
                    {selectedList.name}
                  </h1>
                  {selectedList.description && (
                    <p className="text-gray-400 mt-1">{selectedList.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/20 text-gray-300 hover:text-yellow-500"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/20 text-gray-300 hover:text-yellow-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{listItems.length} contractors</span>
                {selectedList.totalValue && parseFloat(selectedList.totalValue) > 0 && (
                  <>
                    <span>•</span>
                    <span>Total value: {formatCurrency(selectedList.totalValue)}</span>
                  </>
                )}
              </div>
            </div>

            {itemsLoading ? (
              <LoadingState />
            ) : listItems.length === 0 ? (
              <EmptyState
                title="No contractors in this list"
                description="Start adding contractors from the Identify Targets page"
                action={
                  <Button
                    onClick={() => window.location.href = '/platform/identify'}
                    variant="default"
                  >
                    Browse Contractors
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listItems.map(item => (
                  <div key={item.id} className="relative group">
                    <ContractorCard
                      contractor={{
                        id: item.contractor.id,
                        name: item.contractor.displayName,
                        industry: item.contractor.primaryIndustryCluster || 'Other',
                        location: 'US',
                        state: item.contractor.headquartersState,
                        totalContractValue: parseFloat(item.contractor.totalObligated),
                        pastPerformanceScore: item.contractor.performanceScore,
                        totalUeis: item.contractor.totalUeis,
                        totalAgencies: item.contractor.totalAgencies,
                        activeContracts: item.contractor.totalContracts,
                      }}
                      onClick={() => {
                        // Navigate to contractor detail
                        console.log('View contractor:', item.contractor.displayName);
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFromList(item.contractorProfileId)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                      title="Remove from list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {item.notes && (
                      <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-400">
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              title="No list selected"
              description="Select a list from the sidebar to view contractors"
            />
          </div>
        )}
      </div>
    </div>
  );
}