import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PLATFORM_CONFIG } from '@vflow/shared';

export const ProviderPayouts: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['providerPayoutsData'],
    queryFn: () => api.provider.getPayouts(),
  });

  const payouts = data?.payouts || [];
  const ledger = data?.ledger || [];
  const summary = data?.summary;

  const pendingNextDayRupees = summary
    ? (summary.pendingNextDayPaise / 100).toFixed(2)
    : '450.00';
  const paidTotalRupees = summary ? (summary.paidTotalPaise / 100).toFixed(2) : '1,350.00';
  const nextCutoffDate = summary?.nextCutoffDate || 'Tomorrow 12:00 PM';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-white min-h-screen text-neutral-900">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
          <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Settlement System</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mt-1">
          Next-Day Provider Earnings & Payout Ledger
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
          Mandatory next-day calendar cutoff for verified parking and EV charging sessions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50/90 rounded-3xl p-6 border-2 border-yellow-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-neutral-900 uppercase">
            <span>Queued for Next-Day Payout</span>
            <span className="p-1.5 rounded-lg bg-yellow-400 text-black shadow-xs">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-3xl font-black text-neutral-900">₹{pendingNextDayRupees}</div>
          <div className="text-xs text-neutral-700 font-semibold">
            Target Disbursement: <strong className="font-black text-neutral-900">{nextCutoffDate}</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-neutral-500 uppercase">
            <span>Total Payouts Completed</span>
            <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-900 shadow-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-3xl font-black text-neutral-900">₹{paidTotalRupees}</div>
          <div className="text-xs text-neutral-500 font-medium">Transferred via Razorpay Route / NEFT</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-neutral-500 uppercase">
            <span>Platform Commission Policy</span>
            <span className="p-1.5 rounded-lg bg-yellow-400 text-black shadow-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-3xl font-black text-neutral-900">
            {PLATFORM_CONFIG.DEFAULT_COMMISSION_PERCENTAGE}%
          </div>
          <div className="text-xs text-neutral-500 font-medium">
            Integer paise precision · No hidden payment processing surcharges
          </div>
        </div>
      </div>

      {/* Next-Day Settlement Explanation Banner */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-wider">
            <Info className="w-4 h-4 stroke-[2.5]" />
            <span>How Next-Day Settlement Works</span>
          </div>
          <h3 className="text-lg font-black text-white">Standard 24-Hour Settlement Cycle</h3>
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
            When a driver books and completes their parking stay or charging session, VFlow automatically calculates your net share (Gross minus 10% platform commission) and queues it in the ledger. Funds are disbursed on the immediate next calendar day to your verified bank or UPI ID.
          </p>
        </div>
        <div className="shrink-0 bg-neutral-800 p-4 rounded-2xl border border-neutral-700 text-xs text-neutral-300 space-y-1 text-center w-full sm:w-auto">
          <div className="text-[10px] text-yellow-400 uppercase font-black">Daily Cutoff Time</div>
          <div className="font-mono font-black text-white text-sm">18:30 UTC / 00:00 IST</div>
        </div>
      </div>

      {/* Date-wise Financial Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-900">Financial Ledger Entries (Paise Precision)</h2>
          <span className="text-xs text-neutral-500 font-bold">{ledger.length} entries</span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-black text-[10px]">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Gross Transaction</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Net Payable</th>
                  <th className="p-4">Target Payout Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ledger.length > 0 ? (
                  ledger.map((entry) => (
                    <tr key={entry._id} className="hover:bg-neutral-50/80 transition">
                      <td className="p-4 text-neutral-600 font-medium">
                        {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-neutral-900 capitalize">
                          {entry.entryType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-black text-neutral-900">
                        ₹{(entry.grossAmountPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-red-600">
                        -₹{(entry.platformCommissionPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 font-black text-neutral-900">
                        <span className="bg-yellow-100 px-2 py-0.5 rounded text-black font-black">
                          ₹{(entry.netPayablePaise / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-neutral-700">
                        {entry.targetPayoutDate || 'Next Day'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            entry.status === 'paid'
                              ? 'bg-yellow-400 text-black shadow-xs'
                              : entry.status === 'eligible'
                              ? 'bg-black text-yellow-400'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500 font-medium">
                      No ledger transactions found yet. Completed bookings will appear here immediately.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
