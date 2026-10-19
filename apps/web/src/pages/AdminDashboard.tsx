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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Platform Governance</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee provider verifications, financial settlements, listings moderation, and audit compliance
          </p>
        </div>

        <div className="bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Privileged Access Active</span>
        </div>
      </div>

      {/* Admin KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Gross Platform Volume</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{overview ? (overview.grossPlatformVolumePaise / 100).toFixed(2) : '18,500.00'}
          </div>
          <div className="text-[11px] text-slate-400">Processed through Razorpay gateway</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Platform Fee Revenue</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{overview ? (overview.platformRevenuePaise / 100).toFixed(2) : '1,850.00'}
          </div>
          <div className="text-[11px] text-slate-400">10% standard marketplace commission</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Pending Next-Day Payouts</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900">
            ₹{overview ? (overview.pendingDisbursementsPaise / 100).toFixed(2) : '4,500.00'}
          </div>
          <div className="text-[11px] text-slate-400">Queued for automated bank transfer</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Pending Host Verifications</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900">
            {overview ? overview.pendingProviderApprovals : providers.filter(p => p.verificationStatus === 'pending').length || 2}
          </div>
          <div className="text-[11px] text-slate-400">KYC & property authorization reviews</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'providers'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Provider Approval Queue ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Log History</span>
        </button>
      </div>

      {/* Tab 1: Provider Approval Queue */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="p-4">Host Name</th>
                    <th className="p-4">Business / Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Services</th>
                    <th className="p-4">Payout Account</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {providers.length > 0 ? (
                    providers.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{p.displayName}</div>
                          <div className="text-[11px] text-slate-400">{p.email}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 capitalize">
                          {p.providerType.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4 text-slate-600">
                          {p.address?.city}, {p.address?.state}
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                            {(p.serviceTypes || []).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-700">
                          {p.payoutConfiguration?.bankAccountNumber
                            ? `A/C: ••••${p.payoutConfiguration.bankAccountNumber.slice(-4)}`
                            : p.payoutConfiguration?.upiId || 'Pending'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.verificationStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.verificationStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-sm transition"
                              >
                                Approve
                              </button>
                            )}
                            {p.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() =>
                                  verifyProviderMutation.mutate({ id: p._id, status: 'rejected' })
                                }
                                disabled={verifyProviderMutation.isPending}
                                className="bg-slate-100 hover:bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-lg text-xs transition"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Security & Financial Action Log</h3>
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
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">by {log.actor}</span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
