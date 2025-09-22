import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { ContractorDetail } from '../../components/contractor-detail';
import { useAuth } from '../../contexts/auth-context';

export default function ContractorDetailRoute() {
  const { user, logout } = useAuth();
  const params = useParams({ from: '/platform/contractor-detail/$contractorId' });
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 pb-20 pt-16"> {/* Add top padding for header and bottom padding for footer */}
        <ContractorDetail
          contractorId={params.contractorId}
          onActiveTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}