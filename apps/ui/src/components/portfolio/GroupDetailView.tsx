import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trash2, X, Edit3, Check } from 'lucide-react';
import { AssetCardNew } from './AssetCardNew';
import { Button } from '../ui/button';

interface Asset {
  id: string;
  companyName: string;
  naicsDescription: string;
  marketType: 'civilian' | 'defense';
  uei: string;
  activeAwards: { value: string };
}

interface GroupAsset extends Asset {
  type: 'group';
  groupName: string;
  memberAssets: Asset[];
  entityCount: number;
  aggregatedMetrics?: {
    lifetime: string;
    revenue: string;
    pipeline: string;
  };
}

interface GroupDetailViewProps {
  group: GroupAsset;
  onBack: () => void;
  onRemoveMember: (memberUei: string) => void;
  onUpdateGroup: (updatedGroup: GroupAsset) => void;
}

export function GroupDetailView({ group, onBack, onRemoveMember, onUpdateGroup }: GroupDetailViewProps) {
  const [members, setMembers] = useState(group.memberAssets);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [groupName, setGroupName] = useState(group.groupName);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirmModal) {
          setShowConfirmModal(null);
        } else if (isRenaming) {
          setIsRenaming(false);
          setGroupName(group.groupName); // Reset to original name
        } else {
          onBack();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onBack, showConfirmModal, isRenaming, group.groupName]);

  const handleRemoveMemberClick = (memberUei: string) => {
    setShowConfirmModal(memberUei);
  };

  const confirmRemoveMember = (memberUei: string) => {
    // Start removal animation
    setRemovingMember(memberUei);
    setShowConfirmModal(null);

    // Wait for animation, then actually remove
    setTimeout(() => {
      const updatedMembers = members.filter(member => member.uei !== memberUei);
      setMembers(updatedMembers);
      onRemoveMember(memberUei);
      setRemovingMember(null);
    }, 300);
  };

  const cancelRemoval = () => {
    setShowConfirmModal(null);
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
  };

  const handleRenameConfirm = () => {
    if (groupName.trim() && groupName.trim() !== group.groupName) {
      const updatedGroup = {
        ...group,
        groupName: groupName.trim(),
        companyName: groupName.trim()
      };
      onUpdateGroup(updatedGroup);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setGroupName(group.groupName);
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameConfirm();
    }
  };


  const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: '#223040'
      }}
    >
      {children}
    </div>
  );

  const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="p-4 h-full flex flex-col relative z-10">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-20 relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90">

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>

          <div className="flex items-center gap-3 mb-1">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-4xl font-light text-white tracking-wide bg-transparent border-b-2 border-[#8B8EFF] focus:outline-none focus:border-[#D2AC38] transition-colors"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  autoFocus
                />
                <button
                  onClick={handleRenameConfirm}
                  className="p-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRenameCancel}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-light text-white tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {group.groupName}
                </h1>
                <button
                  onClick={handleRenameClick}
                  className="p-2 text-gray-400 hover:text-[#D2AC38] transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-[#8B8EFF] text-sm tracking-wide flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" />
            {members.length} MEMBER{members.length !== 1 ? 'S' : ''} • GROUP MANAGEMENT
          </p>

          {/* Group Overview */}
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Manage the contractors in your <strong>{groupName}</strong> group. Remove members or view individual contractor details.
          </p>
        </div>

        {/* Group Members */}
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="border border-[#8B8EFF]/30 rounded-xl overflow-hidden hover:border-[#8B8EFF]/50 transition-all duration-500" style={{ backgroundColor: '#223040' }}>
                <InternalContentContainer>

                  {/* Content Section */}
                  <div className="flex-1">
                <div className="relative h-full">
                  {/* Title */}
                  <div className="absolute top-0 left-0 z-10">
                    <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                      {group.groupName} Members
                    </h3>
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                    <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                      LIVE
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-8">
                    <div className="grid grid-cols-1 gap-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className={`relative transition-all duration-300 group ${
                            removingMember === member.uei
                              ? 'opacity-0 scale-95 translate-x-8'
                              : 'opacity-100 scale-100 translate-x-0'
                          }`}
                        >
                          <AssetCardNew
                            companyName={member.companyName}
                            naicsDescription={member.naicsDescription}
                            marketType={member.marketType}
                            uei={member.uei}
                            activeAwards={member.activeAwards}
                            onClick={() => {
                              window.location.href = `/platform/contractor-detail/${member.uei}`;
                            }}
                          />


                          {/* Remove Member Button */}
                          {members.length > 1 && (
                            <button
                              className="absolute top-6 right-6 p-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg group-hover:bg-red-500/20 group-hover:border-red-500/30 hover:!bg-red-500/70 hover:!border-red-400 transition-all cursor-pointer z-30 hover:scale-125 opacity-0 group-hover:opacity-100 hover:!opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMemberClick(member.uei);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-300 hover:!text-red-200" />
                            </button>
                          )}
                        </div>
                      ))}

                      {members.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No members in this group</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  </div>
                </InternalContentContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-red-500/30 rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Remove Member
                  </h3>
                  <p className="text-red-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Are you sure you want to remove{' '}
                <span className="text-white font-medium">
                  {members.find(m => m.uei === showConfirmModal)?.companyName}
                </span>{' '}
                from the group? They will be returned to your individual assets.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={cancelRemoval}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRemoveMember(showConfirmModal)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}