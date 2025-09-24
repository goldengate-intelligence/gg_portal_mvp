import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Edit2, X } from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  groupName: string;
  memberCount: number;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

export function GroupSettingsModal({
  isOpen,
  groupName,
  memberCount,
  onRename,
  onCancel
}: GroupSettingsModalProps) {
  const [newName, setNewName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (newName.trim() && newName.trim() !== groupName) {
      onRename(newName.trim());
    }
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setNewName(groupName);
      setIsEditing(false);
      onCancel();
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-[#8B8EFF]/50 rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#8B8EFF]/20 border border-[#8B8EFF]/40 rounded-xl">
            <Settings className="w-6 h-6 text-[#8B8EFF]" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-light text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Group Settings
            </h3>
            <p className="text-[#8B8EFF] text-sm">
              {memberCount} entities in group
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Group Name Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B8EFF]/50 focus:border-[#8B8EFF]/50 transition-colors"
                placeholder="Enter group name..."
                autoFocus
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-md bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 border border-[#8B8EFF]/40 hover:border-[#8B8EFF]/60 text-[#8B8EFF] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Group Info */}
          <div className="pt-2 border-t border-gray-700/50">
            <div className="text-sm text-gray-400">
              This group contains <span className="text-white font-medium">{memberCount} entities</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => {
              setNewName(groupName);
              onCancel();
            }}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#8B8EFF] hover:bg-[#8B8EFF]/80 text-white font-medium rounded-md transition-colors"
            disabled={!newName.trim() || newName.trim() === groupName}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}