// This is just the network section of contractor-detail.tsx, fixed
// Lines 1610-1630 approximately

                {activeTab === 'network' && (
                  <div className="space-y-6">
                    {networkData ? (
                      <>
                        {/* Network Dashboard - network_v1 */}
                        <NetworkV1Layout 
                          contractor={contractor}
                          networkData={networkData}
                          getMapPosition={getMapPosition}
                          parsePlaceOfPerformance={parsePlaceOfPerformance}
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-light">Loading network data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}