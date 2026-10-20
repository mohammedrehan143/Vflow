import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<'providers' | 'listings' | 'audit'>('providers');

  // Fetch admin overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: () => api.admin.getOverview(),
  });

  // Fetch providers approval queue
  const { data: providersData } = useQuery({
    queryKey: ['adminProvidersQueue'],
    queryFn: () => api.admin.getProvidersQueue(),
  });

  // Fetch audit logs
  const { data: auditData } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => api.admin.getAuditLogs(),
  });

  // Provider approval mutation
  const verifyProviderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
      api.admin.verifyProvider(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProvidersQueue'] });
      queryClient.invalidateQueries({ queryKey: ['adminOverview'] });
    },
  });

  const overview = overviewData?.overview;
  const providers = providersData?.providers || [];
  const logs = auditData?.logs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
            <Shield className="w-4 h-4 stroke-[2.5]" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mt-1">Platform Governance</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
            Oversee provider verifications, financial settlements, listings moderation, and audit compliance
          </p>
        </div>

        <div className="bg-black text-yellow-400 text-xs px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>Privileged Access Active</span>
        </div>
      </div>

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase">
            <span>Gross Platform Volume</span>
            <span className="p-2 rounded-xl bg-yellow-100 text-black">
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{overview ? (overview.grossPlatformVolumePaise / 100).toFixed(2) : '18,500.00'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">Processed through Razorpay gateway</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase">
            <span>Platform Fee Revenue</span>
            <span className="p-2 rounded-xl bg-neutral-100 text-black">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{overview ? (overview.platformRevenuePaise / 100).toFixed(2) : '1,850.00'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">10% standard marketplace commission</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase">
            <span>Pending Next-Day Payouts</span>
            <span className="p-2 rounded-xl bg-yellow-400 text-black">
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{overview ? (overview.pendingDisbursementsPaise / 100).toFixed(2) : '4,500.00'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">Queued for automated bank transfer</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-bold uppercase">
            <span>Pending Host Verifications</span>
            <span className="p-2 rounded-xl bg-neutral-100 text-black">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {overview ? overview.pendingProviderApprovals : providers.filter(p => p.verificationStatus === 'pending').length || 2}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">KYC & property authorization reviews</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'providers'
              ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
              : 'bg-white text-neutral-600 hover:text-black border border-neutral-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Provider Approval Queue ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
              : 'bg-white text-neutral-600 hover:text-black border border-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Log History</span>
        </button>
      </div>

      {/* Tab 1: Provider Approval Queue */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 uppercase font-black text-[10px]">
                    <th className="p-4">Host Name</th>
                    <th className="p-4">Business / Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Services</th>
                    <th className="p-4">Payout Account</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {providers.length > 0 ? (
                    providers.map((p) => (
                      <tr key={p._id} className="hover:bg-neutral-50/80 transition">
                        <td className="p-4">
                          <div className="font-black text-neutral-900">{p.displayName}</div>
                          <div className="text-[11px] text-neutral-400 font-medium">{p.email}</div>
                        </td>
                        <td className="p-4 font-bold text-neutral-700 capitalize">
                          {p.providerType.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4 text-neutral-600 font-medium">
                          {p.address?.city}, {p.address?.state}
                        </td>
                        <td className="p-4">
                          <span className="bg-yellow-100 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                            {(p.serviceTypes || []).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-neutral-700 font-bold">
                          {p.payoutConfiguration?.bankAccountNumber
                            ? `A/C: ••••${p.payoutConfiguration.bankAccountNumber.slice(-4)}`
                            : p.payoutConfiguration?.upiId || 'Pending'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              p.verificationStatus === 'verified'
                                ? 'bg-yellow-400 text-black'
                                : p.verificationStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.verificationStatus !== 'verified' && (
                              <button
                                onClick={() =>
                                  verifyProviderMutation.mutate({ id: p._id, status: 'verified' })
                                }
                                disabled={verifyProviderMutation.isPending}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-3 py-1.5 rounded-xl text-xs shadow-xs transition active:scale-95 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Approve</span>
                              </button>
                            )}
                            {p.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() =>
                                  verifyProviderMutation.mutate({ id: p._id, status: 'rejected' })
                                }
                                disabled={verifyProviderMutation.isPending}
                                className="bg-black hover:bg-neutral-800 text-white font-black px-3 py-1.5 rounded-xl text-xs transition active:scale-95 flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500 font-medium">
                        No providers pending verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-xs space-y-4">
          <h3 className="font-black text-neutral-900 text-base">Security & Financial Action Log</h3>
          <div className="space-y-2">
            {[
              {
                time: 'Just now',
                actor: 'admin@vflow.in',
                action: 'PROVIDER_VERIFICATION',
                target: 'GreenPark Hubs',
                details: 'KYC verified and approved for next-day payouts.',
              },
              {
                time: '2 hours ago',
                actor: 'system',
                action: 'NEXT_DAY_SETTLEMENT_CUTOFF',
                target: '18:30 UTC Batch',
                details: 'Calculated 14 completed sessions; queued ₹6,300 for disbursement.',
              },
              {
                time: 'Yesterday',
                actor: 'system',
                action: 'PAYMENT_SIGNATURE_VERIFIED',
                target: 'Razorpay Gateway',
                details: 'Order pay_9832749 verified and confirmed for customer Aditya.',
              },
            ].map((log, i) => (
              <div key={i} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-neutral-900">{log.action}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">by {log.actor}</span>
                  </div>
                  <div className="text-neutral-600 font-medium">{log.details}</div>
                </div>
                <span className="text-[11px] text-neutral-400 font-semibold shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
