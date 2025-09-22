import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface QueryResultsTableProps {
  data: any[];
  columns: string[];
  isLoading?: boolean;
}

export function QueryResultsTable({ data, columns, isLoading }: QueryResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortColumn, sortDirection]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-[#223040] border border-gray-600 rounded-lg">
          <div className="p-4 text-center text-white">
            Loading query results...
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-[#223040] border border-gray-600 rounded-lg">
          <div className="p-4 text-center text-white">
            No results found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-[#F97316] rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full bg-[#223040] border-collapse min-w-full">
        <thead>
          <tr className="bg-black">
            {columns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleSort(column)}
                className="border-r border-gray-600 px-3 py-2 text-left text-sm font-normal text-[#D2AC38] cursor-pointer hover:bg-[#2a3540] transition-colors whitespace-nowrap min-w-[120px]"
              >
                <div className="flex items-center justify-between">
                  <span>{column}</span>
                  <div className="flex flex-col ml-2">
                    <ChevronUp
                      className={`w-3 h-3 ${
                        sortColumn === column && sortDirection === 'asc'
                          ? 'text-[#D2AC38]'
                          : 'text-gray-500'
                      }`}
                    />
                    <ChevronDown
                      className={`w-3 h-3 -mt-1 ${
                        sortColumn === column && sortDirection === 'desc'
                          ? 'text-[#D2AC38]'
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-black/40' : 'bg-[#223040]'}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="border-r border-gray-600 px-3 py-2 text-sm text-white whitespace-nowrap"
                >
                  {row[column] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}