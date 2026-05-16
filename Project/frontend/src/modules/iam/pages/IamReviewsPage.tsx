'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ScrollText, Calendar, Play, CheckCircle2, AlertTriangle, ShieldCheck, UserX, KeyRound, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIamDashboard, useReviewIdentities, useCertifyIdentity } from '../hooks/useIamAnalytics';
import type { IAMReview, IAMReviewIdentity } from '../types/iam.types';

export function IamReviewsPage() {
  const { data: dashboardData, isLoading: isLoadingCampaigns } = useIamDashboard({ timeframe: '30d' });
  const campaigns = dashboardData?.data?.reviews || [];
  
  const [activeCampaign, setActiveCampaign] = useState<IAMReview | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'approved' | 'revoked'>>({});

  // Auto-select first ongoing campaign when loaded
  useEffect(() => {
    if (campaigns.length > 0 && !activeCampaign) {
      setActiveCampaign(campaigns.find(c => c.status === 'ongoing') || campaigns[0]);
    }
  }, [campaigns, activeCampaign]);

  const { 
    data: identitiesResponse, 
    isLoading: isLoadingIdentities,
    isRefetching: isRefetchingIdentities,
    refetch 
  } = useReviewIdentities(activeCampaign?.id);
  
  const identities: IAMReviewIdentity[] = identitiesResponse?.data || [];
  const certifyMutation = useCertifyIdentity();

  const handleAction = async (id: string, action: 'approved' | 'revoked') => {
    // Optimistic UI update
    setLocalStatuses(prev => ({ ...prev, [id]: action }));
    try {
      await certifyMutation.mutateAsync({ identityId: id, action });
    } catch (e) {
      // Revert on failure
      setLocalStatuses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Identity Access Reviews</h1>
          <p className="text-gray-400 mt-1 text-sm">Periodic Zero Trust certification of user privileges to ensure least-privilege compliance</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-500 text-white border-none shadow-lg shadow-teal-900/20">
          <Calendar className="w-4 h-4 mr-2" /> Start New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {isLoadingCampaigns ? (
        <div className="h-48 flex items-center justify-center bg-surface-dark border border-white/[0.06] rounded-xl">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map(rev => (
            <Card key={rev.id} onClick={() => setActiveCampaign(rev)} className={cn(
              "p-6 border-white/[0.06] shadow-glass flex flex-col justify-between h-full cursor-pointer transition-all duration-300",
              activeCampaign?.id === rev.id ? "bg-teal-500/10 border-teal-500/50 transform scale-[1.01]" : "bg-surface-dark hover:bg-white/[0.04]"
            )}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-xl shadow-lg", activeCampaign?.id === rev.id ? "bg-gradient-to-br from-teal-500/30 to-teal-600/30 text-teal-300" : "bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-400")}>
                    <ScrollText className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className={
                    rev.status === 'ongoing' ? 'border-warning/30 text-warning-light bg-warning/10' : 
                    rev.status === 'completed' ? 'border-success/30 text-success-light bg-success/10' :
                    'border-gray-500/30 text-gray-400 bg-gray-500/10'
                  }>
                    {rev.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{rev.title}</h3>
                <p className="text-sm text-gray-400 mb-5">Target Scope: <span className="text-gray-200">{rev.targetRole}</span></p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-gray-400 font-medium tracking-wide">
                    <span>{Math.round((rev.progress / 100) * 100)} / 100 Evaluated</span>
                    <span className={cn(rev.status === 'completed' ? "text-success-light" : "text-teal-400")}>{rev.progress}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000 ease-out", rev.status === 'completed' ? 'bg-success-light' : 'bg-teal-500')} style={{ width: `${rev.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 opacity-70" /> Due: {new Date(rev.dueDate).toLocaleDateString()}
                </div>
                {rev.status === 'ongoing' ? (
                  <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10">Resume Workspace</Button>
                ) : rev.status === 'completed' ? (
                  <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5">View Audit Log</Button>
                ) : (
                  <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5"><Play className="w-3 h-3 mr-1.5" /> Start Review</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Active Campaign Workspace */}
      {activeCampaign && activeCampaign.status !== 'completed' && (
        <Card className="flex-1 mt-6 border-white/[0.06] shadow-glass bg-surface-dark flex flex-col overflow-hidden relative">
          <div className="border-b border-white/[0.04] p-5 bg-gradient-to-r from-teal-900/20 to-transparent flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Workspace: <span className="text-teal-400">{activeCampaign.title}</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">Review the identities below and certify their continued access rights.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoadingIdentities || isRefetchingIdentities}>
              <RefreshCw className={cn("w-4 h-4 text-gray-400", isRefetchingIdentities && "animate-spin text-teal-400")} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto relative min-h-[300px]">
            {isLoadingIdentities ? (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-dark/50 backdrop-blur-sm z-20">
                <Spinner size="md" />
              </div>
            ) : identities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <CheckCircle2 className="w-12 h-12 text-success-light/50 mb-4" />
                <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-md">There are no more identities left to review in this campaign. You can close the campaign or generate a report.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-black/40 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                  <tr>
                    <th className="py-4 pl-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Identity</th>
                    <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Granted Access</th>
                    <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">Telemetry Analytics</th>
                    <th className="py-4 px-4 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">AI Suggestion</th>
                    <th className="py-4 pr-6 text-gray-400 font-semibold uppercase text-[11px] tracking-wider text-right">Certification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {identities.map((identity) => {
                    const status = localStatuses[identity.id] || identity.status;
                    return (
                      <tr key={identity.id} className={cn(
                        "transition-all duration-300",
                        status === 'approved' ? 'bg-success/5 border-l-2 border-l-success' : 
                        status === 'revoked' ? 'bg-emergency/5 border-l-2 border-l-emergency' : 
                        'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                      )}>
                        <td className="py-5 pl-6">
                          <p className="font-bold text-white text-[15px]">{identity.name}</p>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{identity.department}</p>
                        </td>
                        <td className="py-5 px-4">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-blue-200 font-mono text-xs">{identity.currentRole}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="text-xs text-gray-400 space-y-1.5 font-medium">
                            <p>Last Login: <span className="text-gray-200">{new Date(identity.lastLogin).toLocaleDateString()}</span></p>
                            <p>Risk Score: <span className={cn(
                              "font-bold ml-1",
                              identity.riskScore === 'High' ? 'text-emergency-light' : identity.riskScore === 'Medium' ? 'text-warning-light' : 'text-success-light'
                            )}>{identity.riskScore}</span></p>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-start gap-2.5 max-w-[280px] p-2.5 rounded-lg bg-black/20 border border-white/5">
                            {identity.recommendation === 'Approve' ? (
                              <CheckCircle2 className="w-4 h-4 text-success-light flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-emergency-light flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className={cn(
                                "text-[11px] font-bold uppercase tracking-wider block mb-1",
                                identity.recommendation === 'Approve' ? 'text-success-light' : 'text-emergency-light'
                              )}>Recommend {identity.recommendation}</span>
                              <p className="text-[11px] text-gray-400 leading-relaxed">{identity.rationale}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 pr-6 text-right align-middle">
                          {status ? (
                            <div className="flex justify-end animate-in fade-in zoom-in duration-300">
                              <Badge variant="outline" className={cn(
                                "border-none px-3.5 py-2 shadow-inner",
                                status === 'approved' ? 'text-success-light bg-success/15 shadow-success/10' : 'text-emergency-light bg-emergency/15 shadow-emergency/10'
                              )}>
                                {status === 'approved' ? 'ACCESS MAINTAINED' : 'ACCESS REVOKED'}
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2.5">
                              <Button 
                                onClick={() => handleAction(identity.id, 'approved')}
                                size="sm" variant="outline" className="h-9 border-success/30 text-success-light hover:bg-success/10 hover:border-success/50 transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4 mr-1.5" /> Maintain
                              </Button>
                              <Button 
                                onClick={() => handleAction(identity.id, 'revoked')}
                                size="sm" variant="outline" className="h-9 border-emergency/30 text-emergency-light hover:bg-emergency/10 hover:border-emergency/50 transition-colors"
                              >
                                <UserX className="w-4 h-4 mr-1.5" /> Revoke
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
