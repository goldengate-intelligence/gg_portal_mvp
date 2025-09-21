import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { ContractorDetail } from '../../components/contractor-detail';
import { useAuth } from '../../contexts/auth-context';

export default function ContractorDetailRoute() {
  const { user, logout } = useAuth();
  const params = useParams({ from: '/platform/contractor-detail/$contractorId' });
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 pb-20"> {/* Add bottom padding for footer */}
        <ContractorDetail
          contractorId={params.contractorId}
          onActiveTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}